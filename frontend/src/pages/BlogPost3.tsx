import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Calendar, Clock, ArrowLeft, Share2, Sparkles, Smartphone, TrendingUp, Users, DollarSign } from "lucide-react";

export default function BlogPost3() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation('/')}>
            <Sparkles className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AltQ
            </span>
          </div>
          <Button onClick={() => setLocation('/blog')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </div>
      </header>

      <article className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold mb-4">
                Technology
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Why Your Salon Needs a Booking App in 2025
              </h1>
              <div className="flex items-center gap-6 text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>November 10, 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>6 min read</span>
                </div>
                <button className="flex items-center gap-2 hover:text-purple-600 transition-colors">
                  <Share2 className="h-5 w-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            <img 
              src="https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=1200&q=80" 
              alt="Salon booking app on smartphone"
              className="w-full h-96 object-cover rounded-2xl mb-12 shadow-lg"
            />

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                In 2025, having a mobile booking app isn't just a nice-to-have—it's essential for salon success. With 85% of customers preferring to book services via mobile apps, salons without this technology are losing significant market share to competitors who offer digital convenience.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900 flex items-center gap-3">
                <Smartphone className="h-8 w-8 text-purple-600" />
                The Mobile-First Customer
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Today's salon customers live on their smartphones. They expect to book appointments, check wait times, and manage their beauty routines all from their mobile devices. Salons that don't meet these expectations are seen as outdated and inconvenient.
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Research shows that 73% of customers will choose a salon with easy mobile booking over one without, even if the latter offers slightly better prices or is closer to their location.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900 flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                Increased Bookings and Revenue
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Booking apps dramatically increase appointment volume by removing friction from the booking process. Here's how:
              </p>
              <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-3">
                <li><strong>24/7 Availability:</strong> Customers can book anytime, not just during business hours</li>
                <li><strong>Impulse Bookings:</strong> Easy booking captures spontaneous decisions</li>
                <li><strong>Reduced No-Shows:</strong> Automated reminders decrease no-show rates by 40%</li>
                <li><strong>Upselling Opportunities:</strong> Apps can suggest additional services during booking</li>
              </ul>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Salons using booking apps report an average 35% increase in monthly bookings within the first three months of implementation.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900 flex items-center gap-3">
                <Users className="h-8 w-8 text-purple-600" />
                Better Customer Experience
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Modern booking apps provide features that significantly enhance the customer experience:
              </p>
              <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-3">
                <li><strong>Real-Time Availability:</strong> See open slots instantly without phone calls</li>
                <li><strong>Stylist Selection:</strong> Choose preferred stylists and view their portfolios</li>
                <li><strong>Service Browsing:</strong> Explore services with descriptions and pricing</li>
                <li><strong>Appointment History:</strong> Track past services and rebook favorites</li>
                <li><strong>Digital Payments:</strong> Pay securely through the app</li>
                <li><strong>Loyalty Rewards:</strong> Earn and redeem points automatically</li>
              </ul>

              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-2xl my-12">
                <h3 className="text-2xl font-bold mb-4">Customer Satisfaction Stats</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-4xl font-bold mb-2">92%</div>
                    <div className="text-purple-100">Prefer app booking over phone calls</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2">4.8/5</div>
                    <div className="text-purple-100">Average satisfaction rating</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2">67%</div>
                    <div className="text-purple-100">More likely to return</div>
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900 flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-purple-600" />
                Operational Efficiency
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Booking apps don't just benefit customers—they streamline salon operations:
              </p>
              <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-3">
                <li><strong>Reduced Phone Time:</strong> Staff spend 70% less time on booking calls</li>
                <li><strong>Automated Scheduling:</strong> Smart algorithms optimize stylist allocation</li>
                <li><strong>Digital Records:</strong> Automatic customer history and preferences tracking</li>
                <li><strong>Analytics Dashboard:</strong> Real-time insights into booking patterns and revenue</li>
                <li><strong>Staff Management:</strong> Easy schedule management and shift planning</li>
              </ul>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900">Marketing and Customer Retention</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Booking apps are powerful marketing tools that help retain customers and attract new ones:
              </p>
              <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-3">
                <li><strong>Push Notifications:</strong> Send targeted promotions and reminders</li>
                <li><strong>Referral Programs:</strong> Built-in features to encourage word-of-mouth</li>
                <li><strong>Review Collection:</strong> Automated requests for reviews after appointments</li>
                <li><strong>Personalized Offers:</strong> AI-driven recommendations based on history</li>
                <li><strong>Social Sharing:</strong> Easy sharing of results and experiences</li>
              </ul>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900">Competitive Advantage</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                In a crowded market, a booking app sets you apart. Customers searching for salons online are more likely to choose businesses that offer convenient digital booking. Your app becomes a 24/7 marketing tool that showcases your services and makes booking effortless.
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Additionally, the data collected through your app provides valuable insights into customer preferences, peak times, and popular services—information you can use to make strategic business decisions.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900">Choosing the Right Solution</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                When selecting a booking app for your salon, look for these essential features:
              </p>
              <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-3">
                <li>User-friendly interface for both customers and staff</li>
                <li>Real-time synchronization across all devices</li>
                <li>Integrated payment processing</li>
                <li>Automated reminders and notifications</li>
                <li>Customer management and history tracking</li>
                <li>Analytics and reporting tools</li>
                <li>Customizable branding options</li>
              </ul>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900">The ROI is Clear</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                The investment in a booking app typically pays for itself within 2-3 months through increased bookings, reduced no-shows, and operational efficiencies. Salons report an average ROI of 400% in the first year.
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                In 2025, a booking app isn't an expense—it's an investment in your salon's future. The question isn't whether you can afford to implement one, but whether you can afford not to.
              </p>

              <div className="bg-purple-50 border-l-4 border-purple-600 p-6 my-12 rounded-r-lg">
                <p className="text-gray-800 font-semibold mb-2">Transform your salon with AltQ</p>
                <p className="text-gray-700 mb-4">Get a complete booking and queue management solution designed specifically for modern salons.</p>
                <Button 
                  onClick={() => setLocation('/')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Start Free Trial
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>

      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-purple-400" />
            <span className="text-xl font-bold">AltQ</span>
          </div>
          <p className="text-gray-400 mb-6">Alternate for your queue - Smart salon management</p>
          <div className="flex justify-center gap-6 text-gray-400">
            <a href="/about" className="hover:text-white transition-colors">About</a>
            <a href="/blog" className="hover:text-white transition-colors">Blog</a>
            <a href="/contact" className="hover:text-white transition-colors">Contact</a>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
