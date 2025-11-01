import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AuthLoadingScreen from "./AuthLoadingScreen";
import AuthFlow from "./AuthFlow";
import MinimalUserDashboard from "./MinimalUserDashboard";
import AdminLoginFlow from "./AdminLoginFlow";
import BookingDetailsModal from "./BookingDetailsModal";
import { Toaster } from "@/components/ui/toaster";

type AuthStep = 
  | 'loading'
  | 'auth-input'
  | 'dashboard'
  | 'admin-login';

interface AuthRouterProps {
  defaultFlow?: 'customer' | 'admin';
}

export default function AuthRouter({ defaultFlow = 'customer' }: AuthRouterProps) {
  const [currentStep, setCurrentStep] = useState<AuthStep>('loading');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSalonId, setSelectedSalonId] = useState<string>('');
  
  const { 
    user, 
    login, 
    authFlow, 
    setAuthFlow, 
    needsProfileCompletion,
    updateUser 
  } = useAuth();

  // Initialize auth flow
  useEffect(() => {
    if (user) {
      // User is already authenticated, redirect to appropriate page
      if (user.role === 'salon_owner') {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/';
      }
      return;
    } else {
      // Set initial auth flow
      setAuthFlow(defaultFlow);
      // Start with loading screen, then move to appropriate flow
      const timer = setTimeout(() => {
        if (authFlow === 'admin') {
          setCurrentStep('admin-login');
        } else {
          setCurrentStep('auth-input');
        }
      }, 100); // Small delay to show loading
      
      return () => clearTimeout(timer);
    }
  }, [user, defaultFlow, authFlow, setAuthFlow]);

  const handleLoadingComplete = () => {
    if (authFlow === 'admin') {
      setCurrentStep('admin-login');
    } else {
      setCurrentStep('auth-input');
    }
  };

  const handleAdminAuthSuccess = (userData: any, token: string) => {
    login(userData, token);
    // Redirect to admin dashboard (existing dashboard page)
    window.location.href = '/dashboard';
  };

  const handleSwitchToCustomer = () => {
    setAuthFlow('customer');
    setCurrentStep('auth-input');
  };

  const handleBookSalon = (salonId: string) => {
    setSelectedSalonId(salonId);
    
    // Check if user needs profile completion
    if (needsProfileCompletion()) {
      setShowBookingModal(true);
    } else {
      // User has complete profile, proceed with booking
      // TODO: Navigate to booking flow
    }
  };

  const handleProfileCompletion = async (details: { name: string; email?: string }) => {
    try {
      // TODO: Call API to update user profile
      const updatedUser = {
        ...user!,
        name: details.name,
        email: details.email || user!.email,
      };
      
      updateUser(updatedUser);
      setShowBookingModal(false);
      
      // Now proceed with booking
      // TODO: Navigate to booking flow
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleOpenProfile = () => {
    // TODO: Navigate to profile page or show profile modal
  };

  // Render current step
  return (
    <>
      <Toaster />
      {(() => {
        switch (currentStep) {
          case 'loading':
            return <AuthLoadingScreen onComplete={handleLoadingComplete} />;
          
          case 'auth-input':
            return <AuthFlow />;
          
          case 'dashboard':
            if (!user) {
              // Fallback if user is null
              setCurrentStep('loading');
              return <AuthLoadingScreen onComplete={handleLoadingComplete} />;
            }
            
            return (
              <>
                <MinimalUserDashboard
                  user={user}
                  onBookSalon={handleBookSalon}
                  onOpenProfile={handleOpenProfile}
                />
                
                {/* Booking Details Modal */}
                <BookingDetailsModal
                  isOpen={showBookingModal}
                  onComplete={handleProfileCompletion}
                  onCancel={() => setShowBookingModal(false)}
                  salonName="Selected Salon" // TODO: Get actual salon name
                />
              </>
            );
          
          case 'admin-login':
            return (
              <AdminLoginFlow
                onAuthSuccess={handleAdminAuthSuccess}
                onSwitchToCustomer={handleSwitchToCustomer}
              />
            );
          
          default:
            return <AuthLoadingScreen onComplete={handleLoadingComplete} />;
        }
      })()}
    </>
  );
}