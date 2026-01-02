import React, { useState, useMemo } from 'react';

// Sample data matching your final structure
const sampleFunders = [
  {"id": "5f262341a28fd46495c622b9", "established": 2004, "name": "United Utilities Trust Fund", "url": "https://fundsonline.org.uk/funds/united-utilities-trust-fund/", "categories": ["General funding"], "beneficiaries": ["Social and economic circumstances", "People on low incomes and/or benefits"], "focus": ["Advice and counselling services", "Money and debt advice", "Community services and development"], "locations": ["United Kingdom", "England", "North West England"], "information_general": "United Utilities Trust Fund is an independent grant-making charity established in early 2005. Its income largely comes from an annual donation from United Utilities Water plc. Grants are mainly awarded to individuals in financial hardship who have a liability to pay water charges.", "financial": {"year_end": "2019-03-31", "assets": 227000, "income": 4000000, "grants_to_organisations": 169600, "organisations_supported": 10}, "contact": {"name": "The Trustees", "address": "c/o Auriga Services\nEmmanuel Court\n12-14 Mill Street\nSutton Coldfield\nWest Midlands\nB72 1TJ", "email": "contact@uutf.org.uk", "telephone": "0121 362 3625"}},
  {"id": "5f262341a28fd46495c622bb", "established": 1997, "name": "The Nationwide Foundation", "url": "https://fundsonline.org.uk/funds/the-nationwide-foundation/", "categories": ["Capital costs", "Core/revenue costs", "Project funding", "Research", "Salaries", "Seed funding/start-up funding"], "beneficiaries": ["Social and economic circumstances"], "focus": ["Community services and development", "Housing advice", "Social housing", "Housing and homelessness"], "locations": ["United Kingdom"], "information_general": "The Nationwide Foundation was established as an independent charity in 1997. It receives the majority of its funding from the Nationwide Building Society. It aims to ensure that everyone in the UK has access to decent, affordable housing.", "social": {"twitter": "https://twitter.com/NationwideFdtn"}, "financial": {"year_end": "2019-03-31", "assets": 4680000, "income": 2930000, "grants_to_organisations": 1700000, "organisations_supported": 24}, "contact": {"name": "Programme Manager", "address": "Nationwide House\nPipers Way\nSwindon\nWiltshire\nSN38 2SN", "email": "enquiries@nationwidefoundation.org.uk", "telephone": "01793 655113"}},
  {"id": "5f262341a28fd46495c622bd", "established": 1973, "name": "Zurich Community Trust (UK) Limited", "url": "https://fundsonline.org.uk/funds/zurich-community-trust-uk-limited/", "categories": ["Loan finance/social investment", "Core/revenue costs", "Project funding", "Salaries"], "beneficiaries": ["Social and economic circumstances", "Disability", "Health", "Disadvantaged and socially excluded people"], "focus": ["Community services and development", "General charitable purposes", "Social welfare", "Work outside the UK", "Health"], "locations": ["United Kingdom", "England", "South East England", "Hampshire", "Scotland", "Glasgow"], "information_general": "The trust was established in 1973. It is the corporate charity of Zurich Insurance and it is one of the longest-established corporate trusts in the UK. Today, the trust awards £1.5million in grants and support each year.", "social": {"facebook": "https://www.facebook.com/zurichcommunitytrust", "twitter": "https://twitter.com/ZCTrust"}, "financial": {"year_end": "2018-12-31", "assets": 5420000, "income": 3770000, "grants_to_organisations": 2270000}, "contact": {"name": "Head of ZCT (UK)", "address": "PO Box 1288\nSwindon\nWiltshire\nSN1 1FL", "email": "steve.grimmett@zct.org.uk", "telephone": "01793 502450"}},
  {"id": "5f262341a28fd46495c622c1", "established": 1978, "name": "The Zochonis Charitable Trust", "url": "https://fundsonline.org.uk/funds/the-zochonis-charitable-trust/", "categories": ["General funding"], "beneficiaries": ["Armed forces", "Social and economic circumstances", "Health", "Disadvantaged and socially excluded people"], "focus": ["Community services and development", "Emergency response/relief", "General charitable purposes", "Housing and homelessness", "Social welfare", "Education and training", "Health"], "locations": ["World", "Africa", "United Kingdom", "England", "North West England", "Greater Manchester"], "information_general": "Registered in 1978, the trust was established by the late Sir John Zochonis, former head of P Z Cussons Plc. It has general charitable objectives but tends to favour local charities with a particular emphasis on education and the welfare of children.", "financial": {"year_end": "2019-04-05", "assets": 120620000, "income": 14570000, "grants_to_organisations": 4410000, "organisations_supported": 196}, "contact": {"name": "The Trustees", "address": "Manchester Business Park\n3500 Aviator Way\nManchester\nM22 5TG", "email": "enquiries@zochonischaritabletrust.com", "telephone": "0161 435 1005"}},
  {"id": "5f262341a28fd46495c622cf", "established": 1974, "name": "The Westminster Foundation", "url": "https://fundsonline.org.uk/funds/the-westminster-foundation/", "categories": ["Capital costs", "Core/revenue costs", "Project funding", "Salaries"], "beneficiaries": ["Social and economic circumstances"], "focus": ["Community services and development", "General charitable purposes", "Social welfare"], "locations": ["United Kingdom", "England", "Greater London", "City of Westminster", "North West England", "Cheshire", "Lancashire", "Scotland"], "information_general": "The foundation was established in 1974 for general charitable purposes by the fifth Duke of Westminster. The foundation supports a wide range of charities through its grant-making, with a focus on young people.", "financial": {"year_end": "2018-12-31", "assets": 95110000, "income": 45010000, "grants_to_organisations": 2660000, "organisations_supported": 160}, "contact": {"name": "Grants Manager", "address": "The Grosvenor Office\n70 Grosvenor Street\nLondon\nW1K 3JP", "email": "westminster.foundation@grosvenor.com", "telephone": "020 7408 0988"}},
  {"id": "5f262341a28fd46495c622d9", "established": 1990, "name": "Santander UK Foundation Limited", "url": "https://fundsonline.org.uk/funds/santander-uk-foundation-limited/", "categories": ["Project funding", "Strategic funding"], "beneficiaries": [], "focus": ["Community services and development", "Advice and counselling services", "Social welfare", "Education and training"], "locations": ["United Kingdom", "Channel Islands", "Isle of Man"], "information_general": "The Santander Foundation was established by the banking company of the same name. The foundation will launch a new grants programme to support organisations delivering skills to help people become digital and financially empowered.", "financial": {"year_end": "2018-12-31", "assets": 15200000, "income": 5590000, "grants_to_organisations": 5350000, "organisations_supported": 2845}, "contact": {"name": "The Trustees", "address": "Santander UK PLC\nSantander House\n201 Grafton Gate East\nMilton Keynes\nBuckinghamshire\nMK9 1AN", "email": "grants@santander.co.uk"}},
  {"id": "5f262341a28fd46495c622e1", "established": 2011, "name": "The PwC Foundation", "url": "https://fundsonline.org.uk/funds/the-pwc-foundation/", "categories": ["General funding", "Project funding"], "beneficiaries": ["NEET", "Mental health", "People who are educationally disadvantaged", "Social and economic circumstances", "Disadvantaged and socially excluded people"], "focus": ["Employment advice", "Advice and counselling services", "Community services and development", "General charitable purposes", "Education and training", "Health"], "locations": ["United Kingdom"], "information_general": "The PwC Foundation was established in 2011 and is the corporate charity of PricewaterhouseCoopers LLP (PwC). The objectives are to promote sustainable development and social inclusion.", "financial": {"year_end": "2019-06-30", "assets": 425700, "income": 15010000, "grants_to_organisations": 1280000, "organisations_supported": 442}, "contact": {"name": "PwC Foundation Manager", "address": "PriceWaterhouseCoopers\n1 Embankment Place\nLondon\nWC2N 6RH", "email": "thepwcfoundation@uk.pwc.com", "telephone": "07764 902846"}},
  {"id": "5f262341a28fd46495c622df", "name": "The Tim Bacon Foundation", "url": "https://fundsonline.org.uk/funds/the-tim-bacon-foundation/", "categories": ["Project funding", "Research"], "beneficiaries": [], "focus": ["Medical research", "Research"], "locations": [], "information_general": "The foundation supports research into cancer in North West England. Applications are only accepted from UK registered charities.", "social": {"facebook": "https://www.facebook.com/timbaconfoundation", "instagram": "https://www.instagram.com/timbaconfoundation/", "twitter": "https://twitter.com/TimBaconCharity"}, "financial": {"year_end": "2019-03-31", "assets": 273100, "income": 196700, "grants_to_organisations": 531200}, "contact": {"name": "The Trustees", "address": "98 King Street\nKnutsford\nCheshire\nWA16 6HQ", "email": "info@timbaconfoundation.co.uk", "telephone": "01565 631234"}}
];

