# UK Funders Database

A static, client-side searchable database of ~8,000 UK funding organisations. Hosted on GitHub Pages with zero backend dependencies.

## Project Overview

This project makes publicly available funder data freely accessible via a simple browsing interface. The entire dataset (~10MB JSONL) is loaded once, cached locally in IndexedDB, and served entirely from the browser thereafter.

**Core Principles:**
- Zero backend - pure static hosting on GitHub Pages
- First load fetches and caches; subsequent loads are instant
- All filtering, searching, and sorting happens client-side
- Mobile-first with virtual scrolling for performance

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Pages                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ index.html  │  │  app.js     │  │  funders.jsonl  │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      Browser                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │                  IndexedDB                       │   │
│  │  ┌───────────┐  ┌───────────┐  ┌─────────────┐  │   │
│  │  │  funders  │  │  indexes  │  │    meta     │  │   │
│  │  └───────────┘  └───────────┘  └─────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│                         ▼                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Fuse.js (fuzzy search)             │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │         React + react-window (virtual scroll)   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Technology Choices

### IndexedDB for Client-Side Storage

**Why IndexedDB over alternatives:**

| Storage        | Limit       | Async | Structured | Why Not                           |
|----------------|-------------|-------|------------|-----------------------------------|
| localStorage   | 5-10MB      | No    | No         | Blocks main thread, size limit    |
| sessionStorage | 5-10MB      | No    | No         | Doesn't persist across sessions   |
| Cache API      | Large       | Yes   | No         | Designed for request/response     |
| **IndexedDB**  | 50MB-GBs    | Yes   | Yes        | ✓ Perfect fit                     |

**Browser Support:** Universal since 2014. IE11+ (dead), all modern browsers, iOS Safari 8+, Android Chrome. ~98% global coverage.

**Caveat:** Safari private browsing throws on IndexedDB writes. Handle gracefully with in-memory fallback.

### IndexedDB Schema

```javascript
const DB_NAME = 'funders-db';
const DB_VERSION = 1;

// Schema
{
  stores: {
    funders: {
      keyPath: 'id',
      indexes: {
        'name': { unique: false },
        'established': { unique: false },
        'grants': { keyPath: 'financial.grants_to_organisations', unique: false },
        'assets': { keyPath: 'financial.assets', unique: false }
      }
    },
    meta: {
      keyPath: 'key'
      // Stores: { key: 'lastUpdated', value: '2024-01-15T...' }
      // Stores: { key: 'version', value: 'abc123' }
    }
  }
}
```

**Index Strategy:**

We create indexes on fields used for sorting:
- `name` - alphabetical sort
- `established` - year founded sort
- `financial.grants_to_organisations` - sort by grant volume
- `financial.assets` - sort by asset size

Filtering on array fields (locations, beneficiaries, focus, categories) happens in-memory after loading all records. IndexedDB's multiEntry indexes could theoretically help, but for 8,000 records the overhead isn't worth it - just load all and filter in JS.

### Virtual Scrolling with react-window

**Why virtual scrolling:**
- 8,000 DOM nodes = browser meltdown on mobile
- Virtual scrolling renders only visible items (~20-30 at a time)
- Constant memory footprint regardless of dataset size
- Smooth 60fps scrolling on mobile devices

**Library choice:** `react-window` over `react-virtualized`
- Smaller bundle (~6KB vs ~30KB)
- Simpler API
- Sufficient for our use case (single list, variable height items)

**Implementation notes:**
- Use `VariableSizeList` since expanded cards have different heights
- Cache measured heights to avoid layout thrashing
- Reset height cache when filters change

### Fuzzy Search with Fuse.js

**Why fuzzy matching:**
- Users misspell: "homlessness" → "homelessness"
- Users abbreviate: "NW England" → "North West England"
- Users use synonyms: "charity" when data says "organisation"
- Partial matching: "youth" finds "Young people", "Youth services"

**Fuse.js configuration:**

