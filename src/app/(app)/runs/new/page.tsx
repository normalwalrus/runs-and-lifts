import RunForm from "@/components/RunForm";
import { createRun } from "../actions";

export default function NewRunPage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="eyebrow text-gold">Transition zone</div>
        <h1 className="display mt-1 text-4xl uppercase italic leading-none">Log run</h1>
      </div>
      <RunForm action={createRun} submitLabel="Save run" />
    </div>
  );
}
