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
        setViewerCount(count);
      }
    };

    window.addEventListener('live_viewers_update', handleViewerUpdate as EventListener);

    // Fetch initial count
    fetch(`/api/live-viewers/${salonId}`)
      .then(res => res.json())
      .then(data => setViewerCount(data.count || 0))
      .catch(err => console.error('Failed to fetch viewer count:', err));

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