```javascript
const fuse = new Fuse(funders, {
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'focus', weight: 0.25 },
    { name: 'beneficiaries', weight: 0.2 },
    { name: 'information_general', weight: 0.15 }
  ],
  threshold: 0.3,        // 0 = exact, 1 = match anything
  distance: 100,         // how far to search for fuzzy match
  minMatchCharLength: 2, // ignore single chars
  includeScore: true,    // for ranking results
  useExtendedSearch: true // enables AND/OR/exact operators
});
```

**Performance:** Fuse.js searches 8,000 records in ~50-100ms. For instant feedback, debounce input by 150ms.

## Data Structure

Each funder record follows this schema:

```typescript
interface Funder {
  id: string;                    // MongoDB ObjectId from source
  external: number;              // External reference ID
  version: number;               // Data version
  established?: number;          // Year founded
  name: string;                  // Organisation name
  url: string;                   // Source URL on fundsonline.org.uk
  types: string;                 // Organisation type

  // Array fields - pre-parsed from CSV
  categories: string[];          // Funding types offered
  tags: string[];                // Organisation tags
  beneficiaries: string[];       // Who they help
  focus: string[];               // What areas they fund
  locations: string[];           // Geographic coverage
  sources: string[];             // Data sources
  trustees: string[];            // Trustee names

  // Flags
  applications_unsolicited: boolean;

  // Free text fields
  information_general?: string;
  information_beneficial_area?: string;
  information_beneficial_sample?: string;
  information_exclusions?: string;
  information_focus?: string;
  information_last_updated?: string;

  // Nested objects
  financial?: {
    year_end: string;            // ISO date
    assets: number;              // In GBP
    income: number;              // In GBP
    grants_to_organisations: number;
    organisations_supported?: number;
  };

  contact?: {
    name?: string;
    address?: string;            // Newline-separated
    email?: string;
    telephone?: string;
  };

  social?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}
```

## Data Loading Strategy

```javascript
async function initializeData() {
  const db = await openDB();

  // Check if we have cached data
  const meta = await db.get('meta', 'lastUpdated');
  const count = await db.count('funders');

  if (meta && count > 0) {
    // Cache hit - load from IndexedDB
    return db.getAll('funders');
  }

  // Cache miss - fetch and stream JSONL
  const response = await fetch('funders.jsonl');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const funders = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep incomplete line

    for (const line of lines) {
      if (line.trim()) {
        const funder = JSON.parse(line);
        funders.push(funder);

        // Optional: update progress UI
        // onProgress(funders.length / EXPECTED_COUNT);
      }
    }
  }

  // Batch write to IndexedDB
  const tx = db.transaction('funders', 'readwrite');
  await Promise.all([
    ...funders.map(f => tx.store.put(f)),
    tx.done
  ]);

  // Update meta
  await db.put('meta', { key: 'lastUpdated', value: new Date().toISOString() });

  return funders;
}
```

## File Structure

```
uk-funders-database/
├── index.html              # Entry point
├── funders.jsonl           # Data file (~10MB)
├── CLAUDE.md               # This file
├── README.md               # Public documentation
├── src/
│   ├── App.jsx             # Main component
│   ├── components/
│   │   ├── FunderCard.jsx  # Individual funder display
│   │   ├── FilterPanel.jsx # Filter dropdowns
│   │   ├── SearchBar.jsx   # Fuzzy search input
│   │   ├── SortControls.jsx
│   │   └── VirtualList.jsx # react-window wrapper
│   ├── hooks/
│   │   ├── useDatabase.js  # IndexedDB operations
│   │   ├── useFuse.js      # Fuzzy search hook
│   │   └── useFilters.js   # Filter state management
│   ├── lib/
│   │   ├── db.js           # IndexedDB setup with idb
│   │   └── formatters.js   # Currency, date formatting
│   └── styles/
│       └── main.css        # Minimal styles
└── scripts/
    └── prepare-data.js     # Data preprocessing script
```

## Build & Deploy

