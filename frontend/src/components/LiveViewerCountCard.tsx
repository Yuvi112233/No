import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';

interface LiveViewerCountCardProps {
  salonId: string;
}

export default function LiveViewerCountCard({ salonId }: LiveViewerCountCardProps) {
  const [viewerCount, setViewerCount] = useState<number>(0);

  useEffect(() => {
    // Listen for live_viewers_update WebSocket events
    const handleViewerUpdate = (event: CustomEvent) => {
      const { salonId: updatedSalonId, count } = event.detail;
      if (updatedSalonId === salonId) {
        console.log('📊 Live viewer count updated:', count, 'for salon:', updatedSalonId);
        setViewerCount(count);
      }
    };

    window.addEventListener('live_viewers_update', handleViewerUpdate as EventListener);

    // Fetch initial count using full API URL
    const baseURL = import.meta.env.VITE_API_URL || 'https://no-production-d4fc.up.railway.app';
    const apiUrl = `${baseURL}/api/live-viewers/${salonId}`;
    
    console.log('🔍 Fetching initial viewer count from:', apiUrl);
    
    fetch(apiUrl)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('✅ Initial viewer count received:', data.count);
        setViewerCount(data.count || 0);
      })
      .catch(err => {
        console.error('❌ Failed to fetch viewer count:', err);
        setViewerCount(0);
      });

    return () => {
      window.removeEventListener('live_viewers_update', handleViewerUpdate as EventListener);
    };
  }, [salonId]);

  return (
    <div className="bg-white border border-teal-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <Eye className="h-5 w-5 text-teal-600" />
        <span className="text-xs text-teal-500">LIVE</span>
      </div>
      <div className="text-2xl font-bold text-teal-900" data-testid="text-live-viewers">
        {viewerCount}
      </div>
      <div className="text-xs text-teal-700">
        {viewerCount === 1 ? 'Viewer' : 'Viewers'}
      </div>
    </div>
  );
}
