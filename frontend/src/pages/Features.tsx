import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  Clock, 
  Bell, 
  MapPin, 
  Star, 
  Percent, 
  BarChart3, 
  Users, 
  Smartphone,
  Shield,
  Zap,
  TrendingUp,
  Heart,
  ArrowRight
} from "lucide-react";

export default function Features() {
  const [, setLocation] = useLocation();

  const customerFeatures = [
    {
      icon: Clock,
      title: "Virtual Queue Management",
      description: "Join salon queues remotely from anywhere. No more physical waiting in crowded spaces.",
      color: "teal"
    },
    {
      icon: Bell,
      title: "Real-Time Notifications",
      description: "Get instant alerts when it's almost your turn. Never miss your slot again.",
      color: "cyan"
    },
    {
      icon: MapPin,
      title: "Find Nearby Salons",
      description: "Discover top-rated salons near you with live queue status and estimated wait times.",
      color: "teal"
    },
    {
      icon: Star,
      title: "Compare & Choose",
      description: "Compare salons by ratings, services, prices, and current wait times to make the best choice.",
      color: "cyan"
    },
    {
      icon: Percent,
      title: "Exclusive Offers",
      description: "Access special discounts and offers from your favorite salons, all in one place.",
      color: "teal"
    },
    {
      icon: Smartphone,
      title: "Easy Mobile Booking",
      description: "Book appointments and join queues with just a few taps on your smartphone.",
      color: "cyan"
    }
  ];

  const salonFeatures = [
    {
      icon: Users,
      title: "Smart Queue Dashboard",
      description: "Manage all your queues from one powerful dashboard. See who's waiting, who's next, and who's nearby.",
      color: "teal"
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Track customer flow, peak hours, service popularity, and revenue trends with detailed analytics.",
      color: "cyan"
    },
    {
      icon: Bell,
      title: "Automated Notifications",
      description: "Automatically notify customers via SMS and app notifications. Reduce no-shows significantly.",
      color: "teal"
    },
    {
      icon: TrendingUp,
      title: "Increase Revenue",
      description: "Serve more customers efficiently, reduce idle time, and boost your salon's revenue by 30%.",
      color: "cyan"
    },
    {
      icon: Shield,
      title: "Reduce Crowding",
      description: "Keep your salon organized and safe. Customers arrive only when it's their turn.",
      color: "teal"
    },
    {
      icon: Zap,
      title: "Quick Setup",
      description: "Get started in minutes. No complex hardware or training required. Just sign up and go!",
      color: "cyan"
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
              AltQ Features
            </h1>
            <p className="text-xl sm:text-2xl text-teal-50 max-w-3xl mx-auto leading-relaxed">
              Everything you need for a seamless salon experience
            </p>
          </div>
        </div>
      </section>

      {/* Customer Features */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              FOR CUSTOMERS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Features That Save Your Time
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Say goodbye to waiting rooms and hello to convenience
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {customerFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl transition-shadow"
                >
                  <div className={`w-14 h-14 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className={`w-7 h-7 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Salon Features */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              FOR SALONS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Salon Management Made Easy
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful tools to grow your business and delight customers
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {salonFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-cyan-100 hover:shadow-xl transition-shadow"
                >
                  <div className={`w-14 h-14 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className={`w-7 h-7 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AltQ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The smart choice for modern salon experiences
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-8 rounded-3xl">
              <Heart className="w-12 h-12 text-teal-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Customer Satisfaction
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">✓</span>
                  <span>No more frustrating waits in crowded salons</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">✓</span>
                  <span>Plan your day better with accurate wait times</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">✓</span>
                  <span>Discover the best salons with real reviews</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">✓</span>
                  <span>Save money with exclusive offers</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-8 rounded-3xl">
              <TrendingUp className="w-12 h-12 text-cyan-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Business Growth
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-cyan-600 mr-2">✓</span>
                  <span>Increase revenue by serving more customers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-600 mr-2">✓</span>
                  <span>Reduce no-shows with automated reminders</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-600 mr-2">✓</span>
                  <span>Gain insights with powerful analytics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-600 mr-2">✓</span>
                  <span>Build loyalty with better customer experience</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-teal-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Experience All Features Today
          </h2>
          <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
            Join thousands who've transformed their salon experience with AltQ
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
