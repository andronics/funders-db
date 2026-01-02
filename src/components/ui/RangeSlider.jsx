import { useState, useCallback, useEffect } from 'react';

// Internal slider uses 0-1000 for smooth dragging
const INTERNAL_MAX = 1000;

/**
 * Convert internal slider position (0-1) to actual value
 */
function positionToValue(position, min, max, logarithmic) {
  if (!logarithmic) {
    return min + position * (max - min);
  }
  // Log scale: min * (max/min)^position
  // Ensure min >= 1 for log scale
  const safeMin = Math.max(1, min);
  return safeMin * Math.pow(max / safeMin, position);
}

/**
 * Convert actual value to internal slider position (0-1)
 */
function valueToPosition(value, min, max, logarithmic) {
  if (!logarithmic) {
    return (value - min) / (max - min);
  }
  // Log scale: log(value/min) / log(max/min)
  const safeMin = Math.max(1, min);
  const safeValue = Math.max(safeMin, value);
  return Math.log(safeValue / safeMin) / Math.log(max / safeMin);
}

export function RangeSlider({
  label,
  min,
  max,
  valueMin,
  valueMax,
  onChange,
  formatValue = (v) => v,
  step = 1,
  logarithmic = false,
}) {
  // Use internal 0-INTERNAL_MAX range for smooth slider operation
  const valueToInternal = useCallback((val) => {
    const pos = valueToPosition(val, min, max, logarithmic);
    return Math.round(pos * INTERNAL_MAX);
  }, [min, max, logarithmic]);

  const internalToValue = useCallback((internal) => {
    const pos = internal / INTERNAL_MAX;
    const val = positionToValue(pos, min, max, logarithmic);
    // For non-log, snap to step; for log, round to reasonable precision
    if (!logarithmic) {
      return Math.round(val / step) * step;
    }
    // Round to 2 significant figures for log scale
    if (val >= 1000000) return Math.round(val / 100000) * 100000;
    if (val >= 100000) return Math.round(val / 10000) * 10000;
    if (val >= 10000) return Math.round(val / 1000) * 1000;
    if (val >= 1000) return Math.round(val / 100) * 100;
    if (val >= 100) return Math.round(val / 10) * 10;
    return Math.round(val);
  }, [min, max, step, logarithmic]);

  // Internal slider positions (0 to INTERNAL_MAX)
  const [internalMin, setInternalMin] = useState(() =>
    valueToInternal(valueMin ?? min)
  );
  const [internalMax, setInternalMax] = useState(() =>
    valueToInternal(valueMax ?? max)
  );
  const [isDragging, setIsDragging] = useState(false);

  // Sync from parent when not dragging
  useEffect(() => {
    if (!isDragging) {
      setInternalMin(valueToInternal(valueMin ?? min));
      setInternalMax(valueToInternal(valueMax ?? max));
    }
  }, [valueMin, valueMax, min, max, isDragging, valueToInternal]);

  const handleMinChange = useCallback((e) => {
    const newInternal = Math.min(Number(e.target.value), internalMax - 1);
    setInternalMin(newInternal);
  }, [internalMax]);

  const handleMaxChange = useCallback((e) => {
    const newInternal = Math.max(Number(e.target.value), internalMin + 1);
    setInternalMax(newInternal);
  }, [internalMin]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    const newMin = internalToValue(internalMin);
    const newMax = internalToValue(internalMax);
    // Only call onChange if values differ from bounds
    const returnMin = newMin > min ? newMin : null;
    const returnMax = newMax < max ? newMax : null;
    onChange(returnMin, returnMax);
  }, [internalMin, internalMax, min, max, internalToValue, onChange]);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleReset = useCallback(() => {
    setInternalMin(0);
    setInternalMax(INTERNAL_MAX);
    onChange(null, null);
  }, [onChange]);

  // Calculate display values
  const displayMin = internalToValue(internalMin);
  const displayMax = internalToValue(internalMax);

  // Calculate positions for visual track (as percentages)
  const minPercent = (internalMin / INTERNAL_MAX) * 100;
  const maxPercent = (internalMax / INTERNAL_MAX) * 100;

  const hasSelection = valueMin != null || valueMax != null;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wide text-brand-muted">
          {label}
        </label>
        {hasSelection && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-brand-accent hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Slider container */}
      <div className="relative h-6 px-2">
        {/* Track background */}
        <div className="absolute left-2 right-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand-border" />

        {/* Active track */}
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand-accent"
          style={{
            left: `calc(${minPercent}% + 8px)`,
            right: `calc(${100 - maxPercent}% + 8px)`,
          }}
        />

        {/* Min handle */}
        <input
          type="range"
          min={0}
          max={INTERNAL_MAX}
          step={1}
          value={internalMin}
          onChange={handleMinChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          className="range-slider-thumb absolute inset-x-0 top-0 h-6 w-full appearance-none bg-transparent"
          style={{ zIndex: internalMin > INTERNAL_MAX - 10 ? 5 : 3, pointerEvents: 'none' }}
        />

        {/* Max handle */}
        <input
          type="range"
          min={0}
          max={INTERNAL_MAX}
          step={1}
          value={internalMax}
          onChange={handleMaxChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          className="range-slider-thumb absolute inset-x-0 top-0 h-6 w-full appearance-none bg-transparent"
          style={{ zIndex: 4, pointerEvents: 'none' }}
        />
      </div>

      {/* Value labels */}
      <div className="mt-1 flex justify-between text-xs text-brand-muted">
        <span>{formatValue(displayMin)}</span>
        <span>{formatValue(displayMax)}</span>
      </div>

      {/* Add slider thumb styles */}
      <style>{`
        .range-slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #7EB8A2;
          border: 2px solid #1e1e1e;
          cursor: pointer;
          pointer-events: auto;
        }
        .range-slider-thumb::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #7EB8A2;
          border: 2px solid #1e1e1e;
          cursor: pointer;
          pointer-events: auto;
        }
        .range-slider-thumb:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 2px rgba(126, 184, 162, 0.3);
        }
      `}</style>
    </div>
  );
}
