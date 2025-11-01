import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Navigation, Sparkles } from "lucide-react";
import type { SalonWithDetails } from "../types";

// Simple cache for resolved addresses to avoid repeated API calls
const addressCache = new Map<string, string>();

interface SalonCardProps {
  salon: SalonWithDetails;
  showWaitTime?: boolean;
  showDistance?: boolean;
  distance?: number;
}

export default function SalonCard({ salon, showWaitTime = true, showDistance = false, distance }: SalonCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [resolvedAddress, setResolvedAddress] = useState<string>('');

  // Auto-rotate images every 5 seconds if salon has multiple photos
  useEffect(() => {
    if (!salon.photos || salon.photos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % salon.photos!.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [salon.photos]);

  const getCurrentImageUrl = () => {
    if (salon.photos && salon.photos.length > 0) {
      return salon.photos[currentImageIndex].url;
    }
    return "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200";
  };

  const hasMultipleImages = salon.photos && salon.photos.length > 1;

  // Reverse geocoding to get address from coordinates
  const fetchAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      // Using a free reverse geocoding service (Nominatim - OpenStreetMap)
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'SmartQ-Salon-App'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          // Extract a clean, short address
          const address = data.display_name;
          // Take first 2-3 parts of the address for brevity, remove country
          const addressParts = address.split(',').slice(0, 3).join(',').trim();

          // Cache the result
          const cacheKey = `${lat},${lng}`;
          addressCache.set(cacheKey, addressParts);

          setResolvedAddress(addressParts);
        } else {
          setResolvedAddress('Near coordinates provided');
        }
      } else {
        setResolvedAddress('Location available on map');
      }
    } catch (error) {
      setResolvedAddress('Location available on map');
    }
  };

  // Effect to fetch address when component mounts if we have coordinates but no address
  useEffect(() => {
    // Only fetch resolved address if we don't have manualLocation, fullAddress, or location
    if (salon.latitude && salon.longitude && !salon.manualLocation && !salon.fullAddress && !salon.location && !resolvedAddress) {
      const cacheKey = `${salon.latitude},${salon.longitude}`;

      // Check cache first
      if (addressCache.has(cacheKey)) {
        setResolvedAddress(addressCache.get(cacheKey)!);
      } else {
        fetchAddressFromCoordinates(salon.latitude, salon.longitude);
      }
    }
  }, [salon.latitude, salon.longitude, salon.manualLocation, salon.fullAddress, salon.location, resolvedAddress]);

  // Helper function to capitalize each word
  const capitalizeWords = (text: string) => {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getDisplayLocation = () => {
    // Priority order: manualLocation > fullAddress > location > resolvedAddress > coordinates-based fallback
    if (salon.manualLocation && salon.manualLocation.trim()) {
      return capitalizeWords(salon.manualLocation);
    }

    if (salon.fullAddress && salon.fullAddress.trim()) {
      return capitalizeWords(salon.fullAddress);
    }

    if (salon.location && salon.location.trim()) {
      return capitalizeWords(salon.location);
    }

    // Use resolved address from coordinates
    if (resolvedAddress) {
      return capitalizeWords(resolvedAddress);
    }

    // If we have coordinates but address is still loading
    if (salon.latitude && salon.longitude) {
      return 'Loading location...';
    }

    // Last resort fallback
    return 'Location details available';
  };

  const openInGoogleMaps = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (salon.latitude && salon.longitude) {
      // Use exact coordinates for precise location
      const url = `https://www.google.com/maps?q=${salon.latitude},${salon.longitude}`;
      window.open(url, '_blank');
    } else {
      // Fallback to address search
      const query = encodeURIComponent(salon.fullAddress || salon.location);
      const url = `https://www.google.com/maps/search/${query}`;
      window.open(url, '_blank');
    }
  };

  return (
    <Link href={`/salon/${salon.id}`}>
      <Card className="group overflow-hidden bg-white border-2 border-gray-100 hover:border-teal-300 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl h-full flex flex-col min-h-[380px]">
        <div className="relative overflow-hidden">
          {/* Image with gradient overlay */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={getCurrentImageUrl()}
              alt={salon.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Image counter dots */}
            {hasMultipleImages && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
                {salon.photos!.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${index === currentImageIndex
                      ? 'w-6 bg-white shadow-lg'
                      : 'w-1.5 bg-white/50'
                      }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Navigation button */}
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-3 right-3 h-9 w-9 p-0 bg-white hover:bg-teal-50 shadow-lg border-0 rounded-xl transition-all duration-200"
            onClick={openInGoogleMaps}
            title="Open in Google Maps"
          >
            <Navigation className="h-4 w-4 text-teal-600" />
          </Button>

          {/* Offers badge */}
          {salon.offers && salon.offers.length > 0 && (
            <div className="absolute top-3 left-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-xl blur opacity-40"></div>
                <Badge className="relative bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-3 py-1.5 text-sm font-bold shadow-lg border-0 rounded-xl">
                  <Sparkles className="w-4 h-4 inline mr-1.5" />
                  {Math.max(...salon.offers.map(offer => offer.discount))}% OFF
                </Badge>
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="space-y-3 flex-1 flex flex-col">
            {/* Title and Rating */}
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-bold text-lg text-gray-900 leading-tight flex-1 line-clamp-1 min-h-[28px]">
                {salon.name}
              </h3>
              <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border-2 border-amber-200 shadow-sm flex-shrink-0">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-bold text-gray-900">{salon.rating}</span>
                <span className="text-xs text-gray-500">
                  ({salon.reviewCount ?? salon.reviews?.length ?? 0})
                </span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2 flex-1">
              <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <span className={`text-sm text-gray-600 leading-5 line-clamp-2 min-h-[40px] ${getDisplayLocation() === 'Loading location...'
                ? 'text-gray-400 animate-pulse'
                : ''
                }`}>
                {getDisplayLocation()}
              </span>
            </div>

            {/* Bottom info bar */}
            <div className="flex items-center justify-between pt-3 border-t-2 border-gray-100 mt-auto">
              {showDistance && distance !== undefined && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-blue-700">{distance.toFixed(1)} km</span>
                </div>
              )}

              {showWaitTime && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 ${(salon.queueCount || 0) > 0
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200'
                  }`}>
                  <div className="relative">
                    <Clock className={`w-4 h-4 ${(salon.queueCount || 0) > 0 ? 'text-amber-600' : 'text-teal-600'}`} />
                    {(salon.queueCount || 0) > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center ring-2 ring-white">
                        <span className="text-[8px] font-bold text-white leading-none">
                          {salon.queueCount > 9 ? '9+' : salon.queueCount}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className={`text-sm font-bold ${(salon.queueCount || 0) > 0 ? 'text-amber-700' : 'text-teal-700'}`}>
                    {(salon.queueCount || 0) > 0 ? `${salon.queueCount} in queue` : 'Available now'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}