import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { MapPin, Star, Clock, ArrowRight, TrendingUp, Percent } from "lucide-react";

export default function SalonsInLudhiana() {
    const [, setLocation] = useLocation();

    const areas = [
        "Model Town", "Sarabha Nagar", "Civil Lines", "Ferozepur Road",
        "Pakhowal Road", "BRS Nagar", "Dugri", "Haibowal",
        "Ghumar Mandi", "PAU Campus", "Fountain Chowk", "Gill Road"
    ];

    const popularSalons = [
        {
            name: "Elite Salon & Spa",
            area: "Model Town",
            rating: 4.8,
            reviews: 180,
            waitTime: "15 min",
            services: "Haircut, Spa, Facial"
        },
        {
            name: "Glamour Studio",
            area: "Sarabha Nagar",
            rating: 4.7,
            reviews: 150,
            waitTime: "20 min",
            services: "Hair Color, Makeup, Manicure"
        },
        {
            name: "Style Lounge",
            area: "Civil Lines",
            rating: 4.9,
            reviews: 220,
            waitTime: "10 min",
            services: "Bridal Makeup, Hair Styling"
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
                            Best Salons in Ludhiana
                        </h1>
                        <p className="text-xl sm:text-2xl text-teal-50 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Skip the wait at top-rated salons across Ludhiana with AltQ
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-6 text-teal-50">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-6 h-6" />
                                <span className="text-lg font-semibold">200+ Salons</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Star className="w-6 h-6" />
                                <span className="text-lg font-semibold">4.8 Avg Rating</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-6 h-6" />
                                <span className="text-lg font-semibold">Zero Wait Time</span>
                            </div>
                        </div>
                        <Button
                            onClick={() => setLocation('/auth')}
                            size="lg"
                            className="mt-8 bg-white text-teal-600 hover:bg-teal-50 text-lg px-8 py-6 rounded-2xl font-semibold shadow-xl"
                        >
                            Find Salons Near You
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Popular Areas */}
            <section className="py-16 sm:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
                        Find Salons by Area in Ludhiana
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {areas.map((area, index) => (
                            <button
                                key={index}
                                onClick={() => setLocation('/auth')}
                                className="bg-white p-6 rounded-xl shadow-lg border border-teal-100 hover:border-teal-500 hover:shadow-xl transition-all text-left group"
                            >
                                <MapPin className="w-6 h-6 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
                                <h3 className="font-semibold text-gray-900 mb-1">{area}</h3>
                                <p className="text-sm text-teal-600 group-hover:translate-x-1 transition-transform">View salons →</p>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Salons */}
            <section className="py-16 sm:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
                        Top-Rated Salons in Ludhiana
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {popularSalons.map((salon, index) => (
                            <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{salon.name}</h3>
                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {salon.area}
                                        </p>
                                    </div>
                                    <div className="bg-teal-100 px-3 py-1 rounded-full">
                                        <span className="text-sm font-semibold text-teal-700">{salon.waitTime}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                        <span className="font-semibold text-gray-900">{salon.rating}</span>
                                    </div>
                                    <span className="text-sm text-gray-600">({salon.reviews} reviews)</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">{salon.services}</p>
                                <Button
                                    onClick={() => setLocation('/auth')}
                                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 rounded-xl"
                                >
                                    Join Queue
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose AltQ in Ludhiana */}
            <section className="py-16 sm:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center">
                        Why Ludhiana Loves AltQ
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                            <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8 text-teal-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Save Time</h3>
                            <p className="text-gray-600 leading-relaxed">
                                No more waiting in crowded Ludhiana salons. Join queues remotely and arrive when it's your turn.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                            <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="w-8 h-8 text-cyan-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Find Best Salons</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Discover top-rated salons near you with real reviews and ratings from Ludhiana customers.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                            <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Percent className="w-8 h-8 text-teal-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Exclusive Offers</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Get special discounts and offers from your favorite salons across Ludhiana.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEO Content */}
            <section className="py-16 sm:py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="prose prose-lg max-w-none">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            Best Salon Booking App in Ludhiana
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            Looking for the best salons in Ludhiana? AltQ is your go-to platform for discovering and booking appointments at top-rated salons across Ludhiana. From Model Town to Sarabha Nagar, Civil Lines to Ferozepur Road, find the perfect salon near you with just a few taps.
                        </p>

                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            How AltQ Works in Ludhiana
                        </h3>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            Simply download AltQ or visit our website, find salons in your area, join the virtual queue, and get notified when it's your turn. No more wasting time in waiting rooms! Whether you're in Model Town, Sarabha Nagar, Civil Lines, or any other area of Ludhiana, AltQ has you covered.
                        </p>

                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Popular Salon Services in Ludhiana
                        </h3>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            Ludhiana's salons offer a wide range of services including haircuts, hair coloring, spa treatments, facials, bridal makeup, manicures, pedicures, and more. With AltQ, you can compare services, prices, and reviews to find exactly what you need.
                        </p>

                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Why Choose AltQ for Salon Bookings in Ludhiana?
                        </h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                            <li>200+ verified salons across Ludhiana</li>
                            <li>Real-time queue status and wait times</li>
                            <li>Genuine reviews from Ludhiana customers</li>
                            <li>Exclusive offers and discounts</li>
                            <li>Free to use for all customers</li>
                            <li>Available in all major areas of Ludhiana</li>
                        </ul>

                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Areas We Cover in Ludhiana
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                            AltQ partners with salons in Model Town, Sarabha Nagar, Civil Lines, Ferozepur Road, Pakhowal Road, BRS Nagar, Dugri, Haibowal, Ghumar Mandi, PAU Campus, Fountain Chowk, Gill Road, and many more areas across Ludhiana. Find your nearest salon today!
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 sm:py-20 bg-gradient-to-br from-teal-600 to-cyan-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                        Find Your Perfect Salon in Ludhiana
                    </h2>
                    <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
                        Join thousands of Ludhiana residents who've said goodbye to salon waiting times
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
