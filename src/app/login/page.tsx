"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Home, Eye, EyeOff, Phone, Mail, User, Briefcase, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type UserRole = 'User' | 'Broker' | 'Builder';

export default function LoginPage() {
  const router = useRouter();
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const source = searchParams.get("source");
      if (source === "app") {
        sessionStorage.setItem("source", "app");
      }
    }
  }, []);

  const [isSignUp, setIsSignUp] = useState(true); // Default to Sign Up
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>('User');

  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const isApp = sessionStorage.getItem('source') === 'app';
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.trim(),
          password: passwordInput,
          role: selectedRole,
          isApp
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.isApp && data.token) {
        window.location.href = `ivanta-properties://callback?token=${data.token}`;
      } else {
        router.push(new URLSearchParams(window.location.search).get('returnTo') || '/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const roles: { value: UserRole; label: string; icon: any; description: string }[] = [
    { value: 'User', label: 'User Login', icon: User, description: 'For property seekers' },
    { value: 'Broker', label: 'Broker Login', icon: Briefcase, description: 'For real estate agents' },
    { value: 'Builder', label: 'Builder Login', icon: Building2, description: 'For property developers' },
  ];

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.length === 10) {
      // TODO: Implement actual OTP sending logic
      setOtpSent(true);
      console.log("Sending OTP to:", mobileNumber);
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual OTP verification logic
    console.log("Verifying OTP:", otp, "for mobile:", mobileNumber);
    console.log("User details:", { name, email, mobileNumber });
    // Redirect to dashboard after successful verification
    router.push("/dashboard");
  };

  const handleResendOTP = () => {
    // TODO: Implement resend OTP logic
    console.log("Resending OTP to:", mobileNumber);
  };

  const handleGoogleSignIn = () => {
    const returnTo = new URLSearchParams(window.location.search).get('returnTo') || '/';
    const isApp = sessionStorage.getItem('source') === 'app';
    const source = isApp ? '&source=app' : '';
    window.location.href = `/api/auth/google?role=${selectedRole}&returnTo=${encodeURIComponent(returnTo)}${source}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <Home className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isSignUp ? "Sign up to get started with IvantaProperty" : "Sign in to your IvantaProperty account"}
            </p>
          </div>

          <div className="bg-card rounded-xl card-shadow p-6">
            {/* Role Selection */}
            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-3 block">Select Login Type</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setSelectedRole(role.value)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                        selectedRole === role.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mb-1 ${
                        selectedRole === role.value ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <span className={`text-xs font-medium ${
                        selectedRole === role.value ? 'text-primary' : 'text-foreground'
                      }`}>
                        {role.value}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {roles.find(r => r.value === selectedRole)?.description}
              </p>
            </div>

            {/* Google Sign In Button - Moved to Top */}
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full h-11 font-medium hover:bg-secondary/100 hover:text-foreground transition-colors mb-6"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {isSignUp ? (
              // Sign Up Form
              <form className="flex flex-col gap-4" onSubmit={otpSent ? handleVerifyOTP : handleSendOTP}>
                {!otpSent ? (
                  // Step 1: Enter Details and Mobile Number
                  <>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Full Name</label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Email (Optional)</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Mobile Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="tel"
                          placeholder="Enter 10-digit mobile number"
                          value={mobileNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            if (value.length <= 10) setMobileNumber(value);
                          }}
                          required
                          maxLength={10}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                      {mobileNumber.length > 0 && mobileNumber.length < 10 && (
                        <p className="text-xs text-destructive mt-1">Please enter a valid 10-digit mobile number</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={!name || mobileNumber.length !== 10}
                      className="gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send OTP
                    </Button>
                  </>
                ) : (
                  // Step 2: Verify OTP
                  <>
                    <div className="text-center mb-2">
                      <p className="text-sm text-muted-foreground">
                        Enter the OTP sent to
                      </p>
                      <p className="text-sm font-semibold text-foreground mt-1">
                        +91 {mobileNumber}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp("");
                        }}
                        className="text-xs text-primary hover:underline mt-1"
                      >
                        Change Number
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block text-center">Enter OTP</label>
                      <div className="flex justify-center">
                        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        Resend OTP
                      </button>
                    </div>
                    <Button
                      type="submit"
                      disabled={otp.length !== 6}
                      className="gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Verify & Sign Up
                    </Button>
                  </>
                )}
              </form>
            ) : (
              // Sign In Form
              <form className="flex flex-col gap-4" onSubmit={handleEmailSignIn}>
                {errorMsg && (
                  <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg text-center">
                    {errorMsg}
                  </p>
                )}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <button type="button" className="text-xs text-primary hover:underline">
                    Forgot Password?
                  </button>
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            )}

            <p className="text-center text-sm text-muted-foreground mt-6">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setOtpSent(false);
                  setOtp("");
                  setMobileNumber("");
                  setName("");
                  setEmail("");
                }}
                className="text-primary font-medium hover:underline"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