const extractUniqueValues = (funders, field) => {
  const values = new Set();
  funders.forEach(f => {
    if (f[field] && Array.isArray(f[field])) {
      f[field].forEach(v => values.add(v));
    }
  });
  return Array.from(values).sort();
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
};

export default function FunderBrowser() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState('');
  const [selectedFocus, setSelectedFocus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [expandedId, setExpandedId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const locations = useMemo(() => extractUniqueValues(sampleFunders, 'locations'), []);
  const beneficiaries = useMemo(() => extractUniqueValues(sampleFunders, 'beneficiaries'), []);
  const focusAreas = useMemo(() => extractUniqueValues(sampleFunders, 'focus'), []);
  const categories = useMemo(() => extractUniqueValues(sampleFunders, 'categories'), []);

  const filteredFunders = useMemo(() => {
    let results = sampleFunders.filter(funder => {
      const matchesSearch = !searchTerm ||
        funder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        funder.focus?.some(f => f.toLowerCase().includes(searchTerm.toLowerCase())) ||
        funder.information_general?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocation = !selectedLocation || funder.locations?.includes(selectedLocation);
      const matchesBeneficiary = !selectedBeneficiary || funder.beneficiaries?.includes(selectedBeneficiary);
      const matchesFocus = !selectedFocus || funder.focus?.includes(selectedFocus);
      const matchesCategory = !selectedCategory || funder.categories?.includes(selectedCategory);

      return matchesSearch && matchesLocation && matchesBeneficiary && matchesFocus && matchesCategory;
    });

    results.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'established':
          aVal = a.established || 0;
          bVal = b.established || 0;
          break;
        case 'grants':
          aVal = a.financial?.grants_to_organisations || 0;
          bVal = b.financial?.grants_to_organisations || 0;
          break;
        case 'assets':
          aVal = a.financial?.assets || 0;
          bVal = b.financial?.assets || 0;
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return results;
  }, [searchTerm, selectedLocation, selectedBeneficiary, selectedFocus, selectedCategory, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSelectedBeneficiary('');
    setSelectedFocus('');
    setSelectedCategory('');
  };

  const hasActiveFilters = searchTerm || selectedLocation || selectedBeneficiary || selectedFocus || selectedCategory;
  const activeFilterCount = [selectedLocation, selectedBeneficiary, selectedFocus, selectedCategory].filter(Boolean).length;

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(field === 'name' ? 'asc' : 'desc');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#e8e6e3',
      fontFamily: "'IBM Plex Sans', -apple-system, sans-serif"
    }}>
      <header style={{
        borderBottom: '1px solid #252525',
        padding: '20px 24px',
        position: 'sticky',
        top: 0,
        background: '#0a0a0a',
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '600', margin: 0, color: '#fff' }}>
                UK Funders Database
              </h1>
              <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>
                {filteredFunders.length} of {sampleFunders.length} funders
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: showFilters ? '#1a1a1a' : 'transparent',
                border: '1px solid #333',
                color: '#e8e6e3',
                padding: '8px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
              </svg>
              Filters {activeFilterCount > 0 && <span style={{ background: '#7eb8a2', color: '#0a0a0a', borderRadius: '10px', padding: '1px 6px', fontSize: '11px', fontWeight: '600' }}>{activeFilterCount}</span>}
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name, focus area, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                fontSize: '14px',
                background: '#141414',
                border: '1px solid #252525',
                borderRadius: '8px',
                color: '#e8e6e3',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {showFilters && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginTop: '16px',
              padding: '16px',
              background: '#141414',
              borderRadius: '8px',
              border: '1px solid #252525'
            }}>
              <FilterSelect label="Location" value={selectedLocation} onChange={setSelectedLocation} options={locations} />
              <FilterSelect label="Beneficiaries" value={selectedBeneficiary} onChange={setSelectedBeneficiary} options={beneficiaries} />
              <FilterSelect label="Focus Area" value={selectedFocus} onChange={setSelectedFocus} options={focusAreas} />
              <FilterSelect label="Funding Type" value={selectedCategory} onChange={setSelectedCategory} options={categories} />

              {hasActiveFilters && (
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button onClick={clearFilters} style={{
                    background: 'transparent', border: '1px solid #444', color: '#888',
                    padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', width: '100%'
                  }}>
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#666', alignSelf: 'center' }}>Sort:</span>
            <SortButton label="Name" field="name" current={sortBy} order={sortOrder} onClick={toggleSort} />
            <SortButton label="Established" field="established" current={sortBy} order={sortOrder} onClick={toggleSort} />
            <SortButton label="Grants" field="grants" current={sortBy} order={sortOrder} onClick={toggleSort} />
            <SortButton label="Assets" field="assets" current={sortBy} order={sortOrder} onClick={toggleSort} />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 24px' }}>
        {filteredFunders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
            <p style={{ fontSize: '15px', margin: 0 }}>No funders match your criteria</p>
            <button onClick={clearFilters} style={{
              background: '#252525', border: 'none', color: '#e8e6e3',
              padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginTop: '16px'
            }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredFunders.map(funder => (
              <FunderCard
                key={funder.id}
                funder={funder}
                expanded={expandedId === funder.id}
                onToggle={() => setExpandedId(expandedId === funder.id ? null : funder.id)}
              />
            ))}
          </div>
        )}
      </main>

      <footer style={{ borderTop: '1px solid #252525', padding: '20px', marginTop: '40px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#444', margin: 0 }}>
          Data sourced from public records • Free and open access
        </p>
      </footer>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', padding: '8px 10px', fontSize: '13px',
          background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px',
          color: '#e8e6e3', cursor: 'pointer', outline: 'none'
        }}
      >
        <option value="">All</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function SortButton({ label, field, current, order, onClick }) {
  const isActive = current === field;
  return (
    <button
      onClick={() => onClick(field)}
      style={{
        background: isActive ? '#1a1a1a' : 'transparent',
        border: '1px solid ' + (isActive ? '#444' : '#333'),
        color: isActive ? '#fff' : '#888',
        padding: '4px 10px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      {label}
      {isActive && (
        <span style={{ fontSize: '10px' }}>{order === 'asc' ? '↑' : '↓'}</span>
      )}
    </button>
  );
}

function FunderCard({ funder, expanded, onToggle }) {
  return (
    <article style={{
      background: '#141414',
      border: '1px solid #252525',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <div onClick={onToggle} style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '500', margin: 0, color: '#fff' }}>{funder.name}</h2>
            {funder.established && (
              <span style={{ fontSize: '11px', color: '#666', background: '#1a1a1a', padding: '2px 6px', borderRadius: '3px' }}>
                Est. {funder.established}
              </span>
            )}
          </div>

          {funder.focus && funder.focus.length > 0 && (
            <p style={{ fontSize: '13px', color: '#888', margin: '0 0 10px 0', lineHeight: '1.4' }}>
              {funder.focus.slice(0, 3).join(' • ')}
            </p>
          )}

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px' }}>
            {funder.financial?.grants_to_organisations && (
              <span style={{ color: '#7eb8a2' }}>
                <strong>{formatCurrency(funder.financial.grants_to_organisations)}</strong> granted
              </span>
            )}
            {funder.financial?.assets && (
              <span style={{ color: '#666' }}>
                {formatCurrency(funder.financial.assets)} assets
              </span>
            )}
            {funder.financial?.organisations_supported && (
              <span style={{ color: '#666' }}>
                {funder.financial.organisations_supported} orgs supported
              </span>
            )}
          </div>
        </div>

        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0, marginLeft: '12px' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {expanded && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid #252525' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', paddingTop: '16px' }}>

            {funder.information_general && (
              <div style={{ gridColumn: '1 / -1' }}>
                <SectionTitle>About</SectionTitle>
                <p style={{ fontSize: '13px', color: '#aaa', lineHeight: '1.6', margin: 0 }}>
                  {funder.information_general}
                </p>
              </div>
            )}

            {funder.contact && (
              <div>
                <SectionTitle>Contact</SectionTitle>
                <div style={{ fontSize: '13px', color: '#aaa', lineHeight: '1.7' }}>
                  {funder.contact.name && <div style={{ color: '#ccc' }}>{funder.contact.name}</div>}
                  {funder.contact.email && (
                    <div><a href={`mailto:${funder.contact.email}`} style={{ color: '#7eb8a2', textDecoration: 'none' }}>{funder.contact.email}</a></div>
                  )}
                  {funder.contact.telephone && <div>{funder.contact.telephone}</div>}
                  {funder.contact.address && (
                    <div style={{ marginTop: '8px', whiteSpace: 'pre-line', color: '#777' }}>{funder.contact.address}</div>
                  )}
                </div>
              </div>
            )}

            {funder.financial && (
              <div>
                <SectionTitle>Financials ({formatDate(funder.financial.year_end)})</SectionTitle>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <FinancialRow label="Assets" value={funder.financial.assets} />
                  <FinancialRow label="Income" value={funder.financial.income} />
                  <FinancialRow label="Grants to orgs" value={funder.financial.grants_to_organisations} highlight />
                  {funder.financial.organisations_supported && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Supporting {funder.financial.organisations_supported} organisations
                    </div>
                  )}
                </div>
              </div>
            )}

            {funder.locations && funder.locations.length > 0 && (
              <div>
                <SectionTitle>Locations</SectionTitle>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {funder.locations.map(loc => (
                    <span key={loc} style={{
                      fontSize: '11px', color: '#7eb8a2', background: 'rgba(126,184,162,0.1)',
                      padding: '3px 8px', borderRadius: '3px', border: '1px solid rgba(126,184,162,0.2)'
                    }}>
                      {loc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {funder.beneficiaries && funder.beneficiaries.length > 0 && (
              <div>
                <SectionTitle>Beneficiaries</SectionTitle>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {funder.beneficiaries.map(b => (
                    <span key={b} style={{ fontSize: '11px', color: '#999', background: '#1a1a1a', padding: '3px 8px', borderRadius: '3px' }}>
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {funder.categories && funder.categories.length > 0 && (
              <div>
                <SectionTitle>Funding Types</SectionTitle>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {funder.categories.map(c => (
                    <span key={c} style={{ fontSize: '11px', color: '#999', background: '#1a1a1a', padding: '3px 8px', borderRadius: '3px' }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #1a1a1a' }}>
              {funder.url && (
                <a href={funder.url} target="_blank" rel="noopener noreferrer" style={{
                  fontSize: '12px', color: '#7eb8a2', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  View on Funds Online →
                </a>
              )}

              {funder.social && (
                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                  {funder.social.twitter && <SocialIcon href={funder.social.twitter} icon="twitter" />}
                  {funder.social.facebook && <SocialIcon href={funder.social.facebook} icon="facebook" />}
                  {funder.social.instagram && <SocialIcon href={funder.social.instagram} icon="instagram" />}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px 0' }}>
      {children}
    </h3>
  );
}

function FinancialRow({ label, value, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
      <span style={{ color: '#777' }}>{label}</span>
      <span style={{ color: highlight ? '#7eb8a2' : '#ccc', fontFamily: "'IBM Plex Mono', monospace" }}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function SocialIcon({ href, icon }) {
  const icons = {
    twitter: <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>,
    facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>,
    instagram: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></>
  };

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#666' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {icons[icon]}
      </svg>
    </a>
  );
}