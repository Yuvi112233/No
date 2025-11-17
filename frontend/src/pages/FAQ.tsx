import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ChevronDown, ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function FAQ() {
  const [, setLocation] = useLocation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      category: "General",
      questions: [
        {
          q: "What is AltQ?",
          a: "AltQ is India's leading smart queue management platform for salons and beauty services. We help customers skip physical waiting by joining virtual queues, while helping salons manage operations efficiently and grow their business."
        },
        {
          q: "Is AltQ free to use?",
          a: "Yes! AltQ is completely free for customers. You can join queues, get notifications, discover salons, and access exclusive offers at no cost. Salons have subscription plans starting from ₹999/month with a 14-day free trial."
        },
        {
          q: "Which cities is AltQ available in?",
          a: "AltQ is currently available in 50+ cities across India including Delhi, Mumbai, Bangalore, Pune, Hyderabad, Chennai, Kolkata, and more. We're rapidly expanding to new cities every month!"
        },
        {
          q: "Do I need to download an app?",
          a: "AltQ works seamlessly on both web browsers and mobile apps. You can access it from any device with an internet connection. Download our app for the best experience with push notifications."
        }
      ]
    },
    {
      category: "For Customers",
      questions: [
        {
          q: "How do I join a queue?",
          a: "Simply find a salon on AltQ, select your desired service, and tap 'Join Queue'. You'll receive real-time updates on your position and get notified when it's almost your turn. It's that easy!"
        },
        {
          q: "How will I know when it's my turn?",
          a: "You'll receive notifications via SMS and app push notifications when you're next in line. We'll also send you a reminder when it's time to head to the salon. You can track your position in real-time on the app."
        },
        {
          q: "Can I cancel my queue position?",
          a: "Yes, you can cancel your position anytime before your turn. Just go to your active queue and tap 'Leave Queue'. This helps the salon serve other customers faster."
        },
        {
          q: "What if I'm late?",
          a: "If you can't make it on time, please cancel your position so others can be served. If you arrive late, the salon may ask you to rejoin the queue depending on their policy and current wait time."
        },
        {
          q: "Can I book for multiple services?",
          a: "Yes! When joining a queue, you can select multiple services. The estimated time will be calculated based on all selected services, and you'll be charged accordingly."
        },
        {
          q: "How do I find salons near me?",
          a: "AltQ automatically detects your location and shows nearby salons. You can also search by area, salon name, or service type. Filter by ratings, distance, and current wait time to find the perfect salon."
        }
      ]
    },
    {
      category: "For Salons",
      questions: [
        {
          q: "How do I register my salon on AltQ?",
          a: "Click 'For Salons' or 'Get Started', sign up with your details, add your salon information, services, photos, and you're ready to start accepting customers! The entire process takes less than 10 minutes."
        },
        {
          q: "What are the pricing plans for salons?",
          a: "We offer two plans: Basic (₹999/month) for up to 100 customers and Pro (₹2,499/month) for unlimited customers with advanced features. Both plans come with a 14-day free trial. Save 20% with annual billing!"
        },
        {
          q: "How does queue management work?",
          a: "Customers join your virtual queue through the app. You see all waiting customers on your dashboard, can notify them when it's their turn, and track their arrival. The system automatically updates wait times and sends notifications."
        },
        {
          q: "Can I manage multiple salon locations?",
          a: "Yes! Our Pro plan supports multi-location management. You can manage all your salon branches from a single dashboard, track performance across locations, and maintain consistent service quality."
        },
        {
          q: "What kind of analytics do I get?",
          a: "You get detailed insights on customer flow, peak hours, service popularity, revenue trends, customer retention, average wait times, and more. Pro plan includes advanced analytics with custom reports."
        },
        {
          q: "How do customers pay?",
          a: "Customers pay at your salon after receiving services, just like normal. AltQ is a queue management platform, not a payment processor. You handle payments as you normally would."
        },
        {
          q: "What if I need help?",
          a: "Basic plan includes email support with 24-hour response time. Pro plan includes 24/7 priority support via phone, email, and chat, plus a dedicated account manager to help you succeed."
        }
      ]
    },
    {
      category: "Technical",
      questions: [
        {
          q: "Is my data secure?",
          a: "Absolutely! We use enterprise-grade encryption to protect all your data. Your personal information, payment details, and salon data are stored securely and never shared with third parties without your consent."
        },
        {
          q: "What if I lose internet connection?",
          a: "The app works offline for basic functions like viewing your queue position. Once you're back online, all data syncs automatically. Notifications are queued and delivered when connection is restored."
        },
        {
          q: "Can I integrate AltQ with my existing systems?",
          a: "Yes! Our Pro plan includes API access for integration with your existing booking systems, CRM, or other tools. Contact our support team for integration assistance."
        },
        {
          q: "What devices are supported?",
          a: "AltQ works on all modern smartphones (iOS and Android), tablets, and web browsers. The web version works on Chrome, Safari, Firefox, and Edge."
        }
      ]
    },
    {
      category: "Billing & Payments",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit/debit cards, UPI, net banking, and digital wallets like Paytm, PhonePe, and Google Pay. All payments are processed securely."
        },
        {
          q: "Can I cancel my subscription?",
          a: "Yes, you can cancel anytime with no cancellation fees. Your subscription will remain active until the end of your billing period. You can reactivate anytime."
        },
        {
          q: "Do you offer refunds?",
          a: "We offer a 14-day free trial so you can try before you buy. If you're not satisfied within the first 30 days of paid subscription, contact us for a full refund."
        },
        {
          q: "Is there a setup fee?",
          a: "No! There are no setup fees, hidden charges, or long-term contracts. You only pay the monthly or annual subscription fee. Cancel anytime."
        }
      ]
    }
  ];

  // Filter FAQs based on search query
  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(faq =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-teal-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-xl sm:text-2xl text-teal-50 max-w-3xl mx-auto leading-relaxed mb-8">
              Everything you need to know about AltQ
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-6 rounded-2xl text-lg bg-white text-gray-900 border-none focus:ring-2 focus:ring-teal-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No results found for "{searchQuery}"</p>
              <Button
                onClick={() => setSearchQuery("")}
                className="mt-4 bg-teal-600 text-white hover:bg-teal-700"
              >
                Clear Search
              </Button>
            </div>
          ) : (
            filteredFaqs.map((category, catIndex) => (
              <div key={catIndex} className="mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-2 h-8 bg-gradient-to-b from-teal-600 to-cyan-600 rounded-full mr-3"></span>
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((faq, qIndex) => {
                    const globalIndex = catIndex * 100 + qIndex;
                    return (
                      <div 
                        key={qIndex}
                        className="bg-white rounded-2xl shadow-lg border border-teal-100 overflow-hidden hover:shadow-xl transition-shadow"
                      >
                        <button
                          onClick={() => setOpenIndex(openIndex === globalIndex ? null : globalIndex)}
                          className="w-full p-6 text-left flex items-center justify-between hover:bg-teal-50 transition-colors"
                        >
                          <span className="font-semibold text-gray-900 pr-4 text-lg">{faq.q}</span>
                          <ChevronDown 
                            className={`w-6 h-6 text-teal-600 flex-shrink-0 transition-transform ${
                              openIndex === globalIndex ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {openIndex === globalIndex && (
                          <div className="px-6 pb-6 text-gray-600 leading-relaxed text-lg border-t border-teal-100 pt-4">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Still Have Questions?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Can't find what you're looking for? Our support team is here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setLocation('/contact')}
              size="lg"
              className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 text-lg px-8 py-6 rounded-2xl font-semibold"
            >
              Contact Support
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => setLocation('/help')}
              size="lg"
              variant="outline"
              className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 text-lg px-8 py-6 rounded-2xl font-semibold"
            >
              Visit Help Center
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-teal-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Experience AltQ?
          </h2>
          <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
            Join thousands who've made salon visits effortless
          </p>
          <Button
            onClick={() => setLocation('/auth')}
            size="lg"
            className="bg-white text-teal-600 hover:bg-teal-50 text-lg px-8 py-6 rounded-2xl font-semibold shadow-xl"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
