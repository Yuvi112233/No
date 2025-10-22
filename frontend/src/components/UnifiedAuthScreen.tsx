import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import { getErrorMessage } from "@/lib/errorMessages";

interface UnifiedAuthScreenProps {
  onPhoneOTPSent: (phoneNumber: string) => void;
  onEmailSelected: (email: string) => void;
  onGoogleSuccess: (credential: string) => void;
  onSwitchToAdmin?: () => void;
}

export default function UnifiedAuthScreen({
  onPhoneOTPSent,
  onEmailSelected,
  onGoogleSuccess,
  onSwitchToAdmin
}: UnifiedAuthScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [recentEmails, setRecentEmails] = useState<string[]>([]);
  const { toast } = useToast();

  const countryCode = "+91";

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back online! 🎉",
        description: "Your connection has been restored.",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline 📡",
        description: "Please check your internet connection.",
        variant: "destructive",
        duration: Infinity,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Load recent emails from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('smartq_recent_emails');
    if (stored) {
      try {
        setRecentEmails(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent emails:', e);
      }
    }
  }, []);

  const handleGoogleAuth = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      toast({
        title: "Error",
        description: "Failed to get Google credentials",
        variant: "destructive",
      });
      return;
    }

    if (!navigator.onLine) {
      const errorInfo = getErrorMessage({ message: 'NO_INTERNET' });
      toast({
        title: errorInfo.title,
        description: errorInfo.message,
        variant: "destructive",
      });
      return;
    }

    setError(null);

    try {
      const { api } = await import("../lib/api");
      const response = await api.auth.googleAuth(credentialResponse.credential, 'customer');

      localStorage.setItem('smartq_token', response.token);
      localStorage.setItem('smartq_user', JSON.stringify(response.user));

      toast({
        title: response.isNewUser ? "Welcome!" : "Welcome back!",
        description: response.isNewUser
          ? "Your account has been created successfully"
          : "You've been logged in successfully",
      });

      window.location.reload();
    } catch (err: any) {
      const errorInfo = getErrorMessage(err);
      setError(errorInfo.message);
      toast({
        title: errorInfo.title,
        description: errorInfo.message,
        variant: "destructive",
      });
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in failed. Please try again.");
    toast({
      title: "Error",
      description: "Failed to sign in with Google",
      variant: "destructive",
    });
  };

  const formatPhoneNumber = (value: string) => {
    let digits = value.replace(/\D/g, '');
    digits = digits.replace(/^0+/, '');
    digits = digits.slice(0, 10);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
  };

  const validatePhoneNumber = (phone: string) => {
    const digits = phone.replace(/\D/g, '').replace(/^0+/, '');
    return digits.length === 10 && /^[6-9]/.test(digits);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    setError(null);
  };

  const handleSendOTP = async () => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const fullPhoneNumber = `${countryCode}${cleanPhone}`;

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    if (!navigator.onLine) {
      const errorInfo = getErrorMessage({ message: 'NO_INTERNET' });
      setError(errorInfo.message);
      toast({
        title: errorInfo.title,
        description: errorInfo.message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { api } = await import("../lib/api");
      const response = await api.auth.sendOTP(fullPhoneNumber);

      if (response.debug?.otp) {
        localStorage.setItem("debug_otp", response.debug.otp);
        toast({
          title: "OTP Sent!",
          description: `Your verification code is: ${response.debug.otp}`,
          duration: 10000,
        });
      } else {
        localStorage.removeItem("debug_otp");
        toast({
          title: "OTP Sent!",
          description: `Verification code sent to ${fullPhoneNumber}`,
        });
      }

      onPhoneOTPSent(fullPhoneNumber);
    } catch (err: any) {
      const errorInfo = getErrorMessage(err);
      setError(errorInfo.message);
      toast({
        title: errorInfo.title,
        description: errorInfo.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && phoneNumber.trim()) {
      handleSendOTP();
    }
  };

  const handleEmailIconClick = () => {
    setShowEmailModal(true);
  };

  const handleEmailSelect = (email: string) => {
    setShowEmailModal(false);
    onEmailSelected(email);
  };

  const handleNoneOfAbove = () => {
    setShowEmailModal(false);
    onEmailSelected(''); // Empty string means new email
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/4.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative min-h-full flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-4 sm:py-6">
          {/* Logo & Hero Text */}
          <div className="text-center mb-4 sm:mb-6">
            <img
              src="/loadlogo.png"
              alt="AltQ Logo"
              className="w-36 sm:w-60 md:w-64 lg:w-72 object-contain drop-shadow-2xl mx-auto mb-3"
            />



            <h1 className="text-3xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 leading-tight">
              India's Leading Salon<br />Booking Platform
            </h1>
            <p className="text-white/80 text-base sm:text-base font-medium">
              Log in or sign up
            </p>
          </div>

          {/* Auth Card */}
          <div className="w-full max-w-sm bg-white/95 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-6 sm:py-8 shadow-2xl border border-white/20">
            {/* Phone Input */}
            <div className="space-y-3 sm:space-y-4">
              <div className="relative">
                <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div className="flex">
                  <div className="w-14 sm:w-16 h-10 sm:h-11 pl-9 sm:pl-11 pr-1 sm:pr-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-l-xl flex items-center justify-center font-semibold text-xs sm:text-sm shrink-0">
                    +91
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter Phone Number"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    onKeyDown={handleKeyDown}
                    className="flex-1 min-w-0 h-10 sm:h-11 px-2.5 sm:px-3.5 text-gray-900 bg-gray-50 border border-l-0 border-gray-300 rounded-r-xl focus:outline-none focus:border-teal-500 focus:bg-white placeholder-gray-400 transition-all text-sm"
                    maxLength={11}
                    autoComplete="tel"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-2 sm:p-2.5">
                  <p className="text-xs text-red-600 break-words">{error}</p>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={handleSendOTP}
                disabled={isLoading || !phoneNumber.trim() || !isOnline}
                className="w-full h-10 sm:h-11 text-white font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
              >
                {!isOnline ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs sm:text-sm">📡 No Internet</span>
                  </div>
                ) : isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-xs sm:text-sm">Sending OTP...</span>
                  </div>
                ) : (
                  "Continue"
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Social Login Icons */}
              <div className="flex items-center justify-center gap-4">
                {/* Google Login */}
                <div className="hidden">
                  <GoogleLogin
                    onSuccess={handleGoogleAuth}
                    onError={handleGoogleError}
                    useOneTap={false}
                  />
                </div>

                {/* Google Icon Button */}
                <button
                  onClick={() => {
                    const googleButton = document.querySelector('[aria-labelledby="button-label"]') as HTMLElement;
                    if (googleButton) googleButton.click();
                  }}
                  className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 hover:border-teal-500 flex items-center justify-center transition-all shadow-sm hover:shadow-md"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </button>

                {/* Email Icon Button */}
                <button
                  onClick={handleEmailIconClick}
                  className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 hover:border-teal-500 flex items-center justify-center transition-all shadow-sm hover:shadow-md"
                >
                  <Mail className="w-6 h-6 text-teal-600" />
                </button>
              </div>
            </div>

            {/* Admin Login - Inside the card at bottom */}
            {onSwitchToAdmin && (
              <div className="text-center mt-4 pt-4 border-t border-gray-200">
                <p className="text-gray-500 text-xs">
                  Salon Owner?{" "}
                  <button
                    className="text-teal-600 font-semibold hover:text-teal-700 transition-colors"
                    onClick={onSwitchToAdmin}
                  >
                    Admin Login
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Selection Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowEmailModal(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[70vh] overflow-hidden animate-slide-up">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Continue with</h3>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {recentEmails.map((email, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmailSelect(email)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{email}</p>
                    </div>
                  </button>
                ))}

                <button
                  onClick={handleNoneOfAbove}
                  className="w-full p-3 text-left text-sm font-semibold text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
                >
                  NONE OF THE ABOVE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
