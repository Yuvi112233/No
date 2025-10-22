import { useState, useEffect, useRef } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errorMessages";

interface EmailOTPVerificationProps {
  email: string;
  userId: string;
  onVerificationSuccess: (user: any, token: string) => void;
  onBack: () => void;
}

export default function EmailOTPVerification({
  email,
  userId,
  onVerificationSuccess,
  onBack
}: EmailOTPVerificationProps) {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const { toast } = useToast();
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  useEffect(() => {
    if (otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, []);

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) return email;
    const visibleStart = localPart.slice(0, 2);
    const visibleEnd = localPart.slice(-1);
    const masked = '*'.repeat(Math.min(localPart.length - 3, 5));
    return `${visibleStart}${masked}${visibleEnd}@${domain}`;
  };

  const handleOTPChange = (value: string) => {
    setOtp(value);
    setError(null);

    if (value.length === 6) {
      handleVerifyOTP(value);
    }
  };

  const handleVerifyOTP = async (otpValue: string = otp) => {
    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit code");
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
      const response = await api.auth.verifyEmailOTP(userId, otpValue);

      localStorage.removeItem('debug_email_otp');

      toast({
        title: "Email Verified!",
        description: "Welcome to SmartQ!",
      });

      onVerificationSuccess(response.user, response.token);
    } catch (err: any) {
      setAttempts(prev => prev + 1);

      if (attempts >= 2) {
        setError("Too many failed attempts. Please request a new code.");
        setOtp("");
      } else {
        const errorInfo = getErrorMessage(err);
        const errorMessage = err.message?.includes('API Error')
          ? "Invalid code. Please try again."
          : errorInfo.message;
        setError(errorMessage);
        setOtp("");

        toast({
          title: errorInfo.title,
          description: errorMessage,
          variant: "destructive",
        });
      }

      setTimeout(() => {
        if (otpInputRef.current) {
          otpInputRef.current.focus();
        }
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setError(null);

    try {
      const { api } = await import("../lib/api");
      await api.auth.resendEmailOTP(userId);

      toast({
        title: "OTP Resent!",
        description: `New verification code sent to ${maskEmail(email)}`,
      });

      setResendCountdown(30);
      setCanResend(false);
      setAttempts(0);
      setOtp("");

      if (otpInputRef.current) {
        otpInputRef.current.focus();
      }
    } catch (err: any) {
      const errorInfo = getErrorMessage(err);
      toast({
        title: errorInfo.title,
        description: errorInfo.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/4.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative flex flex-col h-full">
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={onBack}
            className="text-white/80 hover:text-white p-2 rounded-full bg-white/10 backdrop-blur-sm transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-8">
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <img
              src="/loadlogo.png"
              alt="SmartQ Logo"
              className="h-24 w-auto drop-shadow-2xl"
            />
          </div>

          {/* OTP Card */}
          <div className="w-full max-w-sm bg-white/95 backdrop-blur-md rounded-2xl px-6 py-8 shadow-2xl border border-white/20">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-teal-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Email</h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-3">
                We've sent a 6-digit code to
              </p>
              <p className="text-gray-900 font-semibold">
                {maskEmail(email)}
              </p>
            </div>

            {/* OTP Input */}
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <InputOTP
                  ref={otpInputRef}
                  maxLength={6}
                  value={otp}
                  onChange={handleOTPChange}
                  disabled={isLoading}
                >
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="w-10 h-12 text-lg font-bold rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-0 bg-gray-50 text-gray-900" />
                    <InputOTPSlot index={1} className="w-10 h-12 text-lg font-bold rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-0 bg-gray-50 text-gray-900" />
                    <InputOTPSlot index={2} className="w-10 h-12 text-lg font-bold rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-0 bg-gray-50 text-gray-900" />
                    <InputOTPSlot index={3} className="w-10 h-12 text-lg font-bold rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-0 bg-gray-50 text-gray-900" />
                    <InputOTPSlot index={4} className="w-10 h-12 text-lg font-bold rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-0 bg-gray-50 text-gray-900" />
                    <InputOTPSlot index={5} className="w-10 h-12 text-lg font-bold rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-0 bg-gray-50 text-gray-900" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
                  <p className="text-xs text-red-600 text-center font-medium">
                    {error}
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center py-3">
                  <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-teal-600 font-medium text-sm">Verifying...</span>
                </div>
              )}
            </div>

            {/* Resend Section */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                Didn't receive code?{" "}
                {canResend ? (
                  <button
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-teal-600 hover:text-teal-700 transition-colors font-semibold"
                  >
                    Resend
                  </button>
                ) : (
                  <span className="text-gray-400">
                    Resend in {resendCountdown}s
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="text-center mt-6">
            <p className="text-white/60 text-xs">
              🔒 Your data is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
