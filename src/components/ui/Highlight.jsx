import { useMemo } from 'react';
import { useSearchContext } from '../../contexts/SearchContext';

const DEFAULT_HIGHLIGHT_CLASS = 'bg-brand-accent/30 text-brand-accent rounded-sm px-0.5';

/**
 * Highlights matching text within a string using Fuse.js match data
 */
export function Highlight({
  text,
  fieldName,
  funderId,
  className = '',
  highlightClassName = DEFAULT_HIGHLIGHT_CLASS
}) {
  const { searchTerm, getMatches } = useSearchContext();

  const highlightedContent = useMemo(() => {
    if (!searchTerm || !text) {
      return text;
    }

    const matches = getMatches(funderId);
    const fieldMatches = matches.filter(m => m.key === fieldName);

    if (fieldMatches.length === 0) {
      return highlightSubstring(text, searchTerm, highlightClassName);
    }

    const indices = fieldMatches.flatMap(m => m.indices || []);

    if (indices.length === 0) {
      return text;
    }

    return applyHighlights(text, indices, highlightClassName);
  }, [text, searchTerm, funderId, fieldName, getMatches, highlightClassName]);

  return <span className={className}>{highlightedContent}</span>;
}

/**
 * Highlight for array fields (focus, beneficiaries, locations, etc.)
 */
export function HighlightArrayItem({
  text,
  fieldName,
  funderId,
  arrayIndex,
  className = '',
  highlightClassName = DEFAULT_HIGHLIGHT_CLASS
}) {
  const { searchTerm, getMatches } = useSearchContext();

  const highlightedContent = useMemo(() => {
    if (!searchTerm || !text) return text;

    const matches = getMatches(funderId);
    const fieldMatches = matches.filter(
      m => m.key === fieldName && m.refIndex === arrayIndex
    );

    if (fieldMatches.length > 0) {
      const indices = fieldMatches.flatMap(m => m.indices || []);
      if (indices.length > 0) {
        return applyHighlights(text, indices, highlightClassName);
      }
    }

    return highlightSubstring(text, searchTerm, highlightClassName);
  }, [text, searchTerm, funderId, fieldName, arrayIndex, getMatches, highlightClassName]);

  return <span className={className}>{highlightedContent}</span>;
}

/**
 * Simple substring highlighting for non-indexed fields
 */
function highlightSubstring(text, searchTerm, highlightClassName) {
  if (!text || !searchTerm) return text;

  const lowerText = text.toLowerCase();
  const lowerSearch = searchTerm.toLowerCase();
  const index = lowerText.indexOf(lowerSearch);

  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + searchTerm.length);
  const after = text.slice(index + searchTerm.length);

  return (
    <>
      {before}
      <mark className={highlightClassName}>{match}</mark>
      {highlightSubstring(after, searchTerm, highlightClassName)}
    </>
  );
}

/**
 * Apply Fuse.js match indices to create highlighted spans
 */
function applyHighlights(text, indices, highlightClassName) {
  const sortedIndices = [...indices].sort((a, b) => a[0] - b[0]);
  const mergedIndices = mergeOverlappingRanges(sortedIndices);

  const parts = [];
  let lastEnd = 0;

  mergedIndices.forEach(([start, end], i) => {
    if (start > lastEnd) {
      parts.push(text.slice(lastEnd, start));
    }
    parts.push(
      <mark key={i} className={highlightClassName}>
        {text.slice(start, end + 1)}
      </mark>
    );
    lastEnd = end + 1;
  });

  if (lastEnd < text.length) {
    parts.push(text.slice(lastEnd));
  }

  return <>{parts}</>;
}

/**
 * Merge overlapping index ranges
 */
function mergeOverlappingRanges(ranges) {
  if (ranges.length === 0) return [];

  const merged = [[...ranges[0]]];

  for (let i = 1; i < ranges.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = ranges[i];

    if (curr[0] <= prev[1] + 1) {
      prev[1] = Math.max(prev[1], curr[1]);
    } else {
      merged.push([...curr]);
    }
  }

  return merged;
}
