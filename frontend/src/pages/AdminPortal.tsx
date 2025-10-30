import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, BarChart3, Users, Store, Lock } from 'lucide-react';

export default function AdminPortal() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Platform Admin</h1>
              <p className="text-xs text-gray-500">Management Portal</p>
            </div>
          </div>
          <Button
            onClick={() => setLocation('/')}
            variant="outline"
            size="sm"
          >
            Back to Site
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600 rounded-3xl mb-6 shadow-xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Platform Administration
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive management and analytics for your entire salon booking platform
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-sm text-gray-600">
                Platform-wide metrics and insights
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Store className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Salons</h3>
              <p className="text-sm text-gray-600">
                Manage all registered salons
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Users</h3>
              <p className="text-sm text-gray-600">
                Track user growth and activity
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Security</h3>
              <p className="text-sm text-gray-600">
                Role-based access control
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardContent className="py-12 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to manage your platform?</h3>
            <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
              Sign in with your super admin credentials to access the full dashboard
            </p>
            <Button
              onClick={() => setLocation('/admin-login')}
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 h-12"
            >
              <Shield className="w-5 h-5 mr-2" />
              Sign In to Admin Dashboard
            </Button>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-2">
            🔒 Secure admin area - All actions are logged and monitored
          </p>
          <p className="text-xs text-gray-400">
            For support, contact your system administrator
          </p>
        </div>
      </div>
    </div>
  );
}
