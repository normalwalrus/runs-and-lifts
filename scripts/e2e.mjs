import puppeteer from "puppeteer-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3199/runs-and-lifts";
const results = [];
const ok = (n) => { results.push(`PASS ${n}`); console.log(`PASS ${n}`); };
const fail = (n, d) => { results.push(`FAIL ${n}: ${d}`); console.log(`FAIL ${n}: ${d}`); };

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
page.on("dialog", (d) => d.accept());
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const bodyText = () => page.evaluate(() => document.body.innerText);
const clickByText = async (sel, text) => {
  await page.evaluate((s, t) => {
    const el = [...document.querySelectorAll(s)].find((e) => e.innerText.includes(t));
    if (el) el.click(); else throw new Error(`no ${s} "${t}"`);
  }, sel, text);
};

try {
  // fresh state
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle0" });
  await sleep(300);
  const dash = await bodyText();
  if (dash.includes("Log some runs and workouts")) ok("fresh dashboard shows empty state");
  else fail("fresh dashboard", dash.slice(0, 200));

  // create run
  await page.goto(`${BASE}/runs/new`, { waitUntil: "networkidle0" });
  await page.type('input[inputmode="decimal"]', "5");
  await page.type('input[aria-label="Minutes"]', "25");
  await sleep(200);
  const prev = await bodyText();
  if (prev.includes("5:00 /km") && prev.includes("12.0 km/h")) ok("run preview live-calculates");
  else fail("run preview", prev.match(/Pace.*/)?.[0] ?? "none");
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => location.pathname.endsWith("/runs"), { timeout: 8000 });
  await page.waitForFunction(() => document.body.innerText.includes("5 km"), { timeout: 8000 });
  ok("run created");

  // persistence across reload
  await page.reload({ waitUntil: "networkidle0" });
  await sleep(400);
  if ((await bodyText()).includes("5 km")) ok("run persists after reload (localStorage)");
  else fail("persistence", "run gone after reload");

  // workout with varying weights
  await page.goto(`${BASE}/workouts/new`, { waitUntil: "networkidle0" });
  await page.type('input[placeholder="Push Day"]', "Test Push Day");
  await page.evaluate(() => {
    const sel = document.querySelector("select");
    const opt = [...sel.options].find((o) => o.text === "Bench Press");
    sel.value = opt.value;
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.type('input[aria-label="Set 1 weight"]', "60");
  await page.type('input[aria-label="Set 1 reps"]', "5");
  await clickByText("button", "+ Add set");
  await sleep(100);
  const copied = await page.$eval('input[aria-label="Set 2 weight"]', (el) => el.value);
  if (copied === "60") ok("add set copies previous");
  else fail("add set copy", copied);
  // change set 2 to 70 via native setter
  await page.$eval('input[aria-label="Set 2 weight"]', (el) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(el, "70");
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await clickByText('button[type="submit"]', "Save workout");
  await page.waitForFunction(() => location.pathname.endsWith("/workouts"), { timeout: 8000 });
  await page.waitForFunction(() => document.body.innerText.includes("Test Push Day"), { timeout: 8000 });
  const wl = await bodyText();
  if (wl.includes("1 exercise") && wl.includes("2 sets") && wl.includes("650 kg")) ok("workout listed: 650 kg volume");
  else fail("workout list", wl.slice(0, 300));

  // detail
  await clickByText("a", "Test Push Day");
  await page.waitForFunction(() => document.body.innerText.includes("Bench Press"), { timeout: 8000 });
  const det = await bodyText();
  if (det.includes("60 kg") && det.includes("70 kg")) ok("detail shows per-set weights");
  else fail("detail", det.slice(0, 300));

  // validation: workout with no exercise
  await page.goto(`${BASE}/workouts/new`, { waitUntil: "networkidle0" });
  await clickByText("button", "Remove");
  await clickByText('button[type="submit"]', "Save workout");
  await sleep(400);
  if ((await bodyText()).includes("at least one exercise")) ok("zero-exercise workout rejected");
  else fail("zero-exercise", "no error shown");

  // exercises: dup + blocked delete
  await page.goto(`${BASE}/exercises`, { waitUntil: "networkidle0" });
  await page.type('input[placeholder="New exercise name"]', "bench press");
  await clickByText('button[type="submit"]', "Add");
  await sleep(300);
  if ((await bodyText()).includes("already exists")) ok("case-insensitive duplicate rejected");
  else fail("dup exercise", "no error");
  await page.evaluate(() => {
    const li = [...document.querySelectorAll("li")].find((l) => l.innerText.includes("Bench Press"));
    [...li.querySelectorAll("button")].find((b) => b.innerText === "Delete").click();
  });
  await sleep(300);
  if ((await bodyText()).includes("can't be deleted")) ok("in-use exercise delete blocked");
  else fail("blocked delete", "no error");

  // dashboard PRs
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
  await sleep(300);
  const d2 = await bodyText();
  if (d2.includes("5:00 /km") && d2.includes("70 kg") && d2.includes("Bench Press")) ok("dashboard PRs correct");
  else fail("dashboard PRs", d2.slice(0, 400));

  // charts
  await page.goto(`${BASE}/progress`, { waitUntil: "networkidle0" });
  await sleep(500);
  const dots = await page.$$eval("svg .recharts-line-dots circle", (els) => els.length);
  if (dots >= 2) ok(`charts render (${dots} dots)`);
  else fail("charts", `${dots} dots`);
  const p2 = await bodyText();
  if (p2.includes("Bench Press (top set kg)")) ok("progress defaults to trained exercise");
  else fail("progress default", p2.match(/Lifting progression.*/)?.[0] ?? "?");

  // backup export button exists; localStorage has data
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("runs-and-lifts:v1")));
  if (stored.runs.length === 1 && stored.workouts.length === 1) ok("localStorage holds 1 run + 1 workout");
  else fail("localStorage", JSON.stringify({ runs: stored.runs.length, workouts: stored.workouts.length }));

  // mobile
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`${BASE}/workouts/new`, { waitUntil: "networkidle0" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  if (!overflow) ok("mobile 390px: no horizontal overflow");
  else fail("mobile", "horizontal overflow");

  if (errors.length) fail("page errors", errors.join(" | "));
  else ok("no page crashes");
} catch (e) {
  fail("SCRIPT ERROR", e.message);
}

await browser.close();
console.log("\n=== SUMMARY ===");
for (const r of results) console.log(r);
process.exit(results.some((r) => r.startsWith("FAIL")) ? 1 : 0);
