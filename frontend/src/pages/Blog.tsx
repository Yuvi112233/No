import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Calendar, Clock, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-teal-100 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation('/')}>
            <img src="/loadlogo.png" alt="AltQ Logo" className="h-20 filter invert" />
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="/about" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">About</a>
            <a href="/features" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">Features</a>
            <a href="/for-salons" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">For Salons</a>
            <a href="/blog" className="font-bold text-teal-600">Blog</a>
          </nav>
          <Button onClick={() => setLocation('/')} className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-600 to-cyan-600 py-10 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Salon Industry Insights & Tips
            </h1>
            <p className="text-lg text-teal-50">
              Expert advice on salon management, queue systems, and growing your business
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border border-gray-200"
              onClick={() => setLocation(`/blog/${blogPosts[0].slug}`)}>
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={blogPosts[0].image}
                    alt={blogPosts[0].title}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-6">
                  <span className="inline-block px-3 py-1 bg-teal-50 rounded-full text-xs font-semibold mb-3 text-teal-700">
                    Featured
                  </span>
                  <h2 className="text-2xl font-bold mb-3 text-gray-900">
                    {blogPosts[0].title}
                  </h2>
                  <p className="text-gray-600 mb-4 text-sm">
                    {blogPosts[0].excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{blogPosts[0].date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{blogPosts[0].readTime}</span>
                    </div>
                  </div>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white text-sm">
                    Read More <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-6 md:py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Latest Articles</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {blogPosts.slice(1).map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                  onClick={() => setLocation(`/blog/${post.slug}`)}
                >
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <span className="inline-block px-2 py-1 bg-teal-50 rounded text-xs font-semibold mb-2 text-teal-700">
                      {post.category}
                    </span>
                    <h3 className="text-lg font-bold mb-2 text-gray-900">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-3 line-clamp-2 text-sm">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
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
      <section className="py-10 bg-teal-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Transform Your Salon?
          </h2>
          <p className="text-base text-teal-50 mb-6 max-w-2xl mx-auto">
            Join thousands of salons using AltQ to eliminate wait times
          </p>
          <Button
            onClick={() => setLocation('/')}
            className="bg-white hover:bg-gray-50 text-teal-600 font-semibold"
          >
            Start Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-teal-800 to-cyan-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/loadlogo.png" alt="AltQ Logo" className="h-20" />
              </div>
              <p className="text-teal-100">
                Alternate for your queue - Smart salon management
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-teal-100">
                <li><a href="/features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="/how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="/for-salons" className="hover:text-white transition-colors">For Salons</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-teal-100">
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-teal-100">
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-teal-600 pt-8 text-center text-teal-100">
            <p>&copy; 2025 AltQ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}