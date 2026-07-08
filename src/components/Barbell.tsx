/** Decorative loaded barbell, side-on: sleeve, 25 kg (red), 20 kg (blue), shaft. */
export default function Barbell({ className }: { className?: string }) {
  return (
    <span className={`barbell ${className ?? ""}`} aria-hidden>
      <i className="bb-stub" />
      <i className="bb-25" />
      <i className="bb-20" />
      <i className="bb-shaft" />
      <i className="bb-20" />
      <i className="bb-25" />
      <i className="bb-stub" />
    </span>
  );
}
