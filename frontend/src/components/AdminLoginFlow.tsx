import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, Shield, User, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "../lib/api";
import { loginSchema, insertUserSchema } from "../lib/schemas";
import OTPVerification from "./OTPVerification";
import AdminProfileCompletion from "./AdminProfileCompletion";
import ForgotPassword from "./ForgotPassword";
import type { User as UserType } from "../types";
import { GoogleLogin } from "@react-oauth/google";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

const termsAndConditionsContent = `# Terms and Conditions for Salon Registration on AltQ



**Last Updated:** October 27, 2025



Welcome to AltQ!



These Terms and Conditions ("Terms") govern your registration and use of the AltQ platform (the "Platform") as a salon owner or authorized representative ("Salon," "You," or "Your"). By registering your salon on the Platform, you enter into a legally binding agreement with AltQ, operated by [Your Full Name], a proprietorship business with its principal place of business in Ludhiana, Punjab, India.



**Note:** AltQ is currently an unregistered proprietorship. These Terms are valid and enforceable under Indian law for non-corporate entities.



---



## 1. Eligibility and Representations



By registering, you represent and warrant that:



*   You are at least 18 years of age and possess the legal capacity to enter into this agreement.

*   You are duly authorized to operate the salon and to bind the salon to these Terms.

*   Your salon operates in full compliance with all applicable local, state, and national laws, including but not limited to business licenses, tax registrations (e.g., GST, if applicable), and municipal permissions.

*   You are registering as a proprietor, partner, or an authorized individual representing the salon.



---



## 2. Account and Data Accuracy



### 2.1. Account Information



You agree to provide accurate, complete, and truthful information during registration and throughout your use of the Platform, including but not limited to salon name, address, contact details, photographs, services offered, and pricing.



### 2.2. Account Security



You are solely responsible for maintaining the confidentiality of your account login credentials and for all activities that occur under your account. You must notify AltQ immediately of any unauthorized use of your account.



### 2.3. Suspension/Termination



AltQ reserves the right to suspend or terminate your account, without prior notice, if any information provided is found to be false, misleading, or incomplete, or in cases of spamming, misuse, or violation of these Terms.



---



## 3. Permitted Use of AltQ



### 3.1. Allowed Activities



You are permitted to use the Platform to:



*   Manage digital queues, appointments, and customer bookings.

*   Showcase your salon and its services to potential customers.

*   Utilize customer relationship management features.

*   Access basic analytics (under the free plan) or advanced insights (under paid plans).



### 3.2. Prohibited Activities



You shall not:



*   Upload, post, or transmit any content that is unlawful, harmful, defamatory, obscene, or otherwise objectionable.

*   Engage in unsolicited commercial communications (spam) or misuse customer data.

*   Attempt to copy, modify, reverse-engineer, decompile, or otherwise exploit any part of the Platform.

*   Use the Platform to compete with AltQ or offer similar services.



---



## 4. Customer Data and Privacy



### 4.1. Data Collection



You acknowledge that you will collect customer data (e.g., name, phone number, booking details) through the Platform.



### 4.2. Your Responsibilities



You are solely responsible for:



*   Obtaining all necessary consents from customers for the collection, storage, and use of their personal data.

*   Ensuring full compliance with all applicable Indian privacy laws, including the Information Technology Act, 2000, and the Digital Personal Data Protection Act, 2023.

*   Any unauthorized access, misuse, or breach of customer data under your control.



### 4.3. AltQ's Role



AltQ processes customer data solely for the purpose of providing the Platform's services. AltQ shall not be liable for your actions or omissions regarding customer data.



---



## 5. Fees and Payments



### 5.1. Plans



AltQ offers various plans, including a free plan with basic features and paid plans with enhanced functionalities. Details of paid plans, including pricing, will be clearly presented prior to subscription.



### 5.2. Payment Processing



All payments will be processed through secure and compliant payment gateways (e.g., Razorpay/UPI).



### 5.3. Taxes



Applicable taxes (e.g., GST, if applicable) will be added to the stated fees.



### 5.4. Refunds



All fees are non-refundable unless explicitly stated otherwise in AltQ's Refund Policy.



---



## 6. Intellectual Property



### 6.1. AltQ's Intellectual Property



All intellectual property rights related to the AltQ Platform, including its logo, software code, design, trademarks, and name, are exclusively owned by AltQ.



### 6.2. Salon's Content



You retain ownership of your salon's content, including photographs, name, and descriptions. By registering, you grant AltQ a non-exclusive, royalty-free, worldwide license to display, reproduce, and distribute your content on the Platform for promotional and operational purposes.



---



## 7. Disclaimers and Limitation of Liability



### 7.1. "As Is" Basis



The Platform is provided on an "as is" and "as available" basis, without any warranties, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. AltQ does not guarantee uninterrupted availability, error-free operation, or the accuracy of any information provided through the Platform.



### 7.2. No Liability for Indirect Damages



AltQ shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, business, or goodwill, arising out of or in connection with your use of the Platform.



### 7.3. Specific Exclusions



AltQ is not responsible for:



*   Loss of customers due to Platform downtime or technical issues.



*   Inaccurate queue timings or booking errors caused by your actions or customer input.



*   Any indirect losses, including loss of revenue or business opportunities.



### 7.4. Maximum Liability



In no event shall AltQ's total liability to you for all damages, losses, and causes of action exceed the total fees paid by you to AltQ in the six (6) months preceding the claim.



---



## 8. Termination



### 8.1. Termination by You



You may terminate your account at any time by navigating to Settings → Delete Account within the Platform.



### 8.2. Termination by AltQ



AltQ reserves the right to suspend or terminate your access to the Platform, without prior notice, if you breach any of these Terms.



### 8.3. Data Deletion



Upon termination, your data will be deleted from the Platform within 30 days, subject to legal and regulatory requirements.



---



## 9. Governing Law and Dispute Resolution



These Terms shall be governed by and construed in accordance with the laws of India. Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in Ludhiana, Punjab, India.



---



## 10. Changes to Terms



AltQ reserves the right to modify these Terms at any time. We will notify you of any material changes via email or through an in-app notification. Your continued use of the Platform after such modifications constitutes your acceptance of the revised Terms.



---



## 11. Contact Us



For any questions or concerns regarding these Terms, please contact us:



**Email:** support@altq.in

`;



