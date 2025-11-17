import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Check, ArrowRight, Zap, Star, Crown } from "lucide-react";

export default function Pricing() {
  const [, setLocation] = useLocation();

  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      description: "Perfect for customers",
      features: [
        "Join unlimited queues",
        "Real-time notifications",
        "Find nearby salons",
        "Compare salons & reviews",
        "Exclusive offers & discounts",
        "Track queue position live",
        "No hidden charges"
      ],
      cta: "Get Started Free",
      popular: false,
      icon: Star,
      color: "teal"
    },
    {
      name: "Salon Basic",
      price: "₹999",
      period: "per month",
      description: "For small salons",
      features: [
        "Up to 100 customers/month",
        "Queue management dashboard",
        "SMS & app notifications",
        "Basic analytics & reports",
        "Customer database",
        "Email support",
        "Mobile app access"
      ],
      cta: "Start Free Trial",
      popular: false,
      icon: Zap,
      color: "cyan"
    },
    {
      name: "Salon Pro",
      price: "₹2,499",
      period: "per month",
      description: "For growing salons",
      features: [
        "Unlimited customers",
        "Advanced analytics & insights",
        "Priority 24/7 support",
        "Custom branding options",
        "Marketing tools & campaigns",
        "API access for integration",
        "Multi-location support",
        "Dedicated account manager"
      ],
      cta: "Start Free Trial",
      popular: true,
      icon: Crown,
      color: "teal"
    }
  ];

  const faqs = [
    {
      q: "Is there a free trial?",
      a: "Yes! All salon plans come with a 14-day free trial. No credit card required."
    },
    {
      q: "Can I cancel anytime?",
      a: "Absolutely! You can cancel your subscription anytime with no cancellation fees."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit/debit cards, UPI, net banking, and digital wallets."
    },
    {
      q: "Do you offer discounts for annual plans?",
      a: "Yes! Save 20% when you choose annual billing instead of monthly."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-teal-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl sm:text-2xl text-teal-50 max-w-3xl mx-auto leading-relaxed">
              Choose the plan that fits your needs. Always free for customers!
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <div 
                  key={index}
                  className={`bg-white p-8 rounded-3xl shadow-xl border-2 transition-all hover:shadow-2xl ${
                    plan.popular ? 'border-teal-500 relative scale-105' : 'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </div>
                  )}
                  
                  <div className={`w-16 h-16 bg-${plan.color}-100 rounded-2xl flex items-center justify-center mb-4`}>
                    <Icon className={`w-8 h-8 text-${plan.color}-600`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 text-lg">/{plan.period}</span>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className={`w-5 h-5 text-${plan.color}-600 mr-3 flex-shrink-0 mt-0.5`} />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => setLocation('/auth')}
                    className={`w-full py-6 rounded-xl text-lg font-semibold ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700' 
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Annual Discount Banner */}
          <div className="mt-12 bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-2xl p-6 text-center">
            <p className="text-lg text-gray-900">
              <span className="font-bold text-teal-600">💰 Save 20%</span> when you choose annual billing!
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Compare Plans
            </h2>
            <p className="text-lg text-gray-600">
              Find the perfect plan for your salon
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Feature</th>
                  <th className="px-6 py-4 text-center">Basic</th>
                  <th className="px-6 py-4 text-center">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { feature: "Monthly Customers", basic: "100", pro: "Unlimited" },
                  { feature: "Queue Management", basic: "✓", pro: "✓" },
                  { feature: "SMS Notifications", basic: "✓", pro: "✓" },
                  { feature: "Analytics", basic: "Basic", pro: "Advanced" },
                  { feature: "Support", basic: "Email", pro: "24/7 Priority" },
                  { feature: "Custom Branding", basic: "✗", pro: "✓" },
                  { feature: "API Access", basic: "✗", pro: "✓" },
                  { feature: "Multi-location", basic: "✗", pro: "✓" }
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-teal-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{row.basic}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
            Pricing FAQs
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-teal-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{faq.q}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-teal-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
            Start your 14-day free trial today. No credit card required!
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
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
