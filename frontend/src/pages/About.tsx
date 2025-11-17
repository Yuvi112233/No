import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Users, Target, Heart, Sparkles, ArrowRight } from "lucide-react";

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-teal-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              About AltQ
            </h1>
            <p className="text-xl sm:text-2xl text-teal-50 max-w-3xl mx-auto leading-relaxed">
              Revolutionizing salon experiences across India with smart queue management
            </p>
          </div>
        </div>
      </section>

      {/* What is AltQ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              What is AltQ?
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              AltQ is India's leading smart queue management platform for salons and beauty services. 
              We eliminate waiting time frustration by allowing customers to join virtual queues, 
              track their position in real-time, and get notified when it's their turn.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-teal-100">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">For Customers</h3>
                <p className="text-gray-600">
                  No more physical waiting. Join queues remotely, track your position, 
                  and arrive exactly when it's your turn.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-teal-100">
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">For Salons</h3>
                <p className="text-gray-600">
                  Streamline operations, reduce crowding, increase customer satisfaction, 
                  and boost revenue with our smart dashboard.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-8 rounded-3xl">
              <img 
                src="/loadlogo.png" 
                alt="AltQ Logo" 
                className="w-32 h-32 mx-auto mb-6"
              />
              <div className="space-y-4 text-center">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <p className="text-3xl font-bold text-teal-600">10,000+</p>
                  <p className="text-gray-600">Happy Customers</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <p className="text-3xl font-bold text-cyan-600">500+</p>
                  <p className="text-gray-600">Partner Salons</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <p className="text-3xl font-bold text-teal-600">50+</p>
                  <p className="text-gray-600">Cities Covered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-8 rounded-3xl">
              <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                To transform the salon and beauty service industry in India by eliminating 
                waiting time frustration and creating seamless, efficient experiences for 
                both customers and businesses. We believe everyone deserves a stress-free 
                salon visit.
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-8 rounded-3xl">
              <div className="w-16 h-16 bg-cyan-600 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                To become India's most trusted and widely-used smart queue management 
                platform, empowering thousands of salons and millions of customers with 
                technology that saves time, reduces stress, and enhances the beauty 
                service experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Our Story
            </h2>
          </div>

          <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-teal-100">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                AltQ was born from a simple frustration: waiting endlessly at salons. 
                Our founders experienced firsthand the pain of uncertain wait times, 
                crowded waiting areas, and the inability to plan their day around salon visits.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                In 2024, we set out to solve this problem using technology. We built a 
                platform that allows customers to join virtual queues from anywhere, 
                track their position in real-time, and receive notifications when it's 
                their turn.
              </p>

              <p className="text-gray-700 leading-relaxed mb-6">
                What started as a solution for customers quickly evolved into a powerful 
                tool for salon owners too. Our smart dashboard helps salons manage queues 
                efficiently, reduce crowding, improve customer satisfaction, and ultimately 
                grow their business.
              </p>

              <p className="text-gray-700 leading-relaxed">
                Today, AltQ serves thousands of customers and hundreds of salons across 
                India. We're proud to be making salon visits stress-free, one queue at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Customer First",
                description: "Every decision we make prioritizes customer experience and satisfaction",
                icon: "👥"
              },
              {
                title: "Innovation",
                description: "We constantly innovate to solve real problems with smart technology",
                icon: "💡"
              },
              {
                title: "Transparency",
                description: "We believe in honest communication and clear expectations",
                icon: "🔍"
              },
              {
                title: "Excellence",
                description: "We strive for excellence in every feature, every interaction",
                icon: "⭐"
              }
            ].map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-teal-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Experience AltQ?
          </h2>
          <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers who've said goodbye to salon waiting times
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