const markdownToHtml = (markdown: string): string => {
  let html = markdown;

  // Convert headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Convert bold text
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

  // Convert lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

  // Convert horizontal rules
  html = html.replace(/^---$/gim, '<hr />');

  // Convert paragraphs (handle newlines)
  html = html.replace(/(\r\n|\r|\n){2,}/g, '</p><p>');
  html = `<p>${html}</p>`; // Wrap the whole thing in a paragraph

  return html;
};



type AdminLoginForm = z.infer<typeof loginSchema>;
type AdminRegisterForm = z.infer<typeof insertUserSchema>;

interface AdminLoginFlowProps {
  onAuthSuccess: (user: any, token: string) => void;
  onSwitchToCustomer: () => void;
}

export default function AdminLoginFlow({
  onAuthSuccess,
  onSwitchToCustomer
}: AdminLoginFlowProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<(UserType & { password?: string }) | null>(null);
  const [googleAuthUser, setGoogleAuthUser] = useState<UserType | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { toast } = useToast();

  // Google authentication handlers
  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      toast({
        title: "Error",
        description: "Failed to get Google credentials",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await api.auth.googleAuth(credentialResponse.credential, 'salon_owner');

      // Store token and user data
      localStorage.setItem('smartq_token', response.token);
      localStorage.setItem('smartq_user', JSON.stringify(response.user));

      // Check if user has required fields for admin access
      const hasRequiredFields = response.user.name && response.user.phone;

      if (!hasRequiredFields) {
        // Show profile completion form
        setGoogleAuthUser(response.user);
        setShowProfileCompletion(true);
        toast({
          title: "Profile Completion Required",
          description: "Please complete your profile to access admin features.",
        });
      } else {
        // Complete profile, proceed to dashboard
        toast({
          title: response.isNewUser ? "Welcome to SmartQ Admin!" : "Welcome back!",
          description: response.isNewUser
            ? "Your admin account has been created successfully"
            : "You've been logged in successfully as salon owner",
        });
        onAuthSuccess(response.user, response.token);
      }
    } catch (err: any) {
      let errorMessage = err.message || "Failed to sign in with Google";

      // Handle role conflict error
      if (err.existingRole && err.requestedRole) {
        errorMessage = `Account already exists as ${err.existingRole}. Please use the customer login instead.`;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleGoogleError = () => {
    toast({
      title: "Error",
      description: "Failed to sign in with Google",
      variant: "destructive",
    });
  };

  const loginForm = useForm<AdminLoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const registerForm = useForm<AdminRegisterForm>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "salon_owner",
      termsAccepted: false,
    },
    mode: "onChange",
  });

  // Load saved credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('smartq_admin_saved_email');
    const savedPassword = localStorage.getItem('smartq_admin_saved_password');
    const rememberMeEnabled = localStorage.getItem('smartq_admin_remember_me') === 'true';

    if (rememberMeEnabled && savedEmail && savedPassword) {
      loginForm.setValue('email', savedEmail);
      loginForm.setValue('password', savedPassword);
      setRememberMe(true);
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: api.auth.login,
    onSuccess: (data) => {
      // Save credentials if Remember Me is checked
      if (rememberMe) {
        localStorage.setItem('smartq_admin_saved_email', loginForm.getValues('email'));
        localStorage.setItem('smartq_admin_saved_password', loginForm.getValues('password'));
        localStorage.setItem('smartq_admin_remember_me', 'true');
      } else {
        // Clear saved credentials if Remember Me is not checked
        localStorage.removeItem('smartq_admin_saved_email');
        localStorage.removeItem('smartq_admin_saved_password');
        localStorage.removeItem('smartq_admin_remember_me');
      }

      if (data.user.role === 'salon_owner') {
        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in as salon owner.",
        });
        onAuthSuccess(data.user, data.token);
      } else {
        toast({
          title: "Access Denied",
          description: "This login is for salon owners only. Please use customer login instead.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      if (error.message.includes('not verified') && error.requiresVerification) {
        const userData = {
          id: error.userId,
          name: '',
          email: loginForm.getValues('email'),
          phone: '',
          role: 'salon_owner',
          loyaltyPoints: 0,
          favoriteSalons: [],
          createdAt: new Date(),
          password: loginForm.getValues('password')
        };
        setRegisteredUser(userData);
        setShowOTPVerification(true);
        toast({
          title: "Account Verification Required",
          description: "Please complete your email and phone verification.",
        });
      } else {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: (userData: AdminRegisterForm) => {
      console.log("Sending admin registration with role:", userData.role);
      return api.auth.register(userData);
    },
    onSuccess: (data: any) => {
      const registrationData = registerForm.getValues();
      setRegisteredUser({
        ...data.user,
        password: registrationData.password
      });
      setShowOTPVerification(true);
      toast({
        title: "Admin Account Created!",
        description: "Please verify your email and phone number to complete registration.",
      });
    },
    onError: (error: any) => {
      // Log the full error for debugging
      console.error('Admin Registration error:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Error keys:', Object.keys(error || {}));

      // Extract the actual error message from the API error format
      let errorMessage = "Failed to create account. Please try again.";

      if (error?.message) {
        // Try to extract message after "API Error XXX: " prefix
        const match = error.message.match(/API Error \d+:\s*(.+)/);
        if (match && match[1]) {
          errorMessage = match[1];
        } else {
          // If no match, use the full message
          errorMessage = error.message;
        }
      }

      console.log('Final error message to display:', errorMessage);

      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: AdminLoginForm) => {
    console.log('Admin login form submitted with:', data);
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: AdminRegisterForm) => {
    console.log('Admin register form submitted with:', data);
    console.log('Sending to API with role:', data.role);
    registerMutation.mutate(data);
  };

  const handleVerificationComplete = async () => {
    if (registeredUser && registeredUser.password) {
      try {
        const loginData = {
          email: registeredUser.email,
          password: registeredUser.password
        };

        console.log('Auto-logging in admin user after verification...', {
          email: loginData.email,
          hasPassword: !!loginData.password,
          userRole: registeredUser.role
        });
        const data = await api.auth.login(loginData);

        if (data.user.role === 'salon_owner') {
          toast({
            title: "Welcome to SmartQ Admin!",
            description: "Your salon owner account has been verified successfully.",
          });
          onAuthSuccess(data.user, data.token);
        } else {
          toast({
            title: "Access Denied",
            description: "This account is not authorized for admin access.",
            variant: "destructive",
          });
        }

        setRegisteredUser(null);
        setShowOTPVerification(false);

      } catch (error) {
        console.error('Auto-login after verification failed:', error);
        toast({
          title: "Verification Complete!",
          description: "Please login with your credentials to continue.",
        });

        loginForm.setValue('email', registeredUser.email);
        setShowOTPVerification(false);
        setIsLogin(true);
        setRegisteredUser(null);
      }
    }
  };

  const handleProfileCompletion = (completedUser: any, token: string) => {
    // Update stored user data
    localStorage.setItem('smartq_user', JSON.stringify(completedUser));

    toast({
      title: "Welcome to SmartQ Admin!",
      description: "Your profile has been completed successfully.",
    });

    setShowProfileCompletion(false);
    setGoogleAuthUser(null);
    onAuthSuccess(completedUser, token);
  };

  const handleProfileCompletionSkip = () => {
    if (googleAuthUser) {
      toast({
        title: "Profile Incomplete",
        description: "You can complete your profile later from settings.",
      });

      setShowProfileCompletion(false);
      onAuthSuccess(googleAuthUser, localStorage.getItem('smartq_token') || '');
      setGoogleAuthUser(null);
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
      <div className="relative flex flex-col h-full overflow-y-auto">
        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-6">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/loadlogo.png"
              alt="SmartQ Logo"
              className="h-16 w-auto drop-shadow-2xl"
            />
          </div>

          {/* Show Profile Completion, OTP Verification, Forgot Password, or Auth Form */}
          {showForgotPassword ? (
            <ForgotPassword onBack={() => setShowForgotPassword(false)} />
          ) : showProfileCompletion && googleAuthUser ? (
            <div className="w-full max-w-sm">
              <AdminProfileCompletion
                user={googleAuthUser}
                onCompletion={handleProfileCompletion}
                onSkip={handleProfileCompletionSkip}
              />
            </div>
          ) : showOTPVerification && registeredUser ? (
            <div className="w-full max-w-sm">
              <OTPVerification
                userId={registeredUser.id}
                email={registeredUser.email}
                phone={registeredUser.phone}
                onVerificationComplete={handleVerificationComplete}
              />
            </div>
          ) : (
            <>
              {/* Auth Card */}
              <div className="w-full max-w-sm bg-white/95 backdrop-blur-md rounded-2xl px-6 py-6 shadow-2xl border border-white/20">
                {/* Header */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {isLogin
                      ? "Sign in to manage your salon and access the dashboard."
                      : "Create your salon owner account to get started."}
                  </p>
                </div>

                {/* Auth Toggle Tabs */}
                <div className="bg-gray-100 rounded-xl p-1 mb-5">
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => {
                        setIsLogin(true);
                        registerForm.reset();
                        setShowPassword(false);
                      }}
                      className={`py-2 px-4 rounded-lg font-semibold text-xs transition-all duration-200 ${isLogin
                        ? 'bg-white text-teal-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setIsLogin(false);
                        loginForm.reset();
                        setShowPassword(false);
                      }}
                      className={`py-2 px-4 rounded-lg font-semibold text-xs transition-all duration-200 ${!isLogin
                        ? 'bg-white text-teal-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>

                {/* Forms */}
                {isLogin ? (
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-3">
                    {/* Email Input */}
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                        <Mail className="w-4 h-4" />
                      </div>
                      <Input
                        type="email"
                        placeholder="Email Address"
                        className="h-11 pl-11 pr-4 text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white placeholder-gray-400 transition-all text-sm"
                        {...loginForm.register("email")}
                        autoComplete="email"
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-xs text-red-600 mt-1 ml-1">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                        <Lock className="w-4 h-4" />
                      </div>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="h-11 pl-11 pr-11 text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white placeholder-gray-400 transition-all text-sm"
                        {...loginForm.register("password")}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {loginForm.formState.errors.password && (
                        <p className="text-xs text-red-600 mt-1 ml-1">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Remember Me and Forgot Password */}
                    <div className="flex items-center justify-between mt-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          checked={rememberMe}
                          onChange={(e) => {
                            setRememberMe(e.target.checked);
                            if (!e.target.checked) {
                              localStorage.removeItem('smartq_admin_saved_email');
                              localStorage.removeItem('smartq_admin_saved_password');
                              localStorage.removeItem('smartq_admin_remember_me');
                            }
                          }}
                        />
                        <span className="text-sm text-gray-600">Remember Me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    {/* Login Button */}
                    <button
                      type="submit"
                      disabled={loginMutation.isPending}
                      className="w-full h-11 text-white font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl mt-4 text-sm"
                    >
                      {loginMutation.isPending ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Signing in...
                        </div>
                      ) : (
                        "Sign In"
                      )}
                    </button>

                    {/* Divider */}
                    <div className="relative mt-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                      </div>
                    </div>

                    {/* Google Login Button */}
                    <div className="mt-4">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap={false}
                        theme="outline"
                        size="large"
                        width="100%"
                        shape="rectangular"
                        text="signin_with"
                        logo_alignment="left"
                      />
                    </div>
                  </form>
                ) : (
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-3">
                    {/* Full Name Input */}
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                        <User className="w-4 h-4" />
                      </div>
                      <Input
                        placeholder="Full Name"
                        className="h-11 pl-11 pr-4 text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white placeholder-gray-400 transition-all text-sm"
                        {...registerForm.register("name")}
                        autoComplete="name"
                      />
                      {registerForm.formState.errors.name && (
                        <p className="text-xs text-red-600 mt-1 ml-1">
                          {registerForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Email Input */}
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                        <Mail className="w-4 h-4" />
                      </div>
                      <Input
                        type="email"
                        placeholder="Email Address"
                        className="h-11 pl-11 pr-4 text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white placeholder-gray-400 transition-all text-sm"
                        {...registerForm.register("email")}
                        autoComplete="email"
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-xs text-red-600 mt-1 ml-1">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Phone Input */}
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                        <Phone className="w-4 h-4" />
                      </div>
                      <Input
                        type="tel"
                        placeholder="Phone Number"
                        className="h-11 pl-11 pr-4 text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white placeholder-gray-400 transition-all text-sm"
                        {...registerForm.register("phone")}
                        autoComplete="tel"
                      />
                      {registerForm.formState.errors.phone && (
                        <p className="text-xs text-red-600 mt-1 ml-1">
                          {registerForm.formState.errors.phone.message}
                        </p>
                      )}
                    </div>

                    {/* Password Input with Strength Indicator */}
                    <div className="space-y-2">
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                          <Lock className="w-4 h-4" />
                        </div>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className={`h-11 pl-11 pr-11 text-gray-900 bg-gray-50 border rounded-xl focus:outline-none focus:bg-white placeholder-gray-400 transition-all text-sm ${registerForm.formState.errors.password
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-gray-300 focus:border-teal-500'
                            }`}
                          {...registerForm.register("password")}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      {registerForm.watch("password") && (
                        <div className="space-y-1.5">
                          {/* Progress Bar */}
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((level) => {
                              const password = registerForm.watch("password") || "";
                              const hasMinLength = password.length >= 8;
                              const hasUpperCase = /[A-Z]/.test(password);
                              const hasLowerCase = /[a-z]/.test(password);
                              const hasNumber = /[0-9]/.test(password);
                              const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

                              const strength = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecial].filter(Boolean).length;

                              let barColor = 'bg-gray-200';
                              if (strength >= level) {
                                if (strength <= 2) barColor = 'bg-red-500';
                                else if (strength === 3) barColor = 'bg-yellow-500';
                                else if (strength === 4) barColor = 'bg-blue-500';
                                else barColor = 'bg-green-500';
                              }

                              return (
                                <div
                                  key={level}
                                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${barColor}`}
                                />
                              );
                            })}
                          </div>

                          {/* Validation Messages */}
                          {registerForm.formState.errors.password ? (
                            <p className="text-xs text-red-600 leading-tight">
                              {registerForm.formState.errors.password.message}
                            </p>
                          ) : (
                            <div className="space-y-0.5">
                              {(() => {
                                const password = registerForm.watch("password") || "";
                                const hasMinLength = password.length >= 8;
                                const hasUpperCase = /[A-Z]/.test(password);
                                const hasLowerCase = /[a-z]/.test(password);
                                const hasNumber = /[0-9]/.test(password);
                                const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
                                const allValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecial;

                                if (allValid) {
                                  return (
                                    <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                      <span className="inline-block w-1 h-1 bg-green-600 rounded-full"></span>
                                      Strong password! ✓
                                    </p>
                                  );
                                }

                                // Show what's missing
                                const missing = [];
                                if (!hasMinLength) missing.push("8+ characters");
                                if (!hasUpperCase) missing.push("uppercase letter");
                                if (!hasLowerCase) missing.push("lowercase letter");
                                if (!hasNumber) missing.push("number");
                                if (!hasSpecial) missing.push("special character");

                                return (
                                  <p className="text-xs text-gray-600 leading-tight">
                                    {missing.length > 0
                                      ? `Missing: ${missing.join(", ")}`
                                      : "Use mix of characters, numbers, and symbols"
                                    }
                                  </p>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Terms and Conditions Checkbox */}
                    <div className="flex items-center space-x-2 mt-4">
                      <Checkbox
                        id="terms"
                        {...registerForm.register("termsAccepted")}
                        checked={registerForm.watch("termsAccepted")}
                        onCheckedChange={(checked) => {
                          registerForm.setValue("termsAccepted", checked as boolean, { shouldValidate: true });
                        }}
                      />
                      <label
                        htmlFor="terms"
                        className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
                      >
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-teal-600 hover:underline"
                        >
                          Terms and Conditions
                        </button>
                      </label>
                    </div>
                    {registerForm.formState.errors.termsAccepted && (
                      <p className="text-xs text-red-600 mt-1 ml-1">
                        {registerForm.formState.errors.termsAccepted.message}
                      </p>
                    )}

                    {/* Create Account Button */}
                    <button
                      type="submit"
                      disabled={registerMutation.isPending || !registerForm.watch("termsAccepted")}
                      className="w-full h-11 text-white font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl mt-4 text-sm"
                    >
                      {registerMutation.isPending ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Creating account...
                        </div>
                      ) : (
                        "Create Account"
                      )}
                    </button>

                    {/* Divider */}
                    <div className="relative mt-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                      </div>
                    </div>

                    {/* Google Login Button */}
                    <div className="mt-4">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap={false}
                        theme="outline"
                        size="large"
                        width="100%"
                        shape="rectangular"
                        text="signin_with"
                        logo_alignment="left"
                      />
                    </div>
                  </form>
                )}

                {/* Security Badge */}
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-2.5 mt-5">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-3.5 h-3.5 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-teal-900 text-xs mb-0.5">
                        Enhanced Security
                      </h4>
                      <p className="text-teal-700 text-xs leading-relaxed">
                        {isLogin
                          ? "Admin accounts have additional security measures."
                          : "All accounts require email and phone verification."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Login Link */}
                <div className="text-center mt-5 pt-5 border-t border-gray-200">
                  <p className="text-gray-500 text-xs">
                    Not a salon owner?{" "}
                    <button
                      type="button"
                      onClick={onSwitchToCustomer}
                      className="text-teal-600 font-semibold hover:text-teal-700 transition-colors"
                    >
                      Customer Login
                    </button>
                  </p>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="text-center mt-4">
                <p className="text-white/60 text-xs">
                  🔒 Your data is secure and encrypted
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms and Conditions</DialogTitle>
            <DialogDescription>
              Please read the terms and conditions carefully before proceeding.
            </DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: markdownToHtml(termsAndConditionsContent) }}></div>
          <DialogFooter>
            <DialogClose asChild>
              <button type="button" className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors">
                Close
              </button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
