import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import { CartProvider } from "./context/CartContext";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Layout from "./components/Layout";
import Home from "./pages/Home";
import NewAuthPage from "./pages/NewAuthPage";
import SalonProfile from "./pages/SalonProfile";
import QueueSummary from "./pages/QueueSummary";
import Queue from "./pages/Queue";
import Dashboard from "./pages/Dashboard";
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import HelpCenter from "./pages/HelpCenter";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import PlatformAdmin from "./pages/PlatformAdmin";
import AdminLogin from "./pages/AdminLogin";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "@/pages/not-found";
import SkeletonLoadingScreen from "./components/SkeletonLoadingScreen";
import IntroScreen from "./components/IntroScreen";
import PhoneAuthFlow from "./components/PhoneAuthFlow";
import CategorySelection from "./components/CategorySelection";
import { UserCategory, getUserCategory, setUserCategory, clearUserCategory } from "./utils/categoryUtils";
import { usePWA } from "./hooks/usePWA";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={NewAuthPage} />
      <Route path="/salon/:id" component={SalonProfile} />
      <Route path="/queue-summary" component={QueueSummary} />
      <Route path="/queue" component={Queue} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/contact" component={ContactUs} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/help" component={HelpCenter} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/platform-admin" component={PlatformAdmin} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [currentPhase, setCurrentPhase] = useState<'auth' | 'intro' | 'phone-auth' | 'skeleton' | 'category' | 'app'>('auth');
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(null);
  const [, setLocation] = useLocation();
  const [location] = useLocation();

  // Initialize PWA features
  usePWA(authenticatedUser?.id);

  // Check if current path is an admin route or public route that should bypass phase system
  const isAdminRoute = location.startsWith('/admin') || location.startsWith('/platform-admin') || location.startsWith('/reset-password');

  // Check for existing authentication on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('smartq_token');
    const storedUser = localStorage.getItem('smartq_user');
    const storedCategory = getUserCategory();
    const currentPath = window.location.pathname;

    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthenticatedUser(user);

        // If user is admin (salon_owner), skip category selection
        if (user.role === 'salon_owner') {
          setCurrentPhase('app');
        } else if (storedCategory) {
          // Regular user with category already selected
          setCurrentPhase('app');
        } else {
          // Regular user without category - show category selection
          setCurrentPhase('category');
        }
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('smartq_token');
        localStorage.removeItem('smartq_user');
        clearUserCategory();
        // Stay in auth phase if stored data is invalid
      }
    }
  }, []);

  const handleAuthComplete = (user?: any) => {
    setAuthenticatedUser(user);
    // If user is an admin (salon_owner), skip intro and go directly to app
    if (user && user.role === 'salon_owner') {
      setCurrentPhase('skeleton');
    } else {
      setCurrentPhase('intro');
    }
  };

  const handleIntroComplete = () => {
    setCurrentPhase('skeleton');
  };

  const handleSkeletonComplete = () => {
    // Check if user needs category selection
    if (authenticatedUser && authenticatedUser.role !== 'salon_owner') {
      const storedCategory = getUserCategory();
      if (!storedCategory) {
        setCurrentPhase('category');
        return;
      }
    }

    setCurrentPhase('app');
  };

  const handleCategorySelect = (category: UserCategory) => {
    setUserCategory(category);
    setCurrentPhase('app');
  };

  // Navigate to appropriate page when entering app phase (only if needed)
  useEffect(() => {
    if (currentPhase === 'app' && authenticatedUser) {
      // Get current path
      const currentPath = window.location.pathname;

      // Check if user just logged in (coming from auth page)
      const isOnAuthPage = currentPath === '/auth';
      const isOnRoot = currentPath === '/' || currentPath === '';

      // Always redirect if on auth page or root
      if (isOnAuthPage || isOnRoot) {
        if (authenticatedUser.role === 'salon_owner') {
          setLocation('/dashboard');
        } else {
          setLocation('/');
        }
      }
    }
  }, [currentPhase, authenticatedUser, setLocation]);

  const handleSignIn = () => {
    setCurrentPhase('phone-auth');
  };

  const handlePhoneAuthComplete = (user?: any) => {
    setAuthenticatedUser(user);
    // All phone auth goes to skeleton loading (admins will be routed by the auth context)
    setCurrentPhase('skeleton');
  };

  // If accessing admin routes, bypass phase system and show admin pages directly
  if (isAdminRoute) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <WebSocketProvider>
                <CartProvider>
                  <Router />
                </CartProvider>
              </WebSocketProvider>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </GoogleOAuthProvider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {currentPhase === 'auth' ? (
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <WebSocketProvider>
                <CartProvider>
                  <NewAuthPage onComplete={handleAuthComplete} />
                </CartProvider>
              </WebSocketProvider>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      ) : currentPhase === 'intro' ? (
        <IntroScreen onNext={handleIntroComplete} onSignIn={handleSignIn} />
      ) : currentPhase === 'phone-auth' ? (
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <WebSocketProvider>
                <CartProvider>
                  <PhoneAuthFlow onComplete={handlePhoneAuthComplete} />
                </CartProvider>
              </WebSocketProvider>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      ) : currentPhase === 'skeleton' ? (
        <SkeletonLoadingScreen onComplete={handleSkeletonComplete} />
      ) : currentPhase === 'category' ? (
        <CategorySelection onCategorySelect={handleCategorySelect} />
      ) : (
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <WebSocketProvider>
                <CartProvider>
                  <Layout>
                    <Toaster />
                    <Router />
                  </Layout>
                </CartProvider>
              </WebSocketProvider>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      )}
    </GoogleOAuthProvider>
  );
}

export default App;