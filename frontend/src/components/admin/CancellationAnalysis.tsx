import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, TrendingDown, Calendar } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface CancellationData {
  summary: {
    totalCancellations: number;
    totalBookings: number;
    cancellationRate: number;
  };
  trends: Array<{
    _id: { date: string; status: string };
    count: number;
  }>;
  bySalon: Array<{
    salonId: string;
    salonName: string;
    noShows: number;
    cancelled: number;
    total: number;
  }>;
  reasons: Array<{
    _id: string;
    count: number;
  }>;
  patterns: {
    byHour: Array<{ _id: number; count: number }>;
    byDayOfWeek: Array<{ _id: number; count: number }>;
  };
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CancellationAnalysis() {
  const [data, setData] = useState<CancellationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Set default date range (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    
    fetchCancellationData(start.toISOString(), end.toISOString());
  }, []);

  const fetchCancellationData = async (start?: string, end?: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('smartq_token');
      const baseURL = import.meta.env.VITE_API_URL || 'https://no-production-d4fc.up.railway.app';
      
      const params = new URLSearchParams();
      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);
      
      const response = await fetch(
        `${baseURL}/api/admin/platform/cancellation-analysis?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch cancellation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = () => {
    fetchCancellationData(startDate, endDate);
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading cancellation analysis...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="py-12">
          <p className="text-center text-gray-600">No data available</p>
        </CardContent>
      </Card>
    );
  }

  // Process hourly data
  const hourlyData = data.patterns.byHour.map(item => ({
    hour: `${item._id}:00`,
    cancellations: item.count,
  }));

  // Process day of week data
  const dayOfWeekData = data.patterns.byDayOfWeek.map(item => ({
    day: DAY_NAMES[item._id - 1] || 'Unknown',
    cancellations: item.count,
  }));

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Date Range:</span>
            </div>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
            <span className="text-gray-500">to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
            />
            <Button onClick={handleDateFilter} className="bg-purple-600 hover:bg-purple-700">
              Apply Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Cancellations</p>
                <p className="text-3xl font-bold text-red-600">{data.summary.totalCancellations}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancellation Rate</p>
                <p className="text-3xl font-bold text-orange-600">
                  {data.summary.cancellationRate.toFixed(1)}%
                </p>
              </div>
              <TrendingDown className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-blue-600">{data.summary.totalBookings}</p>
              </div>
              <Calendar className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Pattern */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Cancellations by Hour of Day</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cancellations" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Day of Week Pattern */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Cancellations by Day of Week</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dayOfWeekData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cancellations" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Salons with Cancellations */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Top 20 Salons by Cancellations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Salon</th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-700">No-Shows</th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-700">Cancelled</th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-700">Total</th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-700">Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.bySalon.map((salon) => {
                  const rate = ((salon.total / data.summary.totalBookings) * 100).toFixed(1);
                  return (
                    <tr key={salon.salonId} className="border-b border-gray-100 hover:bg-red-50">
                      <td className="p-3">
                        <span className="font-semibold text-gray-900">{salon.salonName}</span>
                      </td>
                      <td className="text-right p-3">
                        <span className="font-semibold text-red-600">{salon.noShows}</span>
                      </td>
                      <td className="text-right p-3">
                        <span className="font-semibold text-orange-600">{salon.cancelled}</span>
                      </td>
                      <td className="text-right p-3">
                        <span className="font-bold text-gray-900">{salon.total}</span>
                      </td>
                      <td className="text-right p-3">
                        <span className="text-sm text-gray-600">{rate}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Reasons */}
      {data.reasons.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Cancellation Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.reasons.map((reason) => (
                <div key={reason._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <span className="text-gray-900">{reason._id || 'Not specified'}</span>
                  <span className="font-semibold text-gray-700">{reason.count} times</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
