import RunForm from "@/components/RunForm";

export default function NewRunPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Log run</h1>
      <RunForm runId={null} submitLabel="Save run" />
    </div>
  );
}
