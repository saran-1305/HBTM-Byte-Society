import { useState, useEffect } from 'react';

export function useIdentityProfile() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIdentity() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/identity/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchIdentity();
  }, []);

  return { data, loading };
}
