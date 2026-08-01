import { useEffect, useState } from 'react';

// A short, honest "loading" beat for pages whose data is actually instant
// (everything here is local/mocked) — keeps the skeleton→content pattern
// consistent across tabs instead of only Dashboard having one.
export function useBriefLoading(delay = 350): boolean {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return loading;
}
