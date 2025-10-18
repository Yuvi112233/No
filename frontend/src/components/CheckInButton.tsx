import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, CheckCircle, AlertCircle, Clock, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "../lib/queryClient";

interface CheckInButtonProps {
  queueId: string;
  salonLocation: {
    latitude: number;
    longitude: number;
  };
  onCheckInSuccess: () => void;
  onCheckInError: (error: string) => void;
}

type CheckInStatus = 'idle' | 'requesting_location' | 'verifying' | 'success' | 'pending' | 'error' | 'permission_denied';

interface CheckInResult {
  success: boolean;
  autoApproved: boolean;
  requiresConfirmation: boolean;
  distance?: number;
  message: string;
  newStatus: string;
}

export default function CheckInButton({
  queueId,
  salonLocation,
  onCheckInSuccess,
  onCheckInError,
}: CheckInButtonProps) {
  const [status, setStatus] = useState<CheckInStatus>('idle');
  const [distance, setDistance] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { toast } = useToast();

  // Calculate distance from user to salon
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Get user location and update distance
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const dist = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            salonLocation.latitude,
            salonLocation.longitude
          );
          setDistance(Math.round(dist));
        },
        () => {
          // Silently fail - distance is optional
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 60000,
        }
      );
    }
  }, [salonLocation]);

  const handleCheckIn = async () => {
    setStatus('requesting_location');
    setErrorMessage('');

    try {
      // Request location permission
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude, accuracy } = position.coords;

      // Calculate distance
      const dist = calculateDistance(
        latitude,
        longitude,
        salonLocation.latitude,
        salonLocation.longitude
      );
      setDistance(Math.round(dist));

      // Call check-in API
      setStatus('verifying');
      const response = await apiRequest('POST', `/api/queues/${queueId}/checkin`, {
        latitude,
        longitude,
        accuracy,
      });

      const result: CheckInResult = await response.json();

      if (result.success) {
        if (result.autoApproved) {
          setStatus('success');
          toast({
            title: "Check-in successful!",
            description: result.message,
          });
          setTimeout(() => {
            onCheckInSuccess();
          }, 2000);
        } else if (result.requiresConfirmation) {
          setStatus('pending');
          toast({
            title: "Verification pending",
            description: result.message,
            duration: 5000,
          });
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      let userMessage = 'Failed to check in. Please try again.';
      let newStatus: CheckInStatus = 'error';

      if (error.code === 1) {
        // Permission denied
        newStatus = 'permission_denied';
        userMessage = 'Location permission denied. Please enable location access in your browser settings.';
      } else if (error.code === 2) {
        // Position unavailable
        userMessage = 'Unable to get your location. Please check your device settings.';
      } else if (error.code === 3) {
        // Timeout
        userMessage = 'Location request timed out. Please try again.';
      } else if (error.message) {
        userMessage = error.message;
      }

      setStatus(newStatus);
      setErrorMessage(userMessage);
      onCheckInError(userMessage);

      toast({
        title: "Check-in failed",
        description: userMessage,
        variant: "destructive",
      });

      // Only auto-reset for non-permission errors
      if (newStatus !== 'permission_denied') {
        setTimeout(() => {
          setStatus('idle');
        }, 3000);
      }
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case 'requesting_location':
        return (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Getting location...
          </>
        );
      case 'verifying':
        return (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Verifying...
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-5 h-5 mr-2" />
            Checked In!
          </>
        );
      case 'pending':
        return (
          <>
            <Clock className="w-5 h-5 mr-2" />
            Awaiting Confirmation
          </>
        );
      case 'permission_denied':
        return (
          <>
            <Settings className="w-5 h-5 mr-2" />
            Retry Check-In
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="w-5 h-5 mr-2" />
            Try Again
          </>
        );
      default:
        return (
          <>
            <MapPin className="w-5 h-5 mr-2" />
            I've Arrived
          </>
        );
    }
  };

  const getButtonColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'pending':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'permission_denied':
        return 'bg-orange-600 hover:bg-orange-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700';
    }
  };

  return (
    <div className="space-y-3">
      {/* Distance indicator */}
      {distance !== null && status === 'idle' && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Distance to salon: <span className="font-semibold text-gray-900">{distance}m</span>
          </p>
        </div>
      )}

      {/* Check-in button */}
      <Button
        onClick={handleCheckIn}
        disabled={status !== 'idle' && status !== 'error' && status !== 'permission_denied'}
        className={`w-full h-12 text-base font-semibold text-white shadow-lg transition-all ${getButtonColor()}`}
      >
        {getButtonContent()}
      </Button>

      {/* Permission denied message with instructions */}
      {status === 'permission_denied' && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Settings className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-900 mb-2">
                Location Permission Required
              </p>
              <p className="text-xs text-orange-700 mb-3">
                To check in, you need to enable location access. Here's how:
              </p>
              <ol className="text-xs text-orange-700 space-y-2 list-decimal list-inside">
                <li>Click the lock icon (🔒) or info icon (ⓘ) in your browser's address bar</li>
                <li>Find "Location" in the permissions list</li>
                <li>Change it from "Block" to "Allow"</li>
                <li>Click the "Retry Check-In" button above</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {errorMessage && status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Pending message */}
      {status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-700">
            The salon will confirm your arrival shortly. Please wait or show this screen to staff.
          </p>
        </div>
      )}
    </div>
  );
}