**Dependencies:**
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-window": "^1.8.x",
    "fuse.js": "^7.x",
    "idb": "^8.x"
  }
}
```

**Build:** Vite or similar for bundling. Output to `dist/`.

**Deploy:** Push `dist/` contents to `gh-pages` branch or configure GitHub Pages to serve from `main/docs`.

**Data updates:** Replace `funders.jsonl` and optionally update a version hash in `meta` store to trigger re-fetch on next visit.

## Performance Targets

| Metric                    | Target    | Notes                              |
|---------------------------|-----------|------------------------------------|
| First load (cold cache)   | < 5s      | JSONL fetch + parse + store        |
| Subsequent loads          | < 500ms   | IndexedDB read + Fuse index build  |
| Search response           | < 100ms   | Debounced, fuzzy match 8k records  |
| Scroll performance        | 60fps     | Virtual scrolling                  |
| Memory footprint          | < 50MB    | Data + Fuse index + visible DOM    |

## Future Enhancements

- **Offline support:** Service worker for full offline capability
- **Data versioning:** Hash-based cache invalidation
- ~~**Export:** CSV/JSON download of filtered results~~ ✓ Done
- ~~**Saved searches:** LocalStorage for bookmarking filter combinations~~ ✓ Done
- **Analytics:** Privacy-respecting usage stats (Plausible/Fathom)

## Feature Roadmap

Based on analysis of commercial platforms (Funds Online, GrantNav, My Funding Central, GrantFinder, Charity Excellence), here are features worth implementing:

### Priority 1: Core Differentiators (MVP) ✓ Complete

| Feature | Commercial Equivalent | Our Approach | Status |
|---------|----------------------|--------------|--------|
| **Fuzzy search** | Most have exact match only | Fuse.js with typo tolerance | ✓ |
| **No paywall** | £200-500/year subscriptions | Completely free, no registration | ✓ |
| **Instant load** | Server-side pagination | Full dataset cached locally | ✓ |
| **Mobile-first** | Often desktop-oriented | Virtual scrolling, touch-friendly | ✓ |
| **Open data** | Proprietary databases | Full dataset downloadable | ✓ |

### Priority 2: Search & Discovery

**Advanced Filtering**
- [ ] Multi-select filters (select multiple locations, beneficiaries)
- [ ] Grant amount range slider (£0 - £10M+)
- [ ] Established year range slider (1900 - 2025)
- [ ] "Accepts unsolicited applications" toggle
- [ ] Geographic hierarchy (UK → England → North West → Greater Manchester)

**Search Enhancements**
- [ ] Search suggestions/autocomplete as you type
- [ ] Recent searches (localStorage)
- [ ] Search within results
- [ ] Advanced search syntax (AND, OR, NOT, quotes for exact match)
- [x] Highlight search terms in results

**Discovery Features**
- [ ] "Similar funders" recommendations based on focus/beneficiaries
- [ ] "Funders in your area" (use browser geolocation or manual postcode)
- [ ] Random funder ("I'm feeling lucky" for exploration)
- [ ] Featured/spotlight funders on homepage

### Priority 3: User Workflow Features

**Shortlisting & Organisation**
- [x] Save funders to a shortlist (localStorage, no account needed)
- [ ] Multiple named lists ("Housing Project", "Youth Work")
- [ ] Add personal notes to saved funders
- [ ] Drag-and-drop reordering of shortlist
- [ ] Export shortlist as CSV/PDF

**Sharing & Collaboration**
- [x] Shareable search URLs (encode filters in URL params)
- [x] "Share this funder" button (copy link, email)
- [x] Print-friendly funder detail view (PDF Detailed export)
- [ ] QR code for individual funder pages

**Export Options**
- [x] Download current search results as CSV
- [ ] Download full dataset (JSONL, CSV, JSON)
- [x] Export funder detail as PDF (Detailed format)
- [x] Export address labels as PDF (Labels format)
- [ ] Copy funder details to clipboard (formatted for grant applications)

### Priority 4: Data Visualisation

**Summary Statistics**
- [ ] Total funders, total grants awarded, total assets in database
- [ ] Breakdown charts by location, focus area, beneficiary type
- [ ] Grant size distribution histogram
- [ ] Established date timeline

**Individual Funder Insights**
- [ ] Mini charts showing financial trends (if historical data available)
- [ ] Comparison tool (side-by-side funder comparison)
- [ ] "Grant examples" section with amounts and recipients

**Geographic Visualisation**
- [ ] Map view showing funder locations/coverage
- [ ] Heatmap of funding density by region
- [ ] Click region to filter funders

### Priority 5: Engagement Features

**No Account Required (use localStorage)**
- [ ] Recently viewed funders
- [ ] Search history
- [ ] Preferred filters (remember last used)
- [ ] Dark/light mode preference

**Optional Email Features (requires simple backend)**
- [ ] Email alert when new funders added matching criteria
- [ ] Weekly digest of new/updated funders
- [ ] "Email me this shortlist" (one-time, no account)

### Priority 6: Accessibility & Internationalisation

**Accessibility (WCAG 2.1 AA)**
- [ ] Keyboard navigation throughout
- [ ] Screen reader optimised (ARIA labels, live regions)
- [ ] High contrast mode
- [ ] Reduced motion option
- [ ] Focus indicators on all interactive elements

**Usability**
- [ ] Onboarding tour for first-time visitors
- [ ] Contextual help tooltips
- [ ] "How to use this data" guide
- [ ] Glossary of funding terminology

### Features We Won't Build (Scope Limits)

| Feature | Reason |
|---------|--------|
| User accounts | Unnecessary complexity, localStorage sufficient |
| Application tracking | Out of scope - we're a directory, not a CRM |
| Funder submission | Data comes from existing sources |
| Reviews/ratings | Subjective, liability concerns |
| Real-time updates | Static data updated periodically |
| Payment/premium tiers | Defeats the purpose of free access |

### Implementation Phases

**Phase 1: Core** ✓ Complete
- [x] Virtual scrolling list
- [x] Fuzzy search with Fuse.js
- [x] IndexedDB caching
- [x] Basic filters (location, beneficiaries, focus, categories)
- [x] Sort options

**Phase 2: Enhanced Search** (Partial)
- [ ] Multi-select filters
- [ ] Range sliders for amounts/years
- [x] Shareable URL state
- [x] Search highlighting

**Phase 3: User Features** (Partial)
- [x] Shortlist functionality (favorites)
- [x] Export to CSV
- [x] Export to PDF (List, Detailed, Labels)
- [ ] Recently viewed
- [x] Print-friendly view (PDF Detailed)

**Phase 4: Visualisation**
- [ ] Summary statistics dashboard
- [ ] Geographic map view
- [ ] Funder comparison tool

**Phase 5: Polish**
- [ ] Accessibility audit and fixes
- [ ] Performance optimisation
- [ ] Documentation
- [ ] Launch prep

---

## Competitive Analysis Summary

| Platform | Price | Records | Strengths | Weaknesses |
|----------|-------|---------|-----------|------------|
| **Funds Online** | £195-495/yr | 8,277 | Comprehensive data, DSC backing | Paywall, dated UX |
| **GrantNav** | Free | 500k+ grants | Open data, visualisations | Grants not funders, complex |
| **My Funding Central** | £0-180/yr | ~4,000 | Email alerts, deadline tracking | Income restricted, basic search |
| **GrantFinder** | £500+/yr | Large | Daily updates, alerts | Expensive, enterprise focus |
| **Charity Excellence** | Free | 100+ core | Links to 250 databases | Aggregator, not primary source |
| **Our Site** | Free | 8,000 | Speed, fuzzy search, no paywall | Static data, no alerts |

Our positioning: **"The fast, free, no-bullshit funder database."**

---

## Notes for Claude

When working on this project:

1. **Data is static** - no CRUD operations, read-only after initial cache
2. **Mobile-first** - test virtual scrolling on throttled connections
3. **Graceful degradation** - handle IndexedDB failures, fall back to in-memory
4. **No PII concerns** - this is public charity data, no privacy restrictions
5. **Accessibility** - keyboard navigation through virtual list, ARIA labels on filters
6. **URL state** - filters should be shareable via URL params
7. **Progressive enhancement** - basic functionality without JS where possible