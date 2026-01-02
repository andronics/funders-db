export function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      {/* Toggle switch */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? 'bg-brand-accent' : 'bg-brand-border'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>

      {/* Label */}
      <span className="text-sm text-brand-text">{label}</span>
    </label>
  );
}
