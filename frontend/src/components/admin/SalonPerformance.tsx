import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle } from 'lucide-react';

interface SalonPerformanceData {
  salonId: string;
  salonName: string;
  salonType: string;
  address: string;
  score: number;
  metrics: {
    totalBookings: number;
    completedBookings: number;
    completionRate: number;
    cancelledBookings: number;
    noShows: number;
    noShowRate: number;
    totalRevenue: number;
    avgRating: number;
    avgResponseTimeMinutes: number;
    recentBookings30Days: number;
    recentRevenue30Days: number;
  };
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
}

export default function SalonPerformance() {
  const [data, setData] = useState<SalonPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'score' | 'revenue' | 'bookings'>('score');

  useEffect(() => {
    fetchPerformanceData();
  }, [sortBy]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('smartq_token');
      const baseURL = import.meta.env.VITE_API_URL || 'https://no-production-d4fc.up.railway.app';
      
      const response = await fetch(
        `${baseURL}/api/admin/platform/salon-performance?limit=50&sortBy=${sortBy}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const result = await response.json();
        setData(result.salons);
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-700 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'fair': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'poor': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-blue-600';
    if (score >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const exportCSV = () => {
    const token = localStorage.getItem('smartq_token');
    const baseURL = import.meta.env.VITE_API_URL || 'https://no-production-d4fc.up.railway.app';
    window.open(`${baseURL}/api/admin/platform/export/salons?format=csv&token=${token}`, '_blank');
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading performance data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Salon Performance Ranking</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Performance scores based on completion rate, ratings, response time, and activity
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="score">Sort by Score</option>
              <option value="revenue">Sort by Revenue</option>
              <option value="bookings">Sort by Bookings</option>
            </select>
            <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((salon, index) => (
            <div
              key={salon.salonId}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{salon.salonName}</h3>
                      <p className="text-sm text-gray-500">{salon.address}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-gray-500">Completion Rate</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {salon.metrics.completionRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Avg Rating</p>
                      <p className="text-sm font-semibold text-gray-900">
                        ⭐ {salon.metrics.avgRating}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Revenue</p>
                      <p className="text-sm font-semibold text-green-600">
                        ₹{salon.metrics.totalRevenue.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Recent Activity</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {salon.metrics.recentBookings30Days} bookings
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 ml-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Performance Score</p>
                    <p className={`text-3xl font-bold ${getScoreColor(salon.score)}`}>
                      {salon.score}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getHealthColor(salon.healthStatus)}`}>
                    {salon.healthStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              {salon.healthStatus === 'poor' && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-xs text-red-700">
                    This salon needs attention: High no-show rate ({salon.metrics.noShowRate}%) or low activity
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
