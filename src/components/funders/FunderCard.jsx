import { formatCurrency } from '../../lib/formatters';
import { HeartIcon, ChevronDownIcon } from '../ui/Icons';
import { FunderCardExpanded } from './FunderCardExpanded';
import { Highlight, HighlightArrayItem } from '../ui/Highlight';

export function FunderCard({ funder, expanded, onToggle, isFavorite, onToggleFavorite }) {
  return (
    <article className="overflow-hidden rounded-lg border border-brand-border bg-brand-card">
      {/* Collapsed header - always visible */}
      <div
        onClick={onToggle}
        className="flex cursor-pointer items-start justify-between gap-3 p-4 hover:bg-brand-dark/30"
      >
        <div className="min-w-0 flex-1">
          {/* Title row */}
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-medium text-white sm:text-base">
              <Highlight text={funder.name} fieldName="name" funderId={funder.id} />
            </h2>
            {funder.established && (
              <span className="rounded bg-brand-dark px-1.5 py-0.5 text-[10px] text-brand-muted">
                Est. {funder.established}
              </span>
            )}
          </div>

          {/* Focus areas */}
          {funder.focus && funder.focus.length > 0 && (
            <p className="mb-2 text-xs leading-relaxed text-brand-muted sm:text-sm">
              {funder.focus.slice(0, 3).map((focusItem, index) => (
                <span key={index}>
                  {index > 0 && ' • '}
                  <HighlightArrayItem
                    text={focusItem}
                    fieldName="focus"
                    funderId={funder.id}
                    arrayIndex={index}
                  />
                </span>
              ))}
            </p>
          )}

          {/* Financial summary */}
          <div className="flex flex-wrap gap-3 text-xs">
            {funder.financial?.grants_to_organisations && (
              <span className="text-brand-accent">
                <strong>{formatCurrency(funder.financial.grants_to_organisations)}</strong> granted
              </span>
            )}
            {funder.financial?.assets && (
              <span className="text-brand-muted">
                {formatCurrency(funder.financial.assets)} assets
              </span>
            )}
            {funder.financial?.organisations_supported && (
              <span className="text-brand-muted">
                {funder.financial.organisations_supported} orgs supported
              </span>
            )}
          </div>
        </div>

        {/* Right side: favorite + chevron */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(funder.id);
            }}
            className={`rounded p-1.5 transition-colors ${
              isFavorite
                ? 'text-brand-accent'
                : 'text-brand-muted hover:text-brand-text'
            }`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <HeartIcon filled={isFavorite} className="h-4 w-4" />
          </button>
          <ChevronDownIcon
            className={`h-5 w-5 text-brand-muted transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Expanded content */}
      {expanded && <FunderCardExpanded funder={funder} />}
    </article>
  );
}
