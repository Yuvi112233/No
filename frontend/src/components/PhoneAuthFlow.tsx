import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import AuthFlow from "./AuthFlow";
import { Toaster } from "@/components/ui/toaster";

interface PhoneAuthFlowProps {
  onComplete?: (user?: any) => void;
}

export default function PhoneAuthFlow({ onComplete }: PhoneAuthFlowProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      if (onComplete) {
        onComplete(user);
      } else {
        setLocation('/');
      }
    }
  }, [user, setLocation, onComplete]);

  // Don't render if user is already authenticated
  if (user) {
    return null;
  }

  // Render Zomato-style auth flow
  return (
    <>
      <Toaster />
      <AuthFlow />
    </>
  );
}