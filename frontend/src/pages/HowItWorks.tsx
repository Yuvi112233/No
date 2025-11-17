import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  Search, 
  MousePointerClick, 
  Bell, 
  CheckCircle,
  Store,
  Users,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Smartphone
} from "lucide-react";

export default function HowItWorks() {
  const [, setLocation] = useLocation();

  const customerSteps = [
    {
      icon: Search,
      title: "Find Your Salon",
      description: "Browse nearby salons, check ratings, services, and current queue status",
      step: "1"
    },
    {
      icon: MousePointerClick,
      title: "Join the Queue",
      description: "Select your service and join the virtual queue with one tap",
      step: "2"
    },
    {
      icon: Bell,
      title: "Get Notified",
      description: "Receive real-time updates and notifications when it's almost your turn",
      step: "3"
    },
    {
      icon: CheckCircle,
      title: "Arrive & Enjoy",
      description: "Arrive at the salon at the right time and enjoy your service without waiting",
      step: "4"
    }
  ];

  const salonSteps = [
    {
      icon: Store,
      title: "Create Your Salon",
      description: "Sign up and set up your salon profile with services, pricing, and photos",
      step: "1"
    },
    {
      icon: Users,
      title: "Manage Queues",
      description: "Accept customers into your queue and manage them from your dashboard",
      step: "2"
    },
    {
      icon: Bell,
      title: "Notify Customers",
      description: "Automatically send notifications when it's their turn or when they're nearby",
      step: "3"
    },
    {
      icon: TrendingUp,
      title: "Grow Your Business",
      description: "Track analytics, optimize operations, and increase revenue",
      step: "4"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-teal-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              How AltQ Works
            </h1>
            <p className="text-xl sm:text-2xl text-teal-50 max-w-3xl mx-auto leading-relaxed">
              Simple, smart, and seamless for everyone
            </p>
          </div>
        </div>
      </section>

      {/* For Customers */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              FOR CUSTOMERS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Your Journey to a Hassle-Free Salon Visit
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Four simple steps to skip the wait and enjoy your salon experience
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {customerSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {/* Connector Line */}
                  {index < customerSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-teal-300 to-cyan-300 -translate-x-1/2 z-0"></div>
                  )}
                  
                  <div className="relative bg-white p-6 rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl transition-all z-10">
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {step.step}
                    </div>
                    <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-4 mt-2">
                      <Icon className="w-7 h-7 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Customer Example */}
          <div className="mt-16 bg-gradient-to-br from-teal-50 to-cyan-50 p-8 sm:p-12 rounded-3xl">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <Smartphone className="w-12 h-12 text-teal-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-6">
                Real Example: Raj's Experience
              </h3>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  <strong className="text-teal-600">9:00 AM:</strong> Raj opens AltQ and finds a highly-rated salon near his office. 
                  The app shows 3 people in queue with an estimated 45-minute wait.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-teal-600">9:02 AM:</strong> He joins the queue for a haircut while having breakfast at home.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-teal-600">9:35 AM:</strong> AltQ notifies him: "You're next! Head to the salon now."
                </p>
                <p className="leading-relaxed">
                  <strong className="text-teal-600">9:45 AM:</strong> Raj arrives at the salon and is immediately attended to. 
                  No waiting, no frustration!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Salons */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              FOR SALONS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Transform Your Salon Operations
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Four steps to streamline your business and delight customers
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {salonSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {/* Connector Line */}
                  {index < salonSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-cyan-300 to-teal-300 -translate-x-1/2 z-0"></div>
                  )}
                  
                  <div className="relative bg-white p-6 rounded-2xl shadow-lg border border-cyan-100 hover:shadow-xl transition-all z-10">
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {step.step}
                    </div>
                    <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-4 mt-2">
                      <Icon className="w-7 h-7 text-cyan-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Salon Example */}
          <div className="mt-16 bg-gradient-to-br from-cyan-50 to-teal-50 p-8 sm:p-12 rounded-3xl">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <BarChart3 className="w-12 h-12 text-cyan-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-6">
                Real Example: Style Studio's Success
              </h3>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  <strong className="text-cyan-600">Before AltQ:</strong> Style Studio had crowded waiting areas, 
                  frequent no-shows, and customers leaving due to long waits. Revenue was stagnant.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-cyan-600">After AltQ:</strong> They onboarded in 10 minutes, 
                  started managing queues digitally, and sent automated notifications.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-cyan-600">Results:</strong> 30% increase in customers served, 
                  50% reduction in no-shows, and happier customers who leave 5-star reviews.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-cyan-600">Owner's Quote:</strong> "AltQ transformed our business. 
                  We're more organized, customers are happier, and our revenue has grown significantly!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powered by Smart Technology
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              AI and real-time updates make AltQ the smartest queue management solution
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-gray-600">
                Smart algorithms predict wait times and optimize queue flow
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Updates</h3>
              <p className="text-gray-600">
                Instant notifications and live queue status for everyone
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">
                Your data is encrypted and protected with enterprise-grade security
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-teal-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
            Join thousands who've made salon visits effortless with AltQ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setLocation('/auth')}
              size="lg"
              className="bg-white text-teal-600 hover:bg-teal-50 text-lg px-8 py-6 rounded-2xl font-semibold shadow-xl"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => setLocation('/for-salons')}
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-2xl font-semibold"
            >
              For Salon Owners
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
