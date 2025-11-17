import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Calendar, Clock, ArrowRight, TrendingUp, Users, Sparkles } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  slug: string;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "digital-queue-management",
    title: "Digital Queue Management: The Future of Salon Operations",
    excerpt: "Discover how digital queue management systems are revolutionizing the salon industry, reducing wait times by 60% and increasing customer satisfaction.",
    date: "November 15, 2025",
    readTime: "5 min read",
    category: "Industry Trends",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80"
  },
  {
    id: "2",
    slug: "reduce-salon-wait-times",
    title: "5 Proven Strategies to Reduce Salon Wait Times",
    excerpt: "Learn practical tips to minimize customer wait times, improve salon efficiency, and boost your revenue with smart scheduling techniques.",
    date: "November 12, 2025",
    readTime: "7 min read",
    category: "Business Tips",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80"
  },
  {
    id: "3",
    slug: "salon-booking-app-2025",
    title: "Why Your Salon Needs a Booking App in 2025",
    excerpt: "Explore the top benefits of implementing a salon booking app, from increased bookings to better customer retention and streamlined operations.",
    date: "November 10, 2025",
    readTime: "6 min read",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800&q=80"
  },
  {
    id: "4",
    slug: "build-customer-loyalty",
    title: "How to Build Customer Loyalty in Your Salon",
    excerpt: "Learn proven strategies to turn first-time visitors into lifelong clients and build a loyal customer base that drives sustainable growth.",
    date: "November 8, 2025",
    readTime: "8 min read",
    category: "Customer Experience",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80"
  },
  {
    id: "5",
    slug: "salon-marketing-strategies",
    title: "10 Marketing Strategies to Grow Your Salon Business",
    excerpt: "Discover cutting-edge marketing tactics that successful salons are using to attract new customers and build lasting relationships.",
    date: "November 5, 2025",
    readTime: "10 min read",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80"
  }
];

export default function Blog() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation('/')}>
              <img src="/loadlogo.png" alt="AltQ Logo" className="h-20 filter invert" />
            </div>
            <nav className="hidden md:flex gap-6">
              <a href="/about" className="text-gray-600 hover:text-[#0f857a] transition-colors">About</a>
              <a href="/features" className="text-gray-600 hover:text-[#0f857a] transition-colors">Features</a>
              <a href="/for-salons" className="text-gray-600 hover:text-[#0f857a] transition-colors">For Salons</a>
              <a href="/blog" className="font-semibold" style={{ color: '#0f857a' }}>Blog</a>
            </nav>
            <Button onClick={() => setLocation('/')} className="hover:opacity-90" style={{ backgroundColor: '#0f857a' }}>
              Get Started
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#0f857a' }}>
                Salon Industry Insights & Tips
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Expert advice on salon management, queue systems, customer experience, and growing your beauty business
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" style={{ color: '#0f857a' }} />
                  <span>Industry Trends</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" style={{ color: '#0f857a' }} />
                  <span>Customer Experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" style={{ color: '#0f857a' }} />
                  <span>Business Growth</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Post */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer"
                   onClick={() => setLocation(`/blog/${blogPosts[0].slug}`)}>
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <img 
                      src={blogPosts[0].image} 
                      alt={blogPosts[0].title}
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:w-1/2 p-8 md:p-12">
                    <span className="inline-block px-3 py-1 bg-teal-50 rounded-full text-sm font-semibold mb-4" style={{ color: '#0f857a' }}>
                      Featured Post
                    </span>
                    <h2 className="text-3xl font-bold mb-4 text-gray-900">
                      {blogPosts[0].title}
                    </h2>
                    <p className="text-gray-600 mb-6">
                      {blogPosts[0].excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{blogPosts[0].date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{blogPosts[0].readTime}</span>
                      </div>
                    </div>
                    <Button className="hover:opacity-90" style={{ backgroundColor: '#0f857a' }}>
                      Read More <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-900">Latest Articles</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {blogPosts.slice(1).map((post) => (
                  <div 
                    key={post.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
                    onClick={() => setLocation(`/blog/${post.slug}`)}
                  >
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <span className="inline-block px-3 py-1 bg-teal-50 rounded-full text-xs font-semibold mb-3" style={{ color: '#0f857a' }}>
                        {post.category}
                      </span>
                      <h3 className="text-xl font-bold mb-3 text-gray-900">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{post.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20" style={{ backgroundColor: '#0f857a' }}>
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Salon?
            </h2>
            <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
              Join thousands of salons using AltQ to eliminate wait times and delight customers
            </p>
            <Button 
              size="lg"
              onClick={() => setLocation('/')}
              className="bg-white hover:bg-gray-100 text-lg px-8 py-6"
              style={{ color: '#0f857a' }}
            >
              Start Free Trial
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <img src="/loadlogo.png" alt="AltQ Logo" className="h-20" />
                </div>
                <p className="text-gray-400">
                  Alternate for your queue - Smart salon management
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="/how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                  <li><a href="/for-salons" className="hover:text-white transition-colors">For Salons</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/privacy" className="hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="/terms" className="hover:text-white transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
              <p>&copy; 2025 AltQ. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
  );
}