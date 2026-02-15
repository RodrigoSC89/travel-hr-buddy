/**
 * Sprint 5: React hook for bundle & network analysis
 */
import { useState, useEffect } from 'react';
import { bundleAnalyzer, type BundleStats, type NetworkProfile } from '@/lib/performance/bundle-analyzer';

export function useBundleStats() {
  const [stats, setStats] = useState<BundleStats | null>(null);
  const [network, setNetwork] = useState<NetworkProfile>(bundleAnalyzer.getNetworkProfile());

  useEffect(() => {
    // Measure after page is loaded
    const timer = setTimeout(() => {
      setStats(bundleAnalyzer.getBundleStats());
      setNetwork(bundleAnalyzer.getNetworkProfile());
    }, 3000);

    const handleOnline = () => setNetwork(bundleAnalyzer.getNetworkProfile());
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOnline);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOnline);
    };
  }, []);

  return {
    stats,
    network,
    formatBytes: bundleAnalyzer.formatBytes,
    refresh: () => {
      setStats(bundleAnalyzer.getBundleStats());
      setNetwork(bundleAnalyzer.getNetworkProfile());
    },
  };
}
