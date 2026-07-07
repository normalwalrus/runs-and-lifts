import puppeteer from "puppeteer-core";

const BASE = "http://localhost:3199";
const SHOTS = process.env.SHOTS_DIR ?? "/tmp";
const results = [];
const ok = (name) => { results.push(`PASS ${name}`); console.log(`PASS ${name}`); };
const fail = (name, detail) => { results.push(`FAIL ${name}: ${detail}`); console.log(`FAIL ${name}: ${detail}`); };

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
page.on("dialog", (d) => d.accept());

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const waitPath = async (path, timeout = 10000) => {
  await page.waitForFunction((p) => location.pathname === p, { timeout }, path);
};
const bodyText = () => page.evaluate(() => document.body.innerText);
const clearAndType = async (el, text) => {
  // React-safe replace: use the native value setter, then fire an input event
  await el.evaluate((node, v) => {
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set;
    setter.call(node, v);
    node.dispatchEvent(new Event("input", { bubbles: true }));
  }, text);
};
const clickByText = async (selector, text) => {
  const clicked = await page.evaluate((sel, txt) => {
    const els = [...document.querySelectorAll(sel)];
    const el = els.find((e) => e.innerText.trim() === txt || e.innerText.includes(txt));
    if (el) { el.click(); return true; }
    return false;
  }, selector, text);
  if (!clicked) throw new Error(`no element ${selector} with text "${text}"`);
};

