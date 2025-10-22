import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Mail, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

// Schema for users without email authentication
const fullProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name is too long"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  phone: z.string().min(10, "Phone number must be 10 digits").max(10, "Phone number must be 10 digits"),
});

// Schema for email-authenticated users (no email field needed)
const phoneOnlySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name is too long"),
  email: z.string().optional(),
  phone: z.string().min(10, "Phone number must be 10 digits").max(10, "Phone number must be 10 digits"),
});

type ProfileCompletionForm = z.infer<typeof fullProfileSchema>;

interface BookingDetailsModalProps {
  isOpen: boolean;
  onComplete: (details: { name: string; email?: string }) => void;
  onCancel: () => void;
  salonName?: string;
}

export default function BookingDetailsModal({
  isOpen,
  onComplete,
  onCancel,
  salonName = "the salon"
}: BookingDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'phone-verify'>('details');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [debugOTP, setDebugOTP] = useState<string>('');
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if user is already authenticated with email
  const isEmailAuthenticated = !!user?.email;

  const form = useForm<ProfileCompletionForm>({
    resolver: zodResolver(isEmailAuthenticated ? phoneOnlySchema : fullProfileSchema),
    defaultValues: {
      name: "",
      email: user?.email || "",
      phone: "",
    },
    mode: "onChange",
  });

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (data: ProfileCompletionForm) => {
    setIsLoading(true);

    try {
      const { api } = await import("../lib/api");

      // Update profile with name (and email if not authenticated)
      if (!isEmailAuthenticated) {
        await api.auth.completeProfile(data.name, data.email);
      } else {
        // For email-authenticated users, just update the name
        await api.auth.completeProfile(data.name, user?.email || "");
      }

      // Format phone number with country code
      const fullPhoneNumber = `+91${data.phone}`;
      setPhoneNumber(fullPhoneNumber);

      // Send phone OTP
      const response = await api.auth.sendOTP(fullPhoneNumber);

      // Store debug OTP for testing
      if (response.debug?.otp) {
        setDebugOTP(response.debug.otp);
        toast({
          title: "OTP Sent!",
          description: `Your verification code is: ${response.debug.otp}`,
          duration: 10000,
        });
      } else {
        toast({
          title: "Verification Code Sent",
          description: "Please check your phone for the verification code.",
        });
      }

      // Move to phone verification step
      setStep('phone-verify');
      setCountdown(30); // 30 seconds countdown
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { api } = await import("../lib/api");

      // Verify the phone OTP
      await api.auth.verifyOTP(phoneNumber, otp);

      // Update phone number in profile
      await api.auth.updatePhone(phoneNumber);

      toast({
        title: "Phone Verified!",
        description: "Your phone number has been successfully verified.",
      });

      const formData = form.getValues();
      onComplete({
        name: formData.name,
        email: formData.email,
      });
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setIsLoading(true);

    try {
      const { api } = await import("../lib/api");
      const response = await api.auth.sendOTP(phoneNumber);

      // Store debug OTP for testing
      if (response.debug?.otp) {
        setDebugOTP(response.debug.otp);
        toast({
          title: "OTP Resent!",
          description: `Your verification code is: ${response.debug.otp}`,
          duration: 10000,
        });
      } else {
        toast({
          title: "Code Resent",
          description: "A new verification code has been sent to your phone.",
        });
      }

      setCountdown(30);
      setOtp('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('details');
    setOtp('');
    setDebugOTP('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="!max-w-[calc(100vw-2rem)] sm:!max-w-md !w-[calc(100vw-2rem)] sm:!w-full rounded-3xl border-0 shadow-2xl p-4 sm:p-6">
        <DialogHeader className="text-center pb-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 p-2">
            <img
              src="/loadlogo.png"
              alt="AltQ Logo"
              className="w-full h-full object-contain filter brightness-0 invert"
            />
          </div>
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 px-2">
            {step === 'details' ? 'Complete Your Booking' : 'Verify Your Phone'}
          </DialogTitle>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-2 px-2">
            {step === 'details'
              ? isEmailAuthenticated
                ? `Just one more step! Verify your phone number to complete booking at ${salonName}`
                : `We need a few details to confirm your booking at ${salonName}`
              : `Enter the 6-digit code sent to ${phoneNumber}`
            }
          </p>
        </DialogHeader>

        {step === 'details' ? (
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
            {/* Name Input */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5 sm:gap-2">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Full Name <span className="text-red-500">*</span></span>
              </label>
              <Input
                placeholder="Enter your full name"
                className="h-10 sm:h-11 text-sm rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-0 bg-gray-50/50 transition-all duration-300 w-full"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Email Input - Only show if NOT email authenticated */}
            {!isEmailAuthenticated && (
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5 sm:gap-2">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>Email Address <span className="text-red-500">*</span></span>
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="h-10 sm:h-11 text-sm rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-0 bg-gray-50/50 transition-all duration-300 w-full"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  We'll send a verification code to this email
                </p>
              </div>
            )}

            {/* Phone Input */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5 sm:gap-2">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Phone Number <span className="text-red-500">*</span></span>
              </label>
              <div className="flex gap-2">
                <div className="w-16 h-10 sm:h-11 bg-gray-100 border-2 border-gray-200 rounded-xl flex items-center justify-center text-sm font-semibold text-gray-700">
                  +91
                </div>
                <Input
                  type="tel"
                  placeholder="10-digit phone number"
                  maxLength={10}
                  className="flex-1 h-10 sm:h-11 text-sm rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-0 bg-gray-50/50 transition-all duration-300"
                  {...form.register("phone")}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    form.setValue('phone', value);
                  }}
                />
              </div>
              {form.formState.errors.phone && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.phone.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                We'll send a verification code to this number
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-2.5 sm:p-3">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 p-1">
                  <ShieldCheck className="w-full h-full text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-teal-900 text-xs mb-0.5">
                    {isEmailAuthenticated ? 'Phone Verification Required' : 'Email Verification Required'}
                  </h4>
                  <p className="text-teal-700 text-xs leading-relaxed">
                    {isEmailAuthenticated
                      ? 'To ensure booking confirmations reach you, we need to verify your phone number with a one-time code.'
                      : 'To ensure booking confirmations reach you, we\'ll verify your email with a one-time code.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1 sm:pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="w-full sm:flex-1 h-10 sm:h-11 text-sm rounded-xl border-2 border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !form.formState.isValid}
                className="w-full sm:flex-1 h-10 sm:h-11 text-sm rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-sm">Sending Code...</span>
                  </div>
                ) : (
                  "Send Verification Code"
                )}
              </Button>
            </div>

            {/* Privacy Note */}
            <div className="text-center pt-1">
              <p className="text-xs text-gray-500">
                Your information is secure and will only be used for booking purposes
              </p>
            </div>
          </form>
        ) : (
          <div className="space-y-4 pt-3 sm:pt-4">
            {/* Debug OTP Display - For Testing Only */}
            {debugOTP && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                    Testing Mode
                  </p>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-amber-700 mb-2">Your OTP Code:</p>
                  <div className="bg-white rounded-lg p-3 border-2 border-amber-200">
                    <p className="text-3xl font-black text-amber-900 tracking-[0.5em] font-mono">
                      {debugOTP}
                    </p>
                  </div>
                  <p className="text-xs text-amber-600 mt-2">
                    Copy this code to verify your phone number
                  </p>
                </div>
              </div>
            )}

            {/* OTP Input */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Verification Code <span className="text-red-500">*</span></span>
              </label>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="h-12 text-center text-2xl font-bold tracking-widest rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-0 bg-gray-50/50 transition-all duration-300"
              />
            </div>

            {/* Resend Timer */}
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-gray-600">
                  Resend code in <span className="font-semibold text-teal-600">{countdown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-sm text-teal-600 hover:text-teal-700 font-semibold underline disabled:opacity-50"
                >
                  Resend Code
                </button>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-blue-700 text-xs leading-relaxed text-center">
                Check your phone for the verification code. The code expires in 5 minutes.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.length !== 6}
                className="w-full h-11 text-sm rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Verify & Complete Booking"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
                className="w-full h-10 text-sm rounded-xl border-2 border-gray-200 hover:bg-gray-50"
              >
                Back to Edit Details
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}