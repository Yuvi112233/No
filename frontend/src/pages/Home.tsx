import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Users, Gift, Heart, Scissors, Palette, Sparkles, Zap, Crown, Flame, User as UserIcon, ChevronLeft, ChevronRight } from "lucide-react";
import SalonCard from "../components/SalonCard";
import AllSalonsCard from "../components/AllSalonsCard";
import Autoplay from "embla-carousel-autoplay";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { getUserCategory } from "../utils/categoryUtils";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import type { SalonWithDetails } from "../types";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const { user } = useAuth();
  const allSalonsRef = useRef<HTMLElement>(null);
  const favoritesRef = useRef<HTMLElement>(null);
  const trendingSalonsRef = useRef<HTMLElement>(null);
  const [showFavoritesSection, setShowFavoritesSection] = useState(false);
  const [exploreFilter, setExploreFilter] = useState<'highly-rated' | 'nearest'>('highly-rated');
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [selectedSalonType, setSelectedSalonType] = useState<'men' | 'women' | 'unisex'>(() => {
    // Initialize with user's selected category from localStorage, fallback to 'unisex'
    return getUserCategory() || 'unisex';
  });
  const [currentSlide, setCurrentSlide] = useState(0);


  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  // Promotional carousel slides
  const promoSlides = [
    {
      id: 1,
      title: "Premium salon services",
      subtitle: "Book now and save big",
      discount: "50%",
      buttonText: "Get Offer Now !",
      image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
      gradient: "from-black/60 to-transparent"
    },
    {
      id: 2,
      title: "Transform your look",
      subtitle: "Expert stylists await you",
      discount: "30%",
      buttonText: "Book Now !",
      image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
      gradient: "from-purple-900/60 to-transparent"
    },
    {
      id: 3,
      title: "Weekend special offers",
      subtitle: "Relax with spa treatments",
      discount: "40%",
      buttonText: "Explore Deals !",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
      gradient: "from-teal-900/60 to-transparent"
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [promoSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promoSlides.length) % promoSlides.length);
  };

  const { data: salons = [], isLoading, error } = useQuery<SalonWithDetails[]>({
    queryKey: ['/api/salons'],
    queryFn: () => api.salons.getAll(),
  });

  // Debug log to see what data we're getting
  console.log('Salons data from API:', salons);



  if (error) {
    console.error('Error loading salons:', error);
  }


  const handleSearch = () => {
    // Trim spaces and sanitize input
    const trimmedQuery = searchQuery.trim();
    setSearchQuery(trimmedQuery);

    if ((trimmedQuery || location) && allSalonsRef.current) {
      allSalonsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle loading and error states
  if (error) {
    console.error('Error loading salons:', error);
  }

  const filteredSalons = useMemo(() => {
    const filtered = salons.filter(salon => {
      // Filter by salon type first
      const matchesType = salon.type === selectedSalonType;

      // Sanitize search query: trim spaces and remove special characters
      const sanitizedQuery = searchQuery.trim().replace(/[^a-zA-Z0-9\s]/g, '');

      // If search is empty after sanitization, show all salons (TC59)
      const matchesSearch = !sanitizedQuery ||
        salon.name.toLowerCase().includes(sanitizedQuery.toLowerCase()) ||
        salon.services?.some(service =>
          service.name.toLowerCase().includes(sanitizedQuery.toLowerCase())
        );

      const matchesLocation = !location || salon.location.toLowerCase().includes(location.toLowerCase());
      return matchesType && matchesSearch && matchesLocation;
    });

    // Sort by offers when there's a search query (prioritize high offers)
    if (searchQuery.trim()) {
      return [...filtered].sort((a, b) => {
        const maxOfferA = Math.max(...(a.offers?.map(offer => Number(offer.discount) || 0) || [0]));
        const maxOfferB = Math.max(...(b.offers?.map(offer => Number(offer.discount) || 0) || [0]));
        return maxOfferB - maxOfferA;
      });
    }

    return filtered;
  }, [salons, selectedSalonType, searchQuery, location]);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get user's geolocation
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to manual location input or default location
          setUserLocation({ lat: 30.7333, lng: 76.7794 }); // Default to Chandigarh
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setUserLocation({ lat: 30.7333, lng: 76.7794 }); // Default to Chandigarh
    }
  };

  // Get explore salons based on filter and salon type
  const exploreSalons = useMemo(() => {
    const typedSalons = salons.filter(salon => salon.type === selectedSalonType);

    if (exploreFilter === 'highly-rated') {
      return [...typedSalons]
        .sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))
        .slice(0, 5);
    } else if (exploreFilter === 'nearest' && userLocation) {
      return [...typedSalons]
        .map(salon => ({
          ...salon,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            salon.latitude || 30.7333,
            salon.longitude || 76.7794
          )
        }))
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))
        .slice(0, 5);
    }
    return [];
  }, [salons, exploreFilter, userLocation, selectedSalonType]);

  // Sort salons by offers for top section (filtered by type)
  const topSalonsWithOffers = [...salons]
    .filter(salon => salon.type === selectedSalonType && salon.offers && salon.offers.length > 0)
    .sort((a, b) => {
      const maxOfferA = Math.max(...(a.offers?.map(offer => Number(offer.discount) || 0) || [0]));
      const maxOfferB = Math.max(...(b.offers?.map(offer => Number(offer.discount) || 0) || [0]));
      return maxOfferB - maxOfferA;
    });

  const favoriteSalons = useMemo(() => {
    if (!user || !user.favoriteSalons) return [];
    return salons.filter(salon => salon.type === selectedSalonType && user.favoriteSalons.includes(salon.id));
  }, [salons, user, selectedSalonType]);

  // Type-specific service categories
  const getServiceCategories = (type: 'men' | 'women' | 'unisex') => {
    const categories = {
      men: [
        {
          id: 1,
          name: "Haircut",
          image: "/haircut.jpg",
          searchQuery: "haircut"
        },
        {
          id: 2,
          name: "Beard Trim",
          image: "/beard-trimming.jpg",
          searchQuery: "beard"
        },
        {
          id: 3,
          name: "Shave",
          image: "/shave.jpg",
          searchQuery: "shave"
        },
        {
          id: 4,
          name: "Hair Styling",
          image: "/hairstyling.jpg",
          searchQuery: "styling"
        },
        {
          id: 5,
          name: "Massage",
          image: "/body-massage.jpg",
          searchQuery: "massage"
        },
        {
          id: 6,
          name: "Facial",
          image: "/facial-massage.jpg",
          searchQuery: "facial"
        },
        {
          id: 7,
          name: "Hair Color",
          image: "/hair-color.jpg",
          searchQuery: "hair color"
        },
        {
          id: 8,
          name: "Manicure",
          image: "/manicure.jpg",
          searchQuery: "manicure"
        }
      ],
      women: [
        {
          id: 1,
          name: "Haircut",
          image: "/haircut.jpg",
          searchQuery: "haircut"
        },
        {
          id: 2,
          name: "Hair Color",
          image: "/hair-color.jpg",
          searchQuery: "hair color"
        },
        {
          id: 3,
          name: "Facial",
          image: "/facial-massage.jpg",
          searchQuery: "facial"
        },
        {
          id: 4,
          name: "Manicure",
          image: "/manicure.jpg",
          searchQuery: "manicure"
        },
        {
          id: 5,
          name: "Pedicure",
          image: "/pedicure.jpg",
          searchQuery: "pedicure"
        },
        {
          id: 6,
          name: "Makeup",
          image: "/makeup.jpg",
          searchQuery: "makeup"
        },
        {
          id: 7,
          name: "Eyebrow",
          image: "/eyebrow.jpg",
          searchQuery: "eyebrow"
        },
        {
          id: 8,
          name: "Massage",
          image: "/body-massage.jpg",
          searchQuery: "massage"
        }
      ],
      unisex: [
        {
          id: 1,
          name: "Haircut",
          image: "/haircut.jpg",
          searchQuery: "haircut"
        },
        {
          id: 2,
          name: "Hair Color",
          image: "/hair-color.jpg",
          searchQuery: "hair color"
        },
        {
          id: 3,
          name: "Facial",
          image: "/facial-massage.jpg",
          searchQuery: "facial"
        },
        {
          id: 4,
          name: "Massage",
          image: "/body-massage.jpg",
          searchQuery: "massage"
        },
        {
          id: 5,
          name: "Hair Styling",
          image: "/hairstyling.jpg",
          searchQuery: "styling"
        },
        {
          id: 6,
          name: "Manicure",
          image: "/manicure.jpg",
          searchQuery: "manicure"
        },
        {
          id: 7,
          name: "Pedicure",
          image: "/pedicure.jpg",
          searchQuery: "pedicure"
        },
        {
          id: 8,
          name: "Beard Trim",
          image: "/beard-trimming.jpg",
          searchQuery: "beard"
        }
      ]
    };
    return categories[type];
  };

  const salonServiceCategories = getServiceCategories(selectedSalonType);

  // Service inspiration cards
  const serviceInspirations = [
    {
      id: 1,
      title: "Fresh Haircut",
      description: "Transform your look with a trendy new style",
      icon: Scissors,
      gradient: "from-blue-500 to-purple-600",
    },
    {
      id: 2,
      title: "Hair Coloring",
      description: "Express yourself with vibrant colors",
      icon: Palette,
      gradient: "from-pink-500 to-rose-600",
    },
    {
      id: 3,
      title: "Styling & Blowout",
      description: "Perfect finish for any occasion",
      icon: Sparkles,
      gradient: "from-amber-500 to-orange-600",
    },
    {
      id: 4,
      title: "Hair Treatment",
      description: "Nourish and repair your hair",
      icon: Crown,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      id: 5,
      title: "Beard Grooming",
      description: "Sharp and well-maintained look",
      icon: Zap,
      gradient: "from-slate-500 to-gray-600",
    },
    {
      id: 6,
      title: "Special Occasion",
      description: "Wedding, party, or event styling",
      icon: Flame,
      gradient: "from-violet-500 to-purple-600",
    }
  ];

  // Get theme colors and background based on salon type
  const getThemeConfig = (type: 'men' | 'women' | 'unisex') => {
    const themes = {
      men: {
        background: "bg-gradient-to-br from-blue-50 via-slate-50 to-gray-50",
        heroImage: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        primaryColor: "blue",
        accentColor: "slate",
        cardBg: "bg-white/90 border-blue-100"
      },
      women: {
        background: "bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50",
        heroImage: "https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        primaryColor: "pink",
        accentColor: "rose",
        cardBg: "bg-white/90 border-pink-100"
      },
      unisex: {
        background: "bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50",
        heroImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
        primaryColor: "purple",
        accentColor: "indigo",
        cardBg: "bg-white/90 border-purple-100"
      }
    };
    return themes[type];
  };

  const currentTheme = getThemeConfig(selectedSalonType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 pb-20 md:pb-0">

      {/* Hero Section - Different for logged in/out users */}
      {user ? (
        /* Logged In User - Professional Mobile-First Hero */
        <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-500 to-teal-700 hero-bg-effect">
          {/* Decorative Shapes */}
          <div className="hero-shapes"></div>

          {/* Light Rays Effect */}
          <div className="hero-light-rays"></div>

          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '30px 30px'
            }}></div>
          </div>

          {/* Content Layer */}
          <div className="relative z-10 px-4 pt-4 pb-6">
            <div className="max-w-7xl mx-auto">
              {/* Header with Greeting - Compact & Clean */}
              <div className="flex items-start justify-between mb-5">
                {/* Left: Greeting */}
                <div className="space-y-1 pr-4">
                  <p className="text-white/90 text-base font-medium">
                    Hello, {user.name?.split(' ')[0] || 'User'}! 👋
                  </p>
                  <h1 className="text-xl md:text-2xl font-bold text-white leading-tight max-w-[200px]">
                    Discover Your Perfect Salon
                  </h1>
                </div>

                {/* Right: Animation - Smaller, non-intrusive */}
                <div className="w-24 h-24 flex-shrink-0 -mr-10">
                  <DotLottieReact
                    src="https://lottie.host/dfb2ab5d-ecdc-4aa4-ab64-181def37bd11/DWB1LXlcDu.lottie"
                    loop
                    autoplay
                  />
                </div>
              </div>

              {/* Search Bar - Compact */}
              <div className="mb-4">
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search salons or services..."
                      className="pl-10 pr-3 py-2.5 text-sm border-0 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg w-full"
                      value={searchQuery}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 50) {
                          setSearchQuery(value);
                        }
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      maxLength={50}
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="bg-white hover:bg-gray-50 text-teal-600 px-4 py-2.5 rounded-xl shadow-lg flex-shrink-0"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Promotional Banner - Fixed Layout */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/30 shadow-xl">
                {/* Content */}
                <div className="p-5">
                  {promoSlides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`transition-all duration-500 ${index === currentSlide
                        ? 'opacity-100 block'
                        : 'opacity-0 hidden'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        {/* Left: Text Content */}
                        <div className="flex-1 min-w-0">
                          <div className="inline-block px-2 py-0.5 bg-yellow-400/90 rounded-full text-[10px] font-bold text-gray-900 mb-2">
                            LIMITED OFFER
                          </div>
                          <h2 className="text-base md:text-lg font-bold text-white mb-1 leading-snug">
                            {slide.title}
                          </h2>
                          <p className="text-xs text-white/80 mb-3">
                            {slide.subtitle}
                          </p>
                          <Button
                            onClick={() => {
                              if (trendingSalonsRef.current) {
                                trendingSalonsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }}
                            className="bg-white hover:bg-gray-50 text-teal-600 font-semibold px-4 py-1.5 rounded-full text-xs shadow-lg h-auto"
                          >
                            {slide.buttonText}
                          </Button>
                        </div>

                        {/* Right: Discount Badge */}
                        <div className="flex-shrink-0">
                          <div className="relative w-20 h-20 md:w-24 md:h-24">
                            <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-20"></div>
                            <div className="relative w-full h-full bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full flex flex-col items-center justify-center shadow-2xl border-4 border-white/40">
                              <span className="text-[10px] font-semibold text-gray-800">UP TO</span>
                              <span className="text-2xl md:text-3xl font-black text-gray-900">{slide.discount}</span>
                              <span className="text-[10px] font-semibold text-gray-800">OFF</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Carousel Indicators */}
                <div className="flex justify-center gap-1.5 pb-3">
                  {promoSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide
                        ? 'w-6 bg-white'
                        : 'w-1.5 bg-white/40'
                        }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Not Logged In - Marketing Hero */
        <>
          <section className="relative overflow-hidden min-h-[60vh] flex items-center justify-center text-center bg-gradient-to-br from-teal-600 to-teal-700">
            {/* Background Image with Softer Blur/Overlay */}
            <div className="absolute inset-0">
              <img
                src={currentTheme.heroImage}
                alt={`${selectedSalonType.charAt(0).toUpperCase() + selectedSalonType.slice(1)} Salon Interior`}
                className="w-full h-full object-cover blur-sm opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600/90 to-teal-700/90"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              {/* 1. Tagline */}
              <p className="text-white/80 font-medium text-sm md:text-base mb-4">
                Skip the Wait, Join the Queue
              </p>

              {/* 2. Main Headline */}
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6 tracking-tighter">
                AltQ – Unisex Salon Queue System
              </h1>

              {/* 3. CTA Button */}
              <div className="mb-4">
                <Link href="/auth">
                  <Button size="lg" className="bg-white hover:bg-gray-200 px-10 py-6 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 group text-teal-600">
                    Get Started Free
                    <Sparkles className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:rotate-12" />
                  </Button>
                </Link>
              </div>

              {/* 4. Social Proof */}
              <div className="flex items-center justify-center text-white/70 text-sm">
                <Users className="w-4 h-4 mr-2" />
                <span>Join 10,000+ happy customers</span>
              </div>
            </div>
          </section>

          {/* Search Bar Section - Moved from Hero */}
          <section className="py-8 px-4 -mt-12 relative z-20">
            <div className="max-w-lg mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search salons or services..."
                  className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-purple-400 bg-white rounded-2xl shadow-lg"
                  value={searchQuery}
                  onChange={(e) => {
                    // TC60: Limit input to 50 characters
                    const value = e.target.value;
                    if (value.length <= 50) {
                      setSearchQuery(value);
                    }
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={50}
                  data-testid="input-search"
                />
              </div>
            </div>
          </section>
        </>
      )}

      {/* Service Categories - What are you looking for today */}
      <section className="relative px-4 py-6 bg-gradient-to-b from-white via-gray-50/30 to-white overflow-hidden">
        {/* Subtle background effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 right-10 w-32 h-32 bg-cyan-100 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-teal-100 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What are you looking for today ?</h2>

          {/* Dynamic Service Categories Grid - Same as "What's on your mind" */}
          <div className="grid grid-cols-4 md:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {salonServiceCategories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => {
                  setSearchQuery(category.searchQuery);
                  // Scroll to All Salons section after a brief delay to allow state update
                  setTimeout(() => {
                    if (allSalonsRef.current) {
                      allSalonsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 border-2 border-cyan-100 bg-gradient-to-br from-cyan-50 to-white flex items-center justify-center">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-contain scale-110"
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 mt-2 text-center group-hover:text-cyan-600 transition-colors">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Salons / Favorites Section */}
      <section ref={trendingSalonsRef} className="py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {showFavoritesSection ? "Your Favorites" : "Trending Salons"}
              </h2>
              <p className="text-sm text-gray-500">
                {showFavoritesSection ? "Your saved salons" : "Best offers and deals"}
              </p>
            </div>
            {showFavoritesSection && favoriteSalons.length > 0 && (
              <Badge variant="secondary" className="bg-pink-100 text-pink-700 px-3 py-1">
                {favoriteSalons.length} {favoriteSalons.length === 1 ? 'Salon' : 'Salons'}
              </Badge>
            )}
          </div>

          {/* Container for horizontal scrolling */}
          <div className="overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            <div className="flex gap-5 min-w-max">
              {/* Display either Top Salons or Favorites */}
              {showFavoritesSection ? (
                favoriteSalons.length > 0 ? (
                  <>
                    {favoriteSalons.map((salon) => (
                      <div
                        key={salon.id}
                        className="min-w-[280px] max-w-[280px] flex-shrink-0"
                      >
                        <div className="relative rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100">
                          <div className="absolute top-3 right-3 z-10">
                            <div className="bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                              <Heart className="w-3 h-3 fill-current" />
                              Favorite
                            </div>
                          </div>
                          <SalonCard salon={salon} />
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full py-16 px-4">
                    <div className="relative">
                      <div className="w-28 h-28 bg-gradient-to-br from-pink-100 via-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6 shadow-xl animate-pulse">
                        <Heart className="w-14 h-14 text-pink-400" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-200 rounded-full opacity-60"></div>
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-pink-200 rounded-full opacity-60"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No favorites yet</h3>
                    <p className="text-gray-500 text-center max-w-md mb-6 leading-relaxed">
                      Start exploring salons and add your favorites by clicking the heart icon!
                    </p>
                    <Button
                      className="mt-2 text-white px-8 py-3 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={() => setShowFavoritesSection(false)}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Explore Salons
                    </Button>
                  </div>
                )
              ) : (
                topSalonsWithOffers.length > 0 ? (
                  <div className="flex gap-5">
                    {topSalonsWithOffers.map((salon) => (
                      <div
                        key={salon.id}
                        className="min-w-[280px] max-w-[280px] flex-shrink-0"
                      >
                        <div className="relative rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100">
                          {salon.offers && salon.offers.length > 0 && (
                            <div className="absolute top-3 left-3 z-10">
                              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xl flex items-center gap-1.5 border-2 border-white/30 backdrop-blur-sm">
                                <Gift className="w-4 h-4" />
                                {Math.max(...salon.offers.map(offer => Number(offer.discount) || 0))}% OFF
                              </div>
                            </div>
                          )}
                          <SalonCard salon={salon} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full py-16 px-4">
                    <div className="relative">
                      <div className="w-28 h-28 bg-gradient-to-br from-orange-100 via-amber-100 to-red-100 rounded-full flex items-center justify-center mb-6 shadow-xl animate-pulse">
                        <Gift className="w-14 h-14 text-orange-500" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-200 rounded-full opacity-60"></div>
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-orange-200 rounded-full opacity-60"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No offers right now</h3>
                    <p className="text-gray-500 text-center max-w-md leading-relaxed">
                      Check back soon for amazing deals and offers from our partner salons!
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Explore Section */}
      <section className="py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 font-bricolage mb-4">Explore</h2>
          <div className="flex gap-3 justify-center mb-6">
            <Button
              onClick={() => setExploreFilter('highly-rated')}
              className={`px-6 h-10 font-medium rounded-full shadow-md ${exploreFilter === 'highly-rated'
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white'
                : 'bg-white border-2 border-teal-300 text-teal-700 hover:bg-teal-50'
                }`}
            >
              <Star className="w-4 h-4 mr-2" />
              Highly Rated
            </Button>
            <Button
              onClick={() => {
                setExploreFilter('nearest');
                if (!userLocation) {
                  getUserLocation();
                }
              }}
              className={`px-6 h-10 font-medium rounded-full shadow-md ${exploreFilter === 'nearest'
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white'
                : 'bg-white border-2 border-teal-300 text-teal-700 hover:bg-teal-50'
                }`}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Nearest
            </Button>
          </div>

          {/* Explore Salons Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {exploreSalons.map((salon) => (
              <SalonCard
                key={salon.id}
                salon={salon}
              />
            ))}
          </div>
        </div>
      </section>



      {/* All Salons Section */}
      <section id="all-salons" ref={allSalonsRef} className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 font-bricolage mb-6">All Salons</h2>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSalons.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <MapPin className="text-gray-400 h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {searchQuery || location ? 'No salons found' : 'No salons available yet'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchQuery || location
                  ? 'Try adjusting your search criteria or check back later.'
                  : 'New salons are joining SmartQ every day. Check back soon or sign up as a salon owner!'}
              </p>
              {!searchQuery && !location && (
                <Link href="/auth">
                  <Button size="lg" className="font-semibold bg-blue-700">
                    Become a Salon Owner
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredSalons.map((salon) => (
                <AllSalonsCard key={salon.id} salon={salon} />
              ))}
            </div>
          )}
        </div>
      </section>





    </div>
  );
}