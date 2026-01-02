import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import {
  openFundersDB,
  getAllFunders,
  saveFundersBatch,
  getDataVersion,
  setDataVersion,
  clearFunders
} from '../lib/indexedDb';
import { streamJsonl } from '../lib/streamJsonl';
import { createSearchIndex } from '../lib/searchIndex';

const FundersContext = createContext(null);

// Increment this to force re-download of data
const DATA_VERSION = '1.0';

// Batch size for IndexedDB writes
const BATCH_SIZE = 100;

// How often to update React state during streaming (every N records)
const UI_UPDATE_INTERVAL = 500;

export function FundersProvider({ children }) {
  const [funders, setFunders] = useState([]);
  const [filterOptions, setFilterOptions] = useState(null);
  const [searchIndex, setSearchIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [error, setError] = useState(null);

  // Compute filter options from funders array
  const computeFilterOptions = useCallback((fundersData) => {
    return {
      locations: [...new Set(fundersData.flatMap(f => f.locations || []))].sort(),
      beneficiaries: [...new Set(fundersData.flatMap(f => f.beneficiaries || []))].sort(),
      focus: [...new Set(fundersData.flatMap(f => f.focus || []))].sort(),
      categories: [...new Set(fundersData.flatMap(f => f.categories || []))].sort(),
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const db = await openFundersDB();
        const storedVersion = await getDataVersion(db);

        // Check if we have cached data with current version
        if (storedVersion === DATA_VERSION) {
          if (isMounted) setLoadingStatus('Loading from cache...');

          const cachedFunders = await getAllFunders(db);

          if (cachedFunders.length > 0) {
            if (isMounted) {
              setFunders(cachedFunders);
              setFilterOptions(computeFilterOptions(cachedFunders));
              setLoadingStatus('Building search index...');
            }

            const index = createSearchIndex(cachedFunders);

            if (isMounted) {
              setSearchIndex(index);
              setLoadingProgress(1);
              setIsLoading(false);
            }
            return;
          }
        }

        // Need to download fresh data
        if (isMounted) {
          setLoadingStatus('Downloading funders data...');
          setLoadingProgress(0);
        }

        await clearFunders(db);

        const downloadedFunders = [];
        let batch = [];

        await streamJsonl('/funders.jsonl', {
          onRecord: (record) => {
            downloadedFunders.push(record);
            batch.push(record);

            // Save in batches to IndexedDB
            if (batch.length >= BATCH_SIZE) {
              saveFundersBatch(db, [...batch]);
              batch = [];
            }

            // Update UI periodically for progressive loading feedback
            if (isMounted && downloadedFunders.length % UI_UPDATE_INTERVAL === 0) {
              setFunders([...downloadedFunders]);
              setLoadingStatus(`Loaded ${downloadedFunders.length.toLocaleString()} funders...`);
            }
          },
          onProgress: (progress) => {
            if (isMounted) {
              setLoadingProgress(progress);
            }
          },
          onError: (err, line) => {
            console.warn('Failed to parse line:', err);
          }
        });

        // Save remaining batch
        if (batch.length > 0) {
          await saveFundersBatch(db, batch);
        }

        // Save version
        await setDataVersion(db, DATA_VERSION);

        if (isMounted) {
          setFunders(downloadedFunders);
          setFilterOptions(computeFilterOptions(downloadedFunders));
          setLoadingStatus('Building search index...');
        }

        const index = createSearchIndex(downloadedFunders);

        if (isMounted) {
          setSearchIndex(index);
          setLoadingProgress(1);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load funders:', err);
        if (isMounted) {
          setError(err.message);
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [computeFilterOptions]);

  return (
    <FundersContext.Provider
      value={{
        funders,
        filterOptions,
        searchIndex,
        isLoading,
        loadingProgress,
        loadingStatus,
        error,
        totalCount: funders.length,
      }}
    >
      {children}
    </FundersContext.Provider>
  );
}

export function useFundersContext() {
  const context = useContext(FundersContext);
  if (!context) {
    throw new Error('useFundersContext must be used within a FundersProvider');
  }
  return context;
}
