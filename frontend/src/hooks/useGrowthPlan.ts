import { useState, useEffect } from 'react';

export function useGrowthPlan() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGrowth() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/growth/plan', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch growth plan");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchGrowth();
  }, []);

  return { data, loading, error };
}
