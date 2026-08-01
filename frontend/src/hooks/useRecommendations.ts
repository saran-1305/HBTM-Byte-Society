import { useState, useEffect } from 'react';

export function useRecommendations() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecs() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/recommendations/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch recommendations");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRecs();
  }, []);

  return { data, loading, error };
}
