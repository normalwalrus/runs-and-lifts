import ExerciseLibrary from "@/components/ExerciseLibrary";

export default function ExercisesPage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="eyebrow text-gold">Station setup</div>
        <h1 className="display mt-1 text-5xl uppercase italic leading-none">
          Exercises
        </h1>
        <div className="chevrons mt-3 w-24" aria-hidden />
      </div>
      <ExerciseLibrary />
    </div>
  );
}
