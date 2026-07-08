import RunForm from "@/components/RunForm";

export default function NewRunPage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="eyebrow text-gold">Transition zone</div>
        <h1 className="display mt-1 text-4xl uppercase italic leading-none">Log run</h1>
      </div>
      <RunForm runId={null} submitLabel="Save run" />
    </div>
  );
}
