import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Bell, 
  BarChart3, 
  Shield,
  Zap,
  Heart,
  ArrowRight,
  Check,
  Star
} from "lucide-react";

export default function ForSalons() {
  const [, setLocation] = useLocation();

  const benefits = [
    {
      icon: TrendingUp,
      title: "Increase Revenue by 30%",
      description: "Serve more customers efficiently, reduce idle time, and boost your salon's revenue significantly.",
      color: "teal"
    },
    {
      icon: Users,
      title: "Better Customer Experience",
      description: "Eliminate crowded waiting areas. Customers arrive exactly when it's their turn, leading to happier clients.",
      color: "cyan"
    },
    {
      icon: Clock,
      title: "Save Time & Reduce Stress",
      description: "Automated queue management and notifications save hours of manual coordination every week.",
      color: "teal"
    },
    {
      icon: Bell,
      title: "Reduce No-Shows by 50%",
      description: "Automated SMS and app notifications ensure customers remember their appointments and arrive on time.",
      color: "cyan"
    },
    {
      icon: BarChart3,
      title: "Data-Driven Insights",
      description: "Track peak hours, popular services, customer trends, and revenue patterns to make smarter business decisions.",
      color: "teal"
    },
    {
      icon: Shield,
      title: "Safe & Organized",
      description: "Maintain social distancing, reduce crowding, and keep your salon organized and professional.",
      color: "cyan"
    }
  ];

  const features = [
    "Smart queue management dashboard",
    "Real-time customer tracking",
    "Automated SMS & app notifications",
    "Detailed analytics & reports",
    "Customer database & history",
    "Service & pricing management",
    "Photo gallery & reviews",
    "Exclusive offers & promotions",
    "Multi-location support (Pro)",
    "API integration (Pro)",
    "24/7 priority support (Pro)",
    "Custom branding (Pro)"
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      salon: "Glamour Studio, Delhi",
      image: "👩",
      rating: 5,
      text: "AltQ transformed our business! We serve 40% more customers now, and our clients love the no-wait experience. Best investment we've made!"
    },
    {
      name: "Rajesh Kumar",
      salon: "Style Hub, Mumbai",
      image: "👨",
      rating: 5,
      text: "The analytics helped us identify peak hours and optimize staffing. Revenue increased by 35% in just 3 months. Highly recommended!"
    },
    {
      name: "Anita Desai",
      salon: "Beauty Lounge, Bangalore",
      image: "👩",
      rating: 5,
      text: "No more crowded waiting areas! Customers are happier, staff is less stressed, and our Google ratings improved from 3.8 to 4.7 stars!"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-teal-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
                FOR SALON OWNERS
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Grow Your Salon with Smart Queue Management
              </h1>
              <p className="text-xl sm:text-2xl text-teal-50 mb-8 leading-relaxed">
                Increase revenue, reduce no-shows, and delight customers with India's #1 salon management platform
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => setLocation('/auth')}
                  size="lg"
                  className="bg-white text-teal-600 hover:bg-teal-50 text-lg px-8 py-6 rounded-2xl font-semibold shadow-xl"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  onClick={() => setLocation('/pricing')}
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-2xl font-semibold"
                >
                  View Pricing
                </Button>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">30%</p>
                    <p className="text-teal-100">Revenue Increase</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">500+</p>
                    <p className="text-teal-100">Partner Salons</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                    <Star className="w-8 h-8 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">4.8/5</p>
                    <p className="text-teal-100">Average Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Salons Love AltQ
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Proven benefits that transform your salon business
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl transition-shadow"
                >
                  <div className={`w-16 h-16 bg-${benefit.color}-100 rounded-2xl flex items-center justify-center mb-4`}>
                    <Icon className={`w-8 h-8 text-${benefit.color}-600`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Everything You Need to Manage Your Salon
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Powerful features designed specifically for salon owners. Get started in minutes, no technical knowledge required.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-8 rounded-3xl">
              <img 
                src="/loadlogo.png" 
                alt="AltQ Dashboard" 
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              <p className="text-center text-gray-600 mt-4">
                Intuitive dashboard designed for salon owners
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Success Stories from Salon Owners
            </h2>
            <p className="text-lg text-gray-600">
              Real results from real salons across India
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-teal-100">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{testimonial.image}</div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.salon}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-lg text-gray-600">
              Setup takes less than 10 minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Sign Up & Setup",
                description: "Create your account, add salon details, services, and photos. It's quick and easy!",
                icon: Zap
              },
              {
                step: "2",
                title: "Start Accepting Customers",
                description: "Customers can now find you on AltQ and join your queue. You manage everything from your dashboard.",
                icon: Users
              },
              {
                step: "3",
                title: "Grow Your Business",
                description: "Track analytics, optimize operations, and watch your revenue grow. We're with you every step!",
                icon: TrendingUp
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg text-center relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {item.step}
                  </div>
                  <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 mt-4">
                    <Icon className="w-8 h-8 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-teal-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Join 500+ Successful Salons on AltQ
          </h2>
          <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
            Start your 14-day free trial today. No credit card required. Cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setLocation('/auth')}
              size="lg"
              className="bg-white text-teal-600 hover:bg-teal-50 text-lg px-8 py-6 rounded-2xl font-semibold shadow-xl"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => setLocation('/contact')}
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-2xl font-semibold"
            >
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
