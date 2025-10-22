import { useState } from "react";
import UnifiedAuthScreen from "./UnifiedAuthScreen";
import EmailInput from "./EmailInput";
import PhoneOTPVerification from "./PhoneOTPVerification";
import EmailOTPVerification from "./EmailOTPVerification";
import WelcomeLoading from "./WelcomeLoading";
import { useAuth } from "../context/AuthContext";

type AuthStep = 
  | 'main' 
  | 'email-input' 
  | 'phone-otp' 
  | 'email-otp' 
  | 'welcome';

export default function AuthFlow() {
  const [currentStep, setCurrentStep] = useState<AuthStep>('main');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const { user, login } = useAuth();

  const handlePhoneOTPSent = (phone: string) => {
    setPhoneNumber(phone);
    setCurrentStep('phone-otp');
  };

  const handleEmailSelected = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setCurrentStep('email-input');
  };

  const handleEmailOTPSent = (emailAddress: string, userIdValue: string) => {
    setEmail(emailAddress);
    setUserId(userIdValue);
    setCurrentStep('email-otp');
  };

  const handleOTPVerificationSuccess = (userData: any, token: string) => {
    login(userData, token);
    setCurrentStep('welcome');
  };



  const handleWelcomeComplete = () => {
    window.location.href = '/';
  };

  const handleBackToMain = () => {
    setCurrentStep('main');
  };

  const handleSwitchToAdmin = () => {
    // Redirect to auth page with admin flow parameter
    window.location.href = '/auth?flow=admin';
  };

  // Render current step
  switch (currentStep) {
    case 'main':
      return (
        <UnifiedAuthScreen
          onPhoneOTPSent={handlePhoneOTPSent}
          onEmailSelected={handleEmailSelected}
          onGoogleSuccess={() => {
            // Google auth is handled internally
          }}
          onSwitchToAdmin={handleSwitchToAdmin}
        />
      );

    case 'email-input':
      return (
        <EmailInput
          prefilledEmail={email}
          onBack={handleBackToMain}
          onOTPSent={handleEmailOTPSent}
        />
      );

    case 'phone-otp':
      return (
        <PhoneOTPVerification
          phoneNumber={phoneNumber}
          onVerificationSuccess={handleOTPVerificationSuccess}
          onBack={handleBackToMain}
        />
      );

    case 'email-otp':
      return (
        <EmailOTPVerification
          email={email}
          userId={userId}
          onVerificationSuccess={handleOTPVerificationSuccess}
          onBack={() => setCurrentStep('email-input')}
        />
      );

    case 'welcome':
      return (
        <WelcomeLoading
          onComplete={handleWelcomeComplete}
          userName={user?.name || undefined}
        />
      );

    default:
      return (
        <UnifiedAuthScreen
          onPhoneOTPSent={handlePhoneOTPSent}
          onEmailSelected={handleEmailSelected}
          onGoogleSuccess={() => {}}
          onSwitchToAdmin={handleSwitchToAdmin}
        />
      );
  }
}
