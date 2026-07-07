import { db } from "../src/db";
import { exercises } from "../src/db/schema";

const DEFAULT_EXERCISES = [
  "Squat",
  "Bench Press",
  "Deadlift",
  "Overhead Press",
  "Barbell Row",
  "Pull-up",
  "Dumbbell Curl",
  "Romanian Deadlift",
  "Incline Bench Press",
  "Lat Pulldown",
  "Leg Press",
  "Dips",
];

async function main() {
  for (const name of DEFAULT_EXERCISES) {
    await db.insert(exercises).values({ name }).onConflictDoNothing();
  }
  console.log(`Seeded ${DEFAULT_EXERCISES.length} exercises (existing ones skipped).`);
  process.exit(0);
}

main();
