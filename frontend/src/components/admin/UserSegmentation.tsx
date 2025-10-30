import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Users, TrendingUp, DollarSign } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface UserSegment {
  count: number;
  totalLTV: number;
  avgLTV: number;
  totalBookings: number;
  avgBookings: number;
}

interface TopUser {
  userId: string;
  userName: string;
  email: string;
  segment: string;
  metrics: {
    totalBookings: number;
    completedBookings: number;
    lifetimeValue: number;
    avgBookingValue: number;
    recentBookings30Days: number;
    daysSinceFirstBooking: number;
    daysSinceLastBooking: number;
    accountAge: number;
  };
}

interface SegmentationData {
  segments: Record<string, UserSegment>;
  topUsers: TopUser[];
  totalUsers: number;
  totalLTV: number;
}

const SEGMENT_COLORS: Record<string, string> = {
  power_user: '#10B981',
  loyal: '#3B82F6',
  regular: '#8B5CF6',
  new: '#F59E0B',
  churned: '#EF4444',
  inactive: '#6B7280',
};

const SEGMENT_LABELS: Record<string, string> = {
  power_user: 'Power Users',
  loyal: 'Loyal',
  regular: 'Regular',
  new: 'New',
  churned: 'Churned',
  inactive: 'Inactive',
};

export default function UserSegmentation() {
  const [data, setData] = useState<SegmentationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSegmentationData();
  }, []);

  const fetchSegmentationData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('smartq_token');
      const baseURL = import.meta.env.VITE_API_URL || 'https://no-production-d4fc.up.railway.app';
      
      const response = await fetch(
        `${baseURL}/api/admin/platform/user-segmentation`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch segmentation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const token = localStorage.getItem('smartq_token');
    const baseURL = import.meta.env.VITE_API_URL || 'https://no-production-d4fc.up.railway.app';
    window.open(`${baseURL}/api/admin/platform/export/users?format=csv&token=${token}`, '_blank');
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user segmentation...</p>
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

  const segmentChartData = Object.entries(data.segments).map(([key, value]) => ({
    name: SEGMENT_LABELS[key] || key,
    value: value.count,
    color: SEGMENT_COLORS[key] || '#6B7280',
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{data.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total LTV</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{data.totalLTV.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg LTV</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{(data.totalLTV / data.totalUsers).toFixed(0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Power Users</p>
                <p className="text-2xl font-bold text-purple-600">
                  {data.segments.power_user?.count || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Segment Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>User Segment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={segmentChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {segmentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Segment Details */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Segment Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.segments).map(([key, segment]) => (
                <div key={key} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: SEGMENT_COLORS[key] }}
                      />
                      <span className="font-semibold text-gray-900">
                        {SEGMENT_LABELS[key] || key}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-700">{segment.count} users</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Avg LTV</p>
                      <p className="font-semibold text-green-600">
                        ₹{segment.avgLTV.toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Avg Bookings</p>
                      <p className="font-semibold text-blue-600">
                        {segment.avgBookings.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Top 20 Users by Lifetime Value</CardTitle>
            <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export All Users
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Rank</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Segment</th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-700">LTV</th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-700">Bookings</th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-700">Avg Value</th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-700">Recent</th>
                </tr>
              </thead>
              <tbody>
                {data.topUsers.map((user, index) => (
                  <tr key={user.userId} className="border-b border-gray-100 hover:bg-purple-50">
                    <td className="p-3">
                      <span className="font-bold text-gray-400">#{index + 1}</span>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-semibold text-gray-900">{user.userName}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${SEGMENT_COLORS[user.segment]}20`,
                          color: SEGMENT_COLORS[user.segment],
                        }}
                      >
                        {SEGMENT_LABELS[user.segment] || user.segment}
                      </span>
                    </td>
                    <td className="text-right p-3">
                      <span className="font-semibold text-green-600">
                        ₹{user.metrics.lifetimeValue.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="text-right p-3">
                      <span className="font-semibold text-gray-900">
                        {user.metrics.totalBookings}
                      </span>
                    </td>
                    <td className="text-right p-3">
                      <span className="text-gray-700">
                        ₹{user.metrics.avgBookingValue.toFixed(0)}
                      </span>
                    </td>
                    <td className="text-right p-3">
                      <span className="text-sm text-gray-600">
                        {user.metrics.recentBookings30Days} (30d)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
