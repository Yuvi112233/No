import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const profileCompletionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name is too long"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
});

type ProfileCompletionForm = z.infer<typeof profileCompletionSchema>;

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
  const { toast } = useToast();

  const form = useForm<ProfileCompletionForm>({
    resolver: zodResolver(profileCompletionSchema),
    defaultValues: {
      name: "",
      email: "",
    },
    mode: "onChange",
  });

  const handleSubmit = async (data: ProfileCompletionForm) => {
    setIsLoading(true);

    try {
      const { api } = await import("../lib/api");
      await api.auth.completeProfile(data.name, data.email);

      toast({
        title: "Profile Updated!",
        description: "Your booking details have been saved.",
      });

      onComplete({
        name: data.name,
        email: data.email,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
            Complete Your Booking
          </DialogTitle>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-2 px-2">
            We need a few details to confirm your booking at <span className="font-semibold">{salonName}</span>
          </p>
        </DialogHeader>

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

          {/* Email Input */}
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
              We'll send booking confirmations and updates to this email
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-2.5 sm:p-3">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 p-1">
                <img
                  src="/loadlogo.png"
                  alt="AltQ"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-teal-900 text-xs mb-0.5">
                  Why do we need this?
                </h4>
                <p className="text-teal-700 text-xs leading-relaxed">
                  Your name helps the salon staff identify you when it's your turn.
                  Email is required for booking confirmations and updates.
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
                  <span className="text-sm">Saving...</span>
                </div>
              ) : (
                "Complete Booking"
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
      </DialogContent>
    </Dialog>
  );
}