import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Calendar, Clock, ArrowLeft, Share2, Sparkles, CheckCircle } from "lucide-react";

export default function BlogPost2() {
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
                Business Tips
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                5 Proven Strategies to Reduce Salon Wait Times
              </h1>
              <div className="flex items-center gap-6 text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>November 12, 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>7 min read</span>
                </div>
                <button className="flex items-center gap-2 hover:text-purple-600 transition-colors">
                  <Share2 className="h-5 w-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            <img 
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80" 
              alt="Busy salon with efficient operations"
              className="w-full h-96 object-cover rounded-2xl mb-12 shadow-lg"
            />

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Long wait times are the number one complaint in the salon industry. They frustrate customers, reduce revenue, and damage your reputation. Here are five proven strategies that successful salons use to minimize wait times and maximize customer satisfaction.
              </p>

              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-2xl mb-12">
                <h3 className="text-2xl font-bold mb-4">Quick Stats</h3>
                <ul className="space-y-2">
                  <li>• 89% of customers won't return after a bad wait experience</li>
                  <li>• Average salon loses $50,000/year due to walk-aways</li>
                  <li>• Reducing wait times by 50% can increase revenue by 30%</li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900 flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                1. Implement Digital Queue Management
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                The most effective way to reduce wait times is to eliminate physical waiting altogether. Digital queue management systems allow customers to join a virtual queue from their phones, arriving only when their turn is near.
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                <strong>Implementation tip:</strong> Choose a system that provides real-time updates and accurate wait time predictions. AltQ's AI-powered algorithms can predict wait times with 95% accuracy.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900 flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                2. Optimize Staff Scheduling
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Analyze your busiest hours and ensure adequate staffing during peak times. Many salons are understaffed during lunch hours and Saturday mornings, leading to bottlenecks.
              </p>
              <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-3">
                <li>Track customer flow patterns over several weeks</li>
                <li>Schedule your most efficient stylists during peak hours</li>
                <li>Consider staggered shifts to maintain coverage</li>
                <li>Use data analytics to predict busy periods</li>
              </ul>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900 flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                3. Streamline Service Processes
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Review your service workflows to identify and eliminate inefficiencies. Small improvements in each step can significantly reduce overall service time.
              </p>
              <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-3">
                <li><strong>Pre-consultation:</strong> Gather customer preferences before they arrive</li>
                <li><strong>Product organization:</strong> Keep frequently used items within easy reach</li>
                <li><strong>Station setup:</strong> Prepare workstations between clients</li>
                <li><strong>Payment processing:</strong> Use mobile payment systems for faster checkout</li>
              </ul>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900 flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                4. Offer Accurate Time Estimates
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Nothing frustrates customers more than inaccurate wait time estimates. Be realistic and transparent about how long services will take.
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Modern queue management systems use historical data and real-time factors to provide accurate predictions. This helps customers plan their time and reduces perceived wait times.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900 flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                5. Create a Comfortable Waiting Experience
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                When waits are unavoidable, make them pleasant. A comfortable waiting area with amenities can significantly improve customer perception of wait times.
              </p>
              <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-3">
                <li>Provide complimentary beverages and snacks</li>
                <li>Offer free Wi-Fi and charging stations</li>
                <li>Display entertainment options (magazines, TV)</li>
                <li>Keep the area clean and well-maintained</li>
                <li>Provide regular updates on wait status</li>
              </ul>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900">Measuring Success</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Track these key metrics to measure the effectiveness of your wait time reduction strategies:
              </p>
              <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-3">
                <li>Average wait time per customer</li>
                <li>Customer satisfaction scores</li>
                <li>Walk-away rate (customers who leave before service)</li>
                <li>Daily customer throughput</li>
                <li>Staff utilization rates</li>
              </ul>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900">The Bottom Line</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Reducing wait times isn't just about customer satisfaction—it's about business growth. Salons that successfully minimize wait times see higher customer retention, increased revenue, and better online reviews.
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Start with digital queue management as your foundation, then layer in the other strategies for maximum impact. The investment in these improvements will pay for itself many times over through increased customer loyalty and revenue.
              </p>

              <div className="bg-purple-50 border-l-4 border-purple-600 p-6 my-12 rounded-r-lg">
                <p className="text-gray-800 font-semibold mb-2">Ready to eliminate wait times?</p>
                <p className="text-gray-700 mb-4">AltQ helps salons reduce wait times by 60% on average. Start your free trial today.</p>
                <Button 
                  onClick={() => setLocation('/')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Get Started Free
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
