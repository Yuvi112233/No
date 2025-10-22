import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";
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
      title: "Look more stylish and earn more discount",
      subtitle: "Premium salon services at unbeatable prices",
      discount: "50%",
      buttonText: "Get Offer Now !",
      image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
      gradient: "from-black/60 to-transparent"
    },
    {
      id: 2,
      title: "Transform your look with expert stylists",
      subtitle: "Book now and save big on premium services",
      discount: "30%",
      buttonText: "Book Now !",
      image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
      gradient: "from-purple-900/60 to-transparent"
    },
    {
      id: 3,
      title: "Weekend special offers",
      subtitle: "Relax and rejuvenate with our spa treatments",
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

  const filteredSalons = salons.filter(salon => {
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
          image: "/haircut.png",
          searchQuery: "haircut"
        },
        {
          id: 2,
          name: "Beard Trim",
          image: "/beard-trimming.png",
          searchQuery: "beard"
        },
        {
          id: 3,
          name: "Shave",
          image: "/shave.png",
          searchQuery: "shave"
        },
        {
          id: 4,
          name: "Hair Styling",
          image: "/hairstyling.png",
          searchQuery: "styling"
        },
        {
          id: 5,
          name: "Massage",
          image: "/body-massage.png",
          searchQuery: "massage"
        },
        {
          id: 6,
          name: "Facial",
          image: "/facial-massage.png",
          searchQuery: "facial"
        },
        {
          id: 7,
          name: "Hair Color",
          image: "/hair-color.png",
          searchQuery: "hair color"
        },
        {
          id: 8,
          name: "Manicure",
          image: "/manicure.png",
          searchQuery: "manicure"
        }
      ],
      women: [
        {
          id: 1,
          name: "Haircut",
          image: "/haircut.png",
          searchQuery: "haircut"
        },
        {
          id: 2,
          name: "Hair Color",
          image: "/hair-color.png",
          searchQuery: "hair color"
        },
        {
          id: 3,
          name: "Facial",
          image: "/facial-massage.png",
          searchQuery: "facial"
        },
        {
          id: 4,
          name: "Manicure",
          image: "/manicure.png",
          searchQuery: "manicure"
        },
        {
          id: 5,
          name: "Pedicure",
          image: "/pedicure.png",
          searchQuery: "pedicure"
        },
        {
          id: 6,
          name: "Makeup",
          image: "/makeup.png",
          searchQuery: "makeup"
        },
        {
          id: 7,
          name: "Eyebrow",
          image: "/eyebrow.png",
          searchQuery: "eyebrow"
        },
        {
          id: 8,
          name: "Massage",
          image: "/body-massage.png",
          searchQuery: "massage"
        }
      ],
      unisex: [
        {
          id: 1,
          name: "Haircut",
          image: "/haircut.png",
          searchQuery: "haircut"
        },
        {
          id: 2,
          name: "Hair Color",
          image: "/hair-color.png",
          searchQuery: "hair color"
        },
        {
          id: 3,
          name: "Facial",
          image: "/facial-massage.png",
          searchQuery: "facial"
        },
        {
          id: 4,
          name: "Massage",
          image: "/body-massage.png",
          searchQuery: "massage"
        },
        {
          id: 5,
          name: "Hair Styling",
          image: "/hairstyling.png",
          searchQuery: "styling"
        },
        {
          id: 6,
          name: "Manicure",
          image: "/manicure.png",
          searchQuery: "manicure"
        },
        {
          id: 7,
          name: "Pedicure",
          image: "/pedicure.png",
          searchQuery: "pedicure"
        },
        {
          id: 8,
          name: "Beard Trim",
          image: "/beard-trimming.png",
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
        /* Logged In User - Seamless Header with Background Image */
        <section className="relative overflow-hidden">
          {/* Background Image Layer - Covers header and carousel area */}
          <div className="absolute inset-0 h-[420px] md:h-[480px]">
            <img
              src="/4.png"
              alt="Salon Background"
              className="w-full h-full object-cover"
            />

          </div>

          {/* Content Layer */}
          <div className="relative z-10 px-4 pt-6 pb-5">
            <div className="max-w-7xl mx-auto">
              {/* Header with Greeting - Enhanced */}
              <div className="flex items-center justify-between mb-8">
                {/* Left: Greeting with gradient text */}
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-lg md:text-xl font-bricolage tracking-wide drop-shadow-lg">
                      Hello, {user.name?.split(' ')[0] || 'User'}!
                    </p>
                    <span className="text-2xl animate-wave inline-block">👋</span>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-yellow-200 via-yellow-100 to-white bg-clip-text text-transparent font-bricolage drop-shadow-2xl">
                    Discover Your Perfect Salon
                  </h1>
                  <p className="text-white/80 text-sm md:text-base font-light">
                    Book appointments instantly, skip the wait ✨
                  </p>
                </div>

                {/* Right: Animation - Peeking from edge */}
                <div className="absolute -right-6 top-2 w-24 h-24 md:w-28 md:h-28 pointer-events-none animate-float">
                  <DotLottieReact
                    src="https://lottie.host/dfb2ab5d-ecdc-4aa4-ab64-181def37bd11/DWB1LXlcDu.lottie"
                    loop
                    autoplay
                  />
                </div>
              </div>

              {/* Search Bar - Enhanced with glow effect */}
              <div className="mb-6">
                <div className="relative w-full max-w-md flex gap-3 group">
                  {/* Glow effect on focus */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-teal-500 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-30 transition-opacity duration-300"></div>

                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Search salons or services..."
                      className="pl-12 pr-4 py-3.5 text-sm border-2 border-white/30 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:border-white/50 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 w-full placeholder:text-gray-400"
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
                    />
                  </div>

                  <Button
                    onClick={handleSearch}
                    className="relative bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3.5 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex-shrink-0 group"
                  >
                    <Search className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  </Button>
                </div>
              </div>

              {/* Promotional Banner - Enhanced with modern design */}
              <div className="relative rounded-3xl overflow-hidden h-48 md:h-64 shadow-2xl group">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-600/95 via-teal-500/95 to-teal-700/95 animate-gradient-shift"></div>

                {/* Decorative elements */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-yellow-300 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>

                {/* Geometric pattern overlay */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                  }}></div>
                </div>

                {/* Content with smooth text transitions */}
                <div className="relative h-full flex items-center px-6 md:px-10">
                  {promoSlides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 flex items-center px-6 md:px-10 transition-all duration-700 ${index === currentSlide
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-0 -translate-x-8 pointer-events-none'
                        }`}
                    >
                      <div className="flex-1 pr-24 md:pr-32">
                        <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-semibold mb-3 border border-white/30">
                          🎉 Limited Time Offer
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black text-white mb-2 leading-tight drop-shadow-lg">
                          {slide.title}
                        </h2>
                        <p className="text-sm md:text-base text-white/95 mb-4 font-medium drop-shadow">
                          {slide.subtitle}
                        </p>
                        <Button className="bg-white hover:bg-white/90 text-teal-600 font-bold px-6 py-2.5 rounded-full text-sm md:text-base shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5">
                          {slide.buttonText}
                          <span className="ml-2">→</span>
                        </Button>
                      </div>

                      {/* Enhanced Discount Badge with animation */}
                      <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2">
                        <div className="relative">
                          {/* Glow effect */}
                          <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse"></div>

                          {/* Badge */}
                          <div className="relative bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 rounded-full w-20 h-20 md:w-28 md:h-28 flex flex-col items-center justify-center shadow-2xl border-4 border-white/50 transform group-hover:rotate-12 transition-transform duration-500">
                            <p className="text-[10px] md:text-xs text-yellow-900 font-bold uppercase tracking-wide">Up to</p>
                            <p className="text-2xl md:text-4xl font-black text-yellow-900 leading-none">{slide.discount}</p>
                            <p className="text-[10px] md:text-xs text-yellow-900 font-bold uppercase">OFF</p>
                          </div>

                          {/* Sparkle effect */}
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>
                        </div>
                      </div>
                    </div>
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
      <section className="px-4 py-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What are you looking for today ?</h2>

          {/* Dynamic Service Categories Grid - Same as "What's on your mind" */}
          <div className="grid grid-cols-4 md:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {salonServiceCategories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => setSearchQuery(category.searchQuery)}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 border-2 border-cyan-100 bg-white flex items-center justify-center p-2">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-contain"
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
      <section className="py-8 bg-gradient-to-b from-gray-50 to-white">
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