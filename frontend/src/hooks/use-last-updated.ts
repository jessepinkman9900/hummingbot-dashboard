'use client';

import { useState, useCallback } from 'react';

interface UseLastUpdatedReturn {
  lastUpdated: Date;
  updateTimestamp: () => void;
  formatLastUpdated: (date: Date) => string;
}

export function useLastUpdated(): UseLastUpdatedReturn {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const updateTimestamp = useCallback(() => {
    setLastUpdated(new Date());
  }, []);

  const formatLastUpdated = useCallback((date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }, []);

  return {
    lastUpdated,
    updateTimestamp,
    formatLastUpdated,
  };
}
