import RunForm from "@/components/RunForm";
import { createRun } from "../actions";

export default function NewRunPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Log run</h1>
      <RunForm action={createRun} submitLabel="Save run" />
    </div>
  );
}
