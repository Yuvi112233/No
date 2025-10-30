import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LiveViewerCountProps {
  salonId: string;
}

export default function LiveViewerCount({ salonId }: LiveViewerCountProps) {
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
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200 hover:border-teal-300 transition-all ${
        viewerCount > 0 ? 'shadow-sm' : ''
      }`}
    >
      <Eye className="w-4 h-4 text-teal-600" />
      <span className="font-semibold text-teal-700">{viewerCount}</span>
      <span className="text-xs text-teal-600">
        {viewerCount === 1 ? 'viewer' : 'viewers'}
      </span>
    </Badge>
  );
}
