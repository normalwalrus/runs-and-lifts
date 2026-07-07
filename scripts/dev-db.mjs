// Local dev database: embedded Postgres (PGlite) served over the PG wire
// protocol, so the app's normal `pg` driver connects to it unchanged.
// Data persists in ./data/pglite. Point DATABASE_URL at
// postgres://postgres:postgres@127.0.0.1:5433/postgres and keep this running.
import { mkdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const PORT = Number(process.env.DEV_DB_PORT || 5433);

mkdirSync("data", { recursive: true });
const db = await PGlite.create("./data/pglite");

// Mirrors src/db/schema.ts (drizzle-kit push can't reach PGlite before this
// server is up, so the schema is created here instead).
await db.exec(`
CREATE TABLE IF NOT EXISTS runs (
  id serial PRIMARY KEY,
  date date NOT NULL,
  distance_km real NOT NULL,
  duration_sec integer NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS exercises (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS workout_sessions (
  id serial PRIMARY KEY,
  date date NOT NULL,
  name text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS session_exercises (
  id serial PRIMARY KEY,
  session_id integer NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id integer NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  position integer NOT NULL
);
CREATE TABLE IF NOT EXISTS sets (
  id serial PRIMARY KEY,
  session_exercise_id integer NOT NULL REFERENCES session_exercises(id) ON DELETE CASCADE,
  position integer NOT NULL,
  weight_kg real NOT NULL,
  reps integer NOT NULL
);

INSERT INTO exercises (name) VALUES
  ('Squat'), ('Bench Press'), ('Deadlift'), ('Overhead Press'),
  ('Barbell Row'), ('Pull-up'), ('Dumbbell Curl'), ('Romanian Deadlift'),
  ('Incline Bench Press'), ('Lat Pulldown'), ('Leg Press'), ('Dips')
ON CONFLICT (name) DO NOTHING;
`);

const server = new PGLiteSocketServer({ db, port: PORT, host: "127.0.0.1" });
await server.start();
console.log(
  `Local Postgres (PGlite) ready on postgres://postgres:postgres@127.0.0.1:${PORT}/postgres`
);
console.log("Data lives in ./data/pglite — keep this process running while you use the app.");
