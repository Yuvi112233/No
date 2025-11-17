import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Calendar, Clock, ArrowLeft, Share2, Sparkles, TrendingUp, Target, Zap, BarChart } from "lucide-react";

export default function BlogPost5() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation('/')}>
            <Sparkles className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              SmartQ
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
                Marketing
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                10 Marketing Strategies to Grow Your Salon Business
              </h1>
              <div className="flex items-center gap-6 text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>November 5, 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>10 min read</span>
                </div>
                <button className="flex items-center gap-2 hover:text-purple-600 transition-colors">
                  <Share2 className="h-5 w-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            <img 
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80" 
              alt="Salon marketing strategy"
              className="w-full h-96 object-cover rounded-2xl mb-12 shadow-lg"
            />

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Growing a salon business requires more than just great services—you need effective marketing to attract new customers and keep existing ones coming back. Here are 10 proven strategies that successful salons use to drive growth in 2025.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900 flex items-center gap-3">
                <Target className="h-8 w-8 text-purple-600" />
                1. Optimize Your Google Business Profile
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Your Google Business Profile is often the first impression potential customers have of your salon. Optimize it to maximize visibility and conversions.
              </p>
              <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-3">
                <li><strong>Complete Every Section:</strong> Fill out all information fields completely</li>
                <li><strong>Add High-Quality Photos:</strong> Upload professional images of your salon, staff, and work</li>
                <li><strong>Collect Reviews:</strong> Actively request reviews from satisfied customers</li>
                <li><strong>Post Regular Updates:</strong> Share promotions, events, and news</li>
                <li><strong>Respond to Reviews:</strong> Engage with all reviews, positive and negative</li>
                <li><strong>Use Booking Integration:</strong> Enable direct booking through your profile</li>
              </ul>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Salons with optimized Google profiles see 70% more website visits and 50% more booking inquiries.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900 flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                2. Leverage Social Media Marketing
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Social media is essential for salons. Visual platforms like Instagram and TikTok are perfect for showcasing your work.
              </p>
              <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-3">
                <li><strong>Post Consistently:</strong> Share content 4-5 times per week minimum</li>
                <li><strong>Show Before/After:</strong> Transformation photos generate the most engagement</li>
                <li><strong>Use Stories and Reels:</strong> Short-form video content reaches more people</li>
                <li><strong>Engage with Followers:</strong> Respond to comments and messages promptly</li>
                <li><strong>Use Local Hashtags:</strong> Help nearby customers find you</li>
                <li><strong>Run Contests:</strong> Encourage sharing and tagging for prizes</li>
              </ul>

              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-2xl my-12">
                <h3 className="text-2xl font-bold mb-4">Social Media ROI</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-4xl font-bold mb-2">3.2x</div>
                    <div className="text-purple-100">More bookings from social</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2">85%</div>
                    <div className="text-purple-100">Discover salons on Instagram</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2">$4.50</div>
                    <div className="text-purple-100">Return per $1 spent</div>
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900 flex items-center gap-3">
                <Zap className="h-8 w-8 text-purple-600" />
                3. Implement a Referral Program
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Word-of-mouth is the most powerful marketing tool. A structured referral program amplifies it.
              </p>
              <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-3">
                <li>Offer incentives for both referrer and new customer</li>
                <li>Make the process simple and trackable</li>
                <li>Promote the program in-salon and digitally</li>
                <li>Consider tiered rewards for multiple referrals</li>
                <li>Thank and recognize top referrers publicly</li>
              </ul>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Referred customers have a 37% higher retention rate and spend 25% more than non-referred customers.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900">4. Email Marketing Campaigns</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Email remains one of the highest ROI marketing channels, with an average return of $42 for every $1 spent.
              </p>
              <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-3">
                <li><strong>Welcome Series:</strong> Nurture new customers with automated emails</li>
                <li><strong>Monthly Newsletters:</strong> Share tips, trends, and promotions</li>
                <li><strong>Birthday Offers:</strong> Send personalized birthday discounts</li>
                <li><strong>Re-engagement Campaigns:</strong> Win back inactive customers</li>
                <li><strong>Seasonal Promotions:</strong> Capitalize on holidays and events</li>
                <li><strong>Appointment Reminders:</strong> Reduce no-shows with automated reminders</li>
              </ul>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900">5. Partner with Local Businesses</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Strategic partnerships expand your reach to new customer bases at minimal cost.
              </p>
              <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-3">
                <li>Cross-promote with complementary businesses (spas, boutiques, gyms)</li>
                <li>Offer exclusive discounts to partner customers</li>
                <li>Host joint events or workshops</li>
                <li>Share each other's content on social media</li>
                <li>Create package deals combining services</li>
              </ul>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900">6. Invest in Local SEO</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Most salon customers search for "salons near me." Optimize for local search to capture this traffic.
              </p>
              <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-3">
                <li>Include location keywords in website content</li>
                <li>Create location-specific landing pages</li>
                <li>Get listed in local directories</li>
                <li>Build local backlinks from community websites</li>
                <li>Ensure NAP (Name, Address, Phone) consistency everywhere</li>
                <li>Create content about local events and trends</li>
              </ul>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900">7. Run Targeted Paid Advertising</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Paid ads can quickly drive new customers when done strategically.
              </p>
              <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-3">
                <li><strong>Google Ads:</strong> Target high-intent search queries</li>
                <li><strong>Facebook/Instagram Ads:</strong> Use demographic and interest targeting</li>
                <li><strong>Retargeting Campaigns:</strong> Re-engage website visitors</li>
                <li><strong>Geo-Targeting:</strong> Focus on customers within your service area</li>
                <li><strong>Seasonal Campaigns:</strong> Promote relevant services at the right time</li>
              </ul>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Start with a small budget ($300-500/month) and scale based on results. Track ROI carefully to optimize spending.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900">8. Create Valuable Content</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Content marketing establishes your expertise and attracts organic traffic.
              </p>
              <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-3">
                <li><strong>Blog Posts:</strong> Write about hair care tips, trends, and tutorials</li>
                <li><strong>Video Tutorials:</strong> Create how-to videos for styling and maintenance</li>
                <li><strong>Style Guides:</strong> Publish seasonal trend reports</li>
                <li><strong>Customer Stories:</strong> Share transformation stories and testimonials</li>
                <li><strong>FAQ Content:</strong> Answer common customer questions</li>
              </ul>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900">9. Host Events and Workshops</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Events create buzz, build community, and attract new customers.
              </p>
              <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-3">
                <li>Styling workshops and demonstrations</li>
                <li>Product launch parties</li>
                <li>Charity fundraisers</li>
                <li>VIP customer appreciation events</li>
                <li>Seasonal makeover events</li>
                <li>Collaboration events with local influencers</li>
              </ul>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900 flex items-center gap-3">
                <BarChart className="h-8 w-8 text-purple-600" />
                10. Track and Optimize Performance
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Marketing without measurement is guesswork. Track these key metrics:
              </p>
              <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-3">
                <li><strong>Customer Acquisition Cost (CAC):</strong> How much you spend to get each new customer</li>
                <li><strong>Customer Lifetime Value (CLV):</strong> Total revenue from each customer</li>
                <li><strong>Conversion Rates:</strong> Percentage of leads that become customers</li>
                <li><strong>Return on Ad Spend (ROAS):</strong> Revenue generated per dollar spent on ads</li>
                <li><strong>Website Traffic Sources:</strong> Where your visitors come from</li>
                <li><strong>Booking Rates:</strong> How many inquiries convert to appointments</li>
              </ul>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Use analytics tools to monitor performance and adjust strategies based on data, not assumptions.
              </p>

              <div className="bg-purple-50 border border-purple-200 p-6 my-12 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Marketing Budget Allocation</h3>
                <p className="text-gray-700 mb-4">For optimal results, consider this budget split:</p>
                <ul className="space-y-2 text-gray-700">
                  <li>• 30% - Digital advertising (Google, Facebook, Instagram)</li>
                  <li>• 25% - Content creation (photos, videos, blog)</li>
                  <li>• 20% - Email marketing and automation</li>
                  <li>• 15% - Referral and loyalty programs</li>
                  <li>• 10% - Events and partnerships</li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900">Creating Your Marketing Plan</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Don't try to implement all strategies at once. Start with 2-3 that align with your goals and resources:
              </p>
              <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-3">
                <li><strong>For New Salons:</strong> Focus on Google Business, social media, and local SEO</li>
                <li><strong>For Established Salons:</strong> Prioritize referral programs, email marketing, and paid ads</li>
                <li><strong>For Growth-Stage Salons:</strong> Invest in content marketing, partnerships, and events</li>
              </ul>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900">The Path Forward</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Successful salon marketing is about consistency, measurement, and adaptation. Start with the basics, track your results, and gradually expand your efforts as you see what works for your specific market.
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Remember: the best marketing is delivering exceptional service that turns customers into advocates. All other strategies amplify that foundation.
              </p>

              <div className="bg-purple-50 border-l-4 border-purple-600 p-6 my-12 rounded-r-lg">
                <p className="text-gray-800 font-semibold mb-2">Grow your salon with SmartQ</p>
                <p className="text-gray-700 mb-4">Our platform includes built-in marketing tools, analytics, and customer engagement features to help you grow faster.</p>
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
            <span className="text-xl font-bold">SmartQ</span>
          </div>
          <p className="text-gray-400 mb-6">Smart queue management for modern salons</p>
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
