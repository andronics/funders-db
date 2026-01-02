import { formatCurrency, formatDate } from '../../lib/formatters';
import { ExternalLinkIcon, TwitterIcon, FacebookIcon, InstagramIcon } from '../ui/Icons';
import { Highlight, HighlightArrayItem } from '../ui/Highlight';

export function FunderCardExpanded({ funder }) {
  return (
    <div className="border-t border-brand-border px-4 pb-4 pt-4">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* About section */}
        {funder.information_general && (
          <div className="sm:col-span-2 lg:col-span-3">
            <SectionTitle>About</SectionTitle>
            <p className="text-sm leading-relaxed text-gray-400">
              <Highlight
                text={funder.information_general}
                fieldName="information_general"
                funderId={funder.id}
              />
            </p>
          </div>
        )}

        {/* Contact */}
        {funder.contact && (
          <div>
            <SectionTitle>Contact</SectionTitle>
            <div className="space-y-1 text-sm text-gray-400">
              {funder.contact.name && (
                <div className="text-gray-300">{funder.contact.name}</div>
              )}
              {funder.contact.email && (
                <a
                  href={`mailto:${funder.contact.email}`}
                  className="block text-brand-accent hover:underline"
                >
                  {funder.contact.email}
                </a>
              )}
              {funder.contact.telephone && <div>{funder.contact.telephone}</div>}
              {funder.contact.address && (
                <div className="mt-2 whitespace-pre-line text-xs text-brand-muted">
                  {funder.contact.address}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Financials */}
        {funder.financial && (
          <div>
            <SectionTitle>
              Financials ({formatDate(funder.financial.year_end)})
            </SectionTitle>
            <div className="space-y-2">
              <FinancialRow label="Assets" value={funder.financial.assets} />
              <FinancialRow label="Income" value={funder.financial.income} />
              <FinancialRow
                label="Grants to orgs"
                value={funder.financial.grants_to_organisations}
                highlight
              />
              {funder.financial.organisations_supported && (
                <div className="text-xs text-brand-muted">
                  Supporting {funder.financial.organisations_supported} organisations
                </div>
              )}
            </div>
          </div>
        )}

        {/* Locations */}
        {funder.locations && funder.locations.length > 0 && (
          <div>
            <SectionTitle>Locations</SectionTitle>
            <HighlightedTagList
              tags={funder.locations}
              fieldName="locations"
              funderId={funder.id}
              variant="accent"
            />
          </div>
        )}

        {/* Beneficiaries */}
        {funder.beneficiaries && funder.beneficiaries.length > 0 && (
          <div>
            <SectionTitle>Beneficiaries</SectionTitle>
            <HighlightedTagList
              tags={funder.beneficiaries}
              fieldName="beneficiaries"
              funderId={funder.id}
            />
          </div>
        )}

        {/* Categories / Funding Types */}
        {funder.categories && funder.categories.length > 0 && (
          <div>
            <SectionTitle>Funding Types</SectionTitle>
            <HighlightedTagList
              tags={funder.categories}
              fieldName="categories"
              funderId={funder.id}
            />
          </div>
        )}

        {/* Trustees */}
        {funder.trustees && funder.trustees.length > 0 && (
          <div>
            <SectionTitle>Trustees</SectionTitle>
            <p className="text-sm text-gray-400">
              {funder.trustees.map((trustee, index) => (
                <span key={index}>
                  {index > 0 && ', '}
                  <Highlight text={trustee} fieldName="trustees" funderId={funder.id} />
                </span>
              ))}
            </p>
          </div>
        )}

        {/* Links */}
        <div className="flex flex-wrap items-center gap-4 border-t border-brand-dark pt-4 sm:col-span-2 lg:col-span-3">
          {funder.url && (
            <a
              href={funder.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-brand-accent hover:underline"
            >
              View on Funds Online
              <ExternalLinkIcon className="h-3.5 w-3.5" />
            </a>
          )}

          {funder.social && (
            <div className="ml-auto flex gap-3">
              {funder.social.twitter && (
                <SocialLink href={funder.social.twitter} icon={TwitterIcon} />
              )}
              {funder.social.facebook && (
                <SocialLink href={funder.social.facebook} icon={FacebookIcon} />
              )}
              {funder.social.instagram && (
                <SocialLink href={funder.social.instagram} icon={InstagramIcon} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-brand-muted">
      {children}
    </h3>
  );
}

function FinancialRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-mono ${highlight ? 'text-brand-accent' : 'text-gray-300'}`}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function HighlightedTagList({ tags, fieldName, funderId, variant = 'default' }) {
  const variantStyles =
    variant === 'accent'
      ? 'text-brand-accent bg-brand-accent/10 border-brand-accent/20'
      : 'text-gray-400 bg-brand-dark border-transparent';

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag, index) => (
        <span
          key={tag}
          className={`rounded border px-2 py-0.5 text-[11px] ${variantStyles}`}
        >
          <HighlightArrayItem
            text={tag}
            fieldName={fieldName}
            funderId={funderId}
            arrayIndex={index}
            highlightClassName="bg-brand-accent/50 text-white rounded-sm"
          />
        </span>
      ))}
    </div>
  );
}

function SocialLink({ href, icon: Icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand-muted transition-colors hover:text-brand-text"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}
