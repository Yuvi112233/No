import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { getErrorMessage } from "@/lib/errorMessages";

interface EmailInputProps {
  prefilledEmail?: string;
  onBack: () => void;
  onOTPSent: (email: string, userId: string) => void;
}

export default function EmailInput({
  prefilledEmail = '',
  onBack,
  onOTPSent
}: EmailInputProps) {
  const [email, setEmail] = useState(prefilledEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const saveRecentEmail = (email: string) => {
    const stored = localStorage.getItem('smartq_recent_emails');
    let emails: string[] = [];
    
    if (stored) {
      try {
        emails = JSON.parse(stored);
      } catch (e) {
        emails = [];
      }
    }

    // Add email to the beginning, remove duplicates, keep max 5
    emails = [email, ...emails.filter(e => e !== email)].slice(0, 5);
    localStorage.setItem('smartq_recent_emails', JSON.stringify(emails));
  };

  const handleContinue = async () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
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
      
      // Zomato-style: Send OTP to both new and existing users
      const response = await api.auth.sendEmailOTPLogin(email.trim().toLowerCase());

      // Store debug OTP if available
      if (response.debug?.otp) {
        localStorage.setItem('debug_email_otp', response.debug.otp);
      }

      // Save to recent emails
      saveRecentEmail(email.trim().toLowerCase());

      // Show appropriate message
      toast({
        title: response.isNewUser ? "Welcome!" : "Welcome back!",
        description: "Please check your email for the verification code",
      });

      // Move to OTP verification
      onOTPSent(email.trim().toLowerCase(), response.userId);

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
    if (e.key === 'Enter' && !isLoading) {
      handleContinue();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center px-4 py-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="ml-2 text-lg font-bold text-gray-900">Continue with Email</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <p className="text-sm text-gray-600 mb-4">Please enter your email</p>

        {/* Email Input */}
        <div className="relative mb-4">
          <input
            type="email"
            placeholder="abc@xyz.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            className="w-full h-12 px-4 text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white placeholder-gray-400 transition-all text-sm"
            autoComplete="email"
            autoFocus={!prefilledEmail}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={isLoading || !email.trim() || !isOnline}
          className="w-full h-12 text-white font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
        >
          {!isOnline ? (
            "📡 No Internet"
          ) : isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Sending...</span>
            </div>
          ) : (
            "Continue"
          )}
        </button>

        {/* Info Text */}
        <p className="mt-6 text-xs text-gray-500 text-center">
          We'll send you a verification code to confirm your email address
        </p>
      </div>
    </div>
  );
}
