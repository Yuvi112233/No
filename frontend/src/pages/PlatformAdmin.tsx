import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Users, Store, Calendar, DollarSign, TrendingUp, Search, Activity, ArrowUpRight, Filter, Download, RefreshCw } from 'lucide-react';
import SalonPerformance from '@/components/admin/SalonPerformance';
import UserSegmentation from '@/components/admin/UserSegmentation';
import CancellationAnalysis from '@/components/admin/CancellationAnalysis';

interface PlatformStats {
  overview: {
    totalSalons: number;
    totalUsers: number;
    totalBookings: number;
    totalServices: number;
    activeSalons: number;
  };
  bookings: {
    byStatus: Record<string, number>;
    total: number;
  };
  revenue: {
    total: number;
    completedBookings: number;
    averageBookingValue: number;
  };
  growth: {
    newUsersLast30Days: number;
    newSalonsLast30Days: number;
  };
}

interface Salon {
  id: string;
  name: string;
  address: string;
  type: string;
  rating: string;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  metrics: {
    totalBookings: number;
    completedBookings: number;
    revenue: number;
    services: number;
  };
}

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

export default function PlatformAdmin() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    console.log('PlatformAdmin: Current user:', user);
    console.log('PlatformAdmin: User role:', user?.role);

    if (!user) {
      console.log('PlatformAdmin: No user, redirecting to admin login');
      window.location.href = '/admin-login';
      return;
    }

    if (user?.role !== 'super_admin') {
      console.log('PlatformAdmin: User is not super_admin, redirecting to admin login');
      window.location.href = '/admin-login';
      return;
    }

    console.log('PlatformAdmin: User is super_admin, fetching data');
    fetchPlatformStats();
    fetchSalons();
  }, [user, currentPage]);

  // Auto-refresh polling every 30 seconds
  useEffect(() => {
    if (!autoRefresh || !user || user.role !== 'super_admin') return;

    const interval = setInterval(() => {
      console.log('Auto-refreshing dashboard data...');
      fetchPlatformStats();
      fetchSalons();
      setLastUpdated(new Date());
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, user, currentPage]);

  const fetchPlatformStats = async () => {
    try {
      const token = localStorage.getItem('smartq_token');
      console.log('Fetching platform stats with token:', token ? 'exists' : 'missing');

      const baseURL = import.meta.env.VITE_API_URL || 'https://no-production-d4fc.up.railway.app';
      const response = await fetch(`${baseURL}/api/admin/platform/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Platform stats response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Platform stats data:', data);
        setStats(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch stats:', response.status, errorText);
      }
    } catch (error) {
      console.error('Failed to fetch platform stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchPlatformStats(), fetchSalons()]);
    setLastUpdated(new Date());
    setRefreshing(false);
  };

  const formatLastUpdated = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastUpdated.toLocaleTimeString();
  };

  const fetchSalons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('smartq_token');
      console.log('Fetching salons with token:', token ? 'exists' : 'missing');

      const baseURL = import.meta.env.VITE_API_URL || 'https://no-production-d4fc.up.railway.app';
      const response = await fetch(
        `${baseURL}/api/admin/platform/salons?page=${currentPage}&limit=20&search=${searchTerm}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Salons response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Salons data:', data);
        setSalons(data.salons);
        setTotalPages(data.pagination.pages);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch salons:', response.status, errorText);
      }
    } catch (error) {
      console.error('Failed to fetch salons:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need super admin privileges to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Current role: {user?.role || 'none'}</p>
          <Button
            onClick={() => window.location.href = '/admin-login'}
            className="mt-4 bg-purple-600 hover:bg-purple-700"
          >
            Go to Admin Login
          </Button>
        </div>
      </div>
    );
  }

  const bookingStatusData = stats?.bookings.byStatus
    ? Object.entries(stats.bookings.byStatus).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Platform Dashboard</h1>
            <div className="flex items-center gap-3">
              <p className="text-gray-600">Monitor and manage your entire platform</p>
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-gray-500">
                  {autoRefresh ? 'Live' : 'Paused'} • Updated {formatLastUpdated()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Activity className={`h-4 w-4 ${autoRefresh ? 'text-green-600' : 'text-gray-400'}`} />
              {autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Salons</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Store className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats?.overview.totalSalons || 0}</div>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  {stats?.growth.newSalonsLast30Days || 0}
                </span>
                <span className="text-xs text-gray-500">this month</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {stats?.overview.activeSalons || 0} active salons
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Users</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats?.overview.totalUsers || 0}</div>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  {stats?.growth.newUsersLast30Days || 0}
                </span>
                <span className="text-xs text-gray-500">new users</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Last 30 days growth
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Bookings</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats?.overview.totalBookings || 0}</div>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs font-medium text-green-600">
                  {stats?.revenue.completedBookings || 0}
                </span>
                <span className="text-xs text-gray-500">completed</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {((stats?.revenue.completedBookings || 0) / (stats?.overview.totalBookings || 1) * 100).toFixed(1)}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                ₹{(stats?.revenue.total || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs font-medium text-gray-700">
                  ₹{(stats?.revenue.averageBookingValue || 0).toFixed(0)}
                </span>
                <span className="text-xs text-gray-500">avg per booking</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                From {stats?.revenue.completedBookings || 0} bookings
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-pink-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Services</CardTitle>
              <div className="p-2 bg-pink-100 rounded-lg">
                <Activity className="h-5 w-5 text-pink-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats?.overview.totalServices || 0}</div>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs font-medium text-gray-700">
                  {((stats?.overview.totalServices || 0) / (stats?.overview.totalSalons || 1)).toFixed(1)}
                </span>
                <span className="text-xs text-gray-500">per salon</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Platform-wide offerings
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white shadow-sm border-0 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="salons" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Salons
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Performance
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Users
            </TabsTrigger>
            <TabsTrigger value="cancellations" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Cancellations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Booking Status Distribution */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Booking Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={bookingStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {bookingStatusData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Growth Metrics */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Platform Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">New Users (30 days)</span>
                        <span className="text-sm font-bold text-purple-600">{stats?.growth.newUsersLast30Days || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, ((stats?.growth.newUsersLast30Days || 0) / (stats?.overview.totalUsers || 1)) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {((stats?.growth.newUsersLast30Days || 0) / (stats?.overview.totalUsers || 1) * 100).toFixed(1)}% of total users
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">New Salons (30 days)</span>
                        <span className="text-sm font-bold text-green-600">{stats?.growth.newSalonsLast30Days || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, ((stats?.growth.newSalonsLast30Days || 0) / (stats?.overview.totalSalons || 1)) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {((stats?.growth.newSalonsLast30Days || 0) / (stats?.overview.totalSalons || 1) * 100).toFixed(1)}% of total salons
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Active Salons</span>
                        <span className="text-sm font-bold text-blue-600">{stats?.overview.activeSalons || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, ((stats?.overview.activeSalons || 0) / (stats?.overview.totalSalons || 1)) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {((stats?.overview.activeSalons || 0) / (stats?.overview.totalSalons || 1) * 100).toFixed(1)}% activity rate
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Completion Rate</p>
                      <p className="text-3xl font-bold mt-1">
                        {((stats?.revenue.completedBookings || 0) / (stats?.overview.totalBookings || 1) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <TrendingUp className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Avg Services/Salon</p>
                      <p className="text-3xl font-bold mt-1">
                        {((stats?.overview.totalServices || 0) / (stats?.overview.totalSalons || 1)).toFixed(1)}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <Activity className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Revenue/Booking</p>
                      <p className="text-3xl font-bold mt-1">
                        ₹{(stats?.revenue.averageBookingValue || 0).toFixed(0)}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <DollarSign className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="salons" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">All Salons</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or address..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchSalons()}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={fetchSalons} className="bg-purple-600 hover:bg-purple-700">
                    Search
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200 bg-gray-50">
                            <th className="text-left p-4 text-sm font-semibold text-gray-700">Salon</th>
                            <th className="text-left p-4 text-sm font-semibold text-gray-700">Owner</th>
                            <th className="text-left p-4 text-sm font-semibold text-gray-700">Type</th>
                            <th className="text-right p-4 text-sm font-semibold text-gray-700">Bookings</th>
                            <th className="text-right p-4 text-sm font-semibold text-gray-700">Revenue</th>
                            <th className="text-right p-4 text-sm font-semibold text-gray-700">Services</th>
                            <th className="text-right p-4 text-sm font-semibold text-gray-700">Rating</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salons.map((salon) => (
                            <tr key={salon.id} className="border-b border-gray-100 hover:bg-purple-50 transition-colors">
                              <td className="p-4">
                                <div>
                                  <div className="font-semibold text-gray-900">{salon.name}</div>
                                  <div className="text-sm text-gray-500 mt-1">{salon.address}</div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{salon.owner?.name}</div>
                                  <div className="text-xs text-gray-500 mt-1">{salon.owner?.email}</div>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${salon.type === 'men' ? 'bg-blue-100 text-blue-700' :
                                    salon.type === 'women' ? 'bg-pink-100 text-pink-700' :
                                      'bg-purple-100 text-purple-700'
                                  }`}>
                                  {salon.type}
                                </span>
                              </td>
                              <td className="text-right p-4">
                                <span className="font-semibold text-gray-900">{salon.metrics.totalBookings}</span>
                              </td>
                              <td className="text-right p-4">
                                <span className="font-semibold text-green-600">
                                  ₹{salon.metrics.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </span>
                              </td>
                              <td className="text-right p-4">
                                <span className="font-semibold text-gray-900">{salon.metrics.services}</span>
                              </td>
                              <td className="text-right p-4">
                                <div className="flex items-center justify-end gap-1">
                                  <span className="text-yellow-500">★</span>
                                  <span className="font-semibold text-gray-900">{parseFloat(salon.rating).toFixed(1)}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        Showing page {currentPage} of {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="disabled:opacity-50"
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="disabled:opacity-50"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={bookingStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {bookingStatusData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">New Users (30 days)</span>
                        <span className="text-sm font-bold">{stats?.growth.newUsersLast30Days || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(100, ((stats?.growth.newUsersLast30Days || 0) / (stats?.overview.totalUsers || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">New Salons (30 days)</span>
                        <span className="text-sm font-bold">{stats?.growth.newSalonsLast30Days || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${Math.min(100, ((stats?.growth.newSalonsLast30Days || 0) / (stats?.overview.totalSalons || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <SalonPerformance />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <UserSegmentation />
          </TabsContent>

          <TabsContent value="cancellations" className="space-y-4">
            <CancellationAnalysis />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
