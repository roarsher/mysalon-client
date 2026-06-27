import { useState, useEffect, useCallback } from 'react';
import { getQueuePosition } from '../services/api';

/**
 * useQueue
 * Polls the backend every 15 seconds for the user's live queue position.
 * Used on the QueueStatusPage.
 *
 * Usage:
 *   const { queueData, loading, error, refresh } = useQueue(bookingId);
 */
const useQueue = (bookingId, intervalMs = 15000) => {
  const [queueData, setQueueData] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const fetch = useCallback(async () => {
    if (!bookingId) return;
    try {
      const res = await getQueuePosition(bookingId);
      setQueueData(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetch(); // initial call
    const interval = setInterval(fetch, intervalMs);
    return () => clearInterval(interval); // cleanup on unmount
  }, [fetch, intervalMs]);

  return { queueData, loading, error, refresh: fetch };
};

export default useQueue;