try {
  // 1. wrong password
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle0" });
  await page.type('input[name="password"]', "wrongpass");
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => document.body.innerText.includes("Incorrect password"), { timeout: 8000 });
  ok("wrong password shows error");

  // 2. correct password
  await clearAndType(await page.$('input[name="password"]'), "changeme");
  await page.click('button[type="submit"]');
  await waitPath("/");
  ok("login redirects to dashboard");

  // 3. create run 5km 25:00 — check live preview
  await page.goto(`${BASE}/runs/new`, { waitUntil: "networkidle0" });
  await page.type('input[name="distanceKm"]', "5");
  await page.type('input[name="minutes"]', "25");
  await sleep(200);
  const preview = await bodyText();
  if (preview.includes("5:00 /km") && preview.includes("12.0 km/h")) ok("run preview: 5:00 /km, 12.0 km/h");
  else fail("run preview", preview.match(/Pace.*|Speed.*/g)?.join(" ") ?? "no preview found");
  await page.type('textarea[name="notes"]', "morning jog");
  await page.click('button[type="submit"]');
  await waitPath("/runs");
  await page.waitForFunction(() => document.body.innerText.includes("morning jog"), { timeout: 8000 });
  ok("run created and listed");

  // 3b. second run on an earlier date (gives trend charts a line)
  await page.goto(`${BASE}/runs/new`, { waitUntil: "networkidle0" });
  await clearAndType(await page.$('input[name="date"]'), "2026-07-01");
  await page.type('input[name="distanceKm"]', "8");
  await page.type('input[name="minutes"]', "45");
  await page.click('button[type="submit"]');
  await waitPath("/runs");
  await page.waitForFunction(() => document.body.innerText.includes("8 km"), { timeout: 8000 });
  ok("second run created (8 km, 1 Jul)");

  // 4. validation probe: 0 distance
  await page.goto(`${BASE}/runs/new`, { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    const el = document.querySelector('input[name="distanceKm"]');
    el.removeAttribute("min"); // bypass client validation to test server side
  });
  await page.type('input[name="distanceKm"]', "0");
  await page.type('input[name="minutes"]', "10");
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => document.body.innerText.includes("Distance must be greater than 0"), { timeout: 8000 });
  ok("server rejects 0 km run");

  // 5. edit run: 5 -> 10 km
  await page.goto(`${BASE}/runs`, { waitUntil: "networkidle0" });
  await clickByText("a", "Edit");
  await page.waitForSelector('input[name="distanceKm"]');
  await clearAndType(await page.$('input[name="distanceKm"]'), "10");
  await page.click('button[type="submit"]');
  await waitPath("/runs");
  await page.waitForFunction(() => document.body.innerText.includes("10 km"), { timeout: 8000 });
  const runText = await bodyText();
  if (runText.includes("2:30 /km")) ok("run edited, pace recomputed to 2:30 /km");
  else fail("run edit pace", runText.slice(0, 400));

  // 6. create workout: Bench 60x5, 70x5, 80x3 + Squat 100x5
  await page.goto(`${BASE}/workouts/new`, { waitUntil: "networkidle0" });
  await page.type('input[placeholder="Push Day"]', "Test Push Day");
  await page.select("select", await page.evaluate(() => {
    const opt = [...document.querySelector("select").options].find((o) => o.text === "Bench Press");
    return opt.value;
  }));
  const setInputs = async () => page.$$('input[aria-label$="weight"], input[aria-label$="reps"]');
  let inputs = await setInputs();
  await inputs[0].type("60"); await inputs[1].type("5");
  await clickByText("button", "+ Add set");
  await sleep(100);
  // set 2 should have copied 60/5 — change weight to 70
  const copied = await page.evaluate(() => document.querySelector('input[aria-label="Set 2 weight"]')?.value);
  if (copied === "60") ok("add set copies previous weight");
  else fail("add set copy", `set 2 weight = ${copied}`);
  await clearAndType(await page.$('input[aria-label="Set 2 weight"]'), "70");
  await clickByText("button", "+ Add set");
  await sleep(100);
  await clearAndType(await page.$('input[aria-label="Set 3 weight"]'), "80");
  await clearAndType(await page.$('input[aria-label="Set 3 reps"]'), "3");
  // second exercise: Squat 100x5
  await clickByText("button", "+ Add exercise");
  await sleep(100);
  await page.evaluate(() => {
    const sel = [...document.querySelectorAll("select")][1];
    const opt = [...sel.options].find((o) => o.text === "Squat");
    sel.value = opt.value;
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  });
  const blocks = await page.$$('input[aria-label="Set 1 weight"]');
  await blocks[1].type("100");
  const repBlocks = await page.$$('input[aria-label="Set 1 reps"]');
  await repBlocks[1].type("5");
  await page.screenshot({ path: `${SHOTS}/workout-form.png` });
  await clickByText('button[type="submit"]', "Save workout");
  await waitPath("/workouts");
  await page.waitForFunction(() => document.body.innerText.includes("Test Push Day"), { timeout: 8000 });
  const wlist = await bodyText();
  if (wlist.includes("2 exercises") && wlist.includes("4 sets") && wlist.includes("1390 kg"))
    ok("workout listed: 2 exercises, 4 sets, 1390 kg volume");
  else fail("workout list summary", wlist.slice(0, 500));

  // 7. detail shows per-set weights
  await clickByText("a", "Test Push Day");
  await page.waitForFunction(() => document.body.innerText.includes("Bench Press"), { timeout: 8000 });
  const detail = await bodyText();
  if (detail.includes("60 kg") && detail.includes("70 kg") && detail.includes("80 kg") && detail.includes("100 kg"))
    ok("detail shows varying set weights 60/70/80 + 100");
  else fail("workout detail", detail.slice(0, 600));

  // 8. edit workout: squat 100 -> 105
  await clickByText("a", "Edit");
  await page.waitForSelector('input[aria-label="Set 1 weight"]');
  const sq = (await page.$$('input[aria-label="Set 1 weight"]'))[1];
  await clearAndType(sq, "105");
  await clickByText('button[type="submit"]', "Save changes");
  await waitPath("/workouts");
  await sleep(300);
  await clickByText("a", "Test Push Day");
  await page.waitForFunction(() => document.body.innerText.includes("105 kg"), { timeout: 8000 });
  ok("workout edit persists (100 -> 105 kg)");

  // 9. exercises: add, rename, blocked delete, clean delete
  await page.goto(`${BASE}/exercises`, { waitUntil: "networkidle0" });
  await page.type('input[name="name"]', "Cable Fly");
  await clickByText('button[type="submit"]', "Add");
  await page.waitForFunction(() => document.body.innerText.includes("Cable Fly"), { timeout: 8000 });
  ok("exercise added");
  // duplicate add probe
  await page.type('input[name="name"]', "Cable Fly");
  await clickByText('button[type="submit"]', "Add");
  await page.waitForFunction(() => document.body.innerText.includes("already exists"), { timeout: 8000 });
  ok("duplicate exercise rejected");
  // blocked delete: Bench Press is used
  await page.evaluate(() => {
    const li = [...document.querySelectorAll("li")].find((l) => l.innerText.includes("Bench Press"));
    const btn = [...li.querySelectorAll("button")].find((b) => b.innerText === "Delete");
    btn.click();
  });
  await page.waitForFunction(() => document.body.innerText.includes("can't be deleted"), { timeout: 8000 });
  ok("deleting in-use exercise blocked with message");
  // clean delete Cable Fly
  await page.evaluate(() => {
    const li = [...document.querySelectorAll("li")].find((l) => l.innerText.includes("Cable Fly"));
    const btn = [...li.querySelectorAll("button")].find((b) => b.innerText === "Delete");
    btn.click();
  });
  // the add form's "already exists" error text also contains "Cable Fly", so check links only
  await page.waitForFunction(
    () => ![...document.querySelectorAll("a")].some((a) => a.innerText.trim() === "Cable Fly"),
    { timeout: 8000 }
  );
  ok("unused exercise deleted");

  // 10. dashboard PRs
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
  const dash = await bodyText();
  if (dash.includes("2:30 /km") && dash.includes("105 kg") && dash.includes("Squat"))
    ok("dashboard PRs: fastest pace 2:30 /km, Squat 105 kg");
  else fail("dashboard PRs", dash.slice(0, 700));
  await page.screenshot({ path: `${SHOTS}/dashboard.png` });

  // 11. progress charts render
  await page.goto(`${BASE}/progress`, { waitUntil: "networkidle0" });
  await sleep(500);
  const paths = await page.$$eval("svg path.recharts-curve", (els) => els.length);
  const dots = await page.$$eval("svg .recharts-line-dots circle", (els) => els.length);
  if (paths >= 2 && dots >= 1)
    ok(`progress charts render (${paths} lines, ${dots} dots; single-point chart shows dot)`);
  else fail("progress charts", `${paths} curves, ${dots} dots`);
  // switch exercise
  await page.evaluate(() => {
    const sel = document.querySelector('select[aria-label="Choose exercise"]');
    const opt = [...sel.options].find((o) => o.text === "Squat");
    sel.value = opt.value;
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.waitForFunction(() => document.body.innerText.includes("Squat (top set kg)") || document.body.innerText.includes("— Squat"), { timeout: 8000 });
  ok("exercise picker switches progression chart");
  await page.screenshot({ path: `${SHOTS}/progress.png` });

  // 12. exercise detail page
  await page.goto(`${BASE}/exercises`, { waitUntil: "networkidle0" });
  await clickByText("a", "Bench Press");
  await page.waitForFunction(
    () => document.body.innerText.toLowerCase().includes("heaviest set"),
    { timeout: 8000 }
  );
  const exDetail = await bodyText();
  if (exDetail.includes("80 kg × 3")) ok("exercise detail: heaviest set 80 kg × 3");
  else fail("exercise detail", exDetail.slice(0, 500));

  // 13. mobile viewport
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`${BASE}/workouts/new`, { waitUntil: "networkidle0" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  if (!overflow) ok("mobile 390px: no horizontal overflow on workout form");
  else fail("mobile overflow", "horizontal scroll present");
  const navVisible = await page.evaluate(() => {
    const nav = [...document.querySelectorAll("nav")].find((n) => getComputedStyle(n).position === "fixed");
    return !!nav && nav.getBoundingClientRect().bottom <= window.innerHeight;
  });
  if (navVisible) ok("mobile bottom nav visible");
  else fail("mobile nav", "no fixed bottom nav found");
  await page.screenshot({ path: `${SHOTS}/mobile-workout-form.png` });
  await page.setViewport({ width: 1280, height: 900 });

  // 14. delete run + workout (confirm dialog auto-accepted)
  await page.goto(`${BASE}/runs`, { waitUntil: "networkidle0" });
  await clickByText("button", "Delete");
  await page.waitForFunction(() => !document.body.innerText.includes("morning jog"), { timeout: 8000 });
  ok("first run deleted (confirm dialog accepted)");
  await clickByText("button", "Delete");
  await page.waitForFunction(() => document.body.innerText.includes("No runs yet"), { timeout: 8000 });
  ok("second run deleted, empty state shows");
  await page.goto(`${BASE}/workouts`, { waitUntil: "networkidle0" });
  await clickByText("a", "Test Push Day");
  await page.waitForFunction(() => document.body.innerText.includes("Bench Press"), { timeout: 8000 });
  await clickByText("button", "Delete");
  await waitPath("/workouts");
  await page.waitForFunction(() => document.body.innerText.includes("No workouts yet"), { timeout: 8000 });
  ok("workout deleted, cascades");

  // 15. logout
  await clickByText("button", "Log out");
  await waitPath("/login");
  ok("logout redirects to login");
  await page.goto(`${BASE}/runs`, { waitUntil: "networkidle0" });
  if (page.url().endsWith("/login")) ok("post-logout access redirects to login");
  else fail("post-logout", page.url());
} catch (e) {
  fail("SCRIPT ERROR", e.message);
  await page.screenshot({ path: `${SHOTS}/error.png` }).catch(() => {});
}

await browser.close();
console.log("\n=== SUMMARY ===");
for (const r of results) console.log(r);
process.exit(results.some((r) => r.startsWith("FAIL")) ? 1 : 0);
