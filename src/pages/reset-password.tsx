"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  // ✅ Token validation on component mount
  useEffect(() => {
  const validateToken = async () => {
    const tokenFromURL = searchParams?.get('token');
    console.log("🔍 Token from URL:", tokenFromURL);
    
    if (!tokenFromURL) {
      setIsTokenValid(false);
      toast.error("Invalid or missing reset token");
      return;
    }

    setToken(tokenFromURL);
    
    try {
      // ✅ Token validate karo backend se
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const response = await axios.get(
        `${API_URL}/auth/test-token?token=${tokenFromURL}`,
        {
          timeout: 8000,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log("✅ Token validation response:", response.data);
      
      // ✅ FIX: Use isExpired instead of valid property
      if (response.data.status === "FOUND" && !response.data.isExpired) {
        setIsTokenValid(true);
        setTokenInfo(response.data);
        console.log("🎯 Token is VALID and NOT expired");
      } else {
        setIsTokenValid(false);
        console.log("❌ Token is invalid or expired:", response.data);
        if (response.data.message) {
          toast.error(response.data.message);
        } else {
          toast.error("This reset link has expired or is invalid");
        }
      }
    } catch (error: any) {
      console.error("❌ Token validation error:", error);
      
      // Agar test endpoint available nahi hai, toh direct proceed karo
      if (error.response?.status === 404) {
        console.log("ℹ️ Test endpoint not available, proceeding with token...");
        setIsTokenValid(true);
      } else {
        setIsTokenValid(false);
        toast.error("Failed to validate reset link");
      }
    }
  };

  validateToken();
}, [searchParams, router]);

  // Password strength checker
  useEffect(() => {
    if (newPassword.length === 0) {
      setPasswordStrength("");
      return;
    }
    const strength = checkPasswordStrength(newPassword);
    setPasswordStrength(strength);
  }, [newPassword]);

  const checkPasswordStrength = (password: string) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const mediumRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (strongRegex.test(password)) return "strong";
    if (mediumRegex.test(password)) return "medium";
    return "weak";
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case "strong": return "Strong password";
      case "medium": return "Medium strength";
      case "weak": return "Weak password";
      default: return "Enter a password";
    }
  };

  const getPasswordRequirements = () => {
    const requirements = [
      { met: newPassword.length >= 8, text: "At least 8 characters" },
      { met: /[a-z]/.test(newPassword), text: "One lowercase letter" },
      { met: /[A-Z]/.test(newPassword), text: "One uppercase letter" },
      { met: /\d/.test(newPassword), text: "One number" },
      { met: /[@$!%*?&]/.test(newPassword), text: "One special character (@$!%*?&)" }
    ];
    return requirements;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log("🔄 Submitting reset password with token:", token);

    // Enhanced Validation
    if (!token) {
      toast.error("Invalid reset token");
      setIsLoading(false);
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Enhanced password validation
    const passwordErrors = [];
    if (newPassword.length < 8) passwordErrors.push("at least 8 characters");
    if (!/[a-z]/.test(newPassword)) passwordErrors.push("one lowercase letter");
    if (!/[A-Z]/.test(newPassword)) passwordErrors.push("one uppercase letter");
    if (!/\d/.test(newPassword)) passwordErrors.push("one number");
    
    if (passwordErrors.length > 0) {
      toast.error(`Password must contain: ${passwordErrors.join(", ")}`);
      setIsLoading(false);
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      console.log("📤 Sending request to:", `${API_URL}/auth/reset-password`);
      
      const response = await axios.post(
        `${API_URL}/auth/reset-password`,
        { 
          token,
          newPassword 
        },
        {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log("✅ Reset password success:", response.data);
      toast.success("Password reset successfully! Redirecting to login...");
      
      // Redirect to login after success
      setTimeout(() => {
        router.push("/login?message=password_reset_success");
      }, 2000);

    } catch (error: any) {
      console.error("❌ Reset password error:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to reset password. Please try again.";
      
      // Enhanced error messages
      if (error.response?.status === 410) {
        toast.error("This reset link has expired. Please request a new one.");
        setTimeout(() => {
          router.push("/forgot-password?expired=true");
        }, 3000);
      } else if (error.response?.status === 400) {
        toast.error("Invalid reset link. Please request a new password reset.");
        setTimeout(() => {
          router.push("/forgot-password");
        }, 3000);
      } else if (error.code === 'ECONNABORTED') {
        toast.error("Request timeout. Please check your connection and try again.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Loading state - token validation in progress
  if (isTokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying Reset Link</h2>
          <p className="text-gray-600">Please wait while we validate your reset link...</p>
        </div>
      </div>
    );
  }

  // ✅ Invalid token state
  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Link</h1>
          <p className="text-gray-600 mb-6">
            {tokenInfo?.message || "This password reset link is invalid or has expired."}
          </p>
          <Link 
            href="/forgot-password" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 inline-block"
          >
            Get New Reset Link
          </Link>
          
          {/* Additional help */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Need help?{" "}
              <Link href="/contact" className="text-blue-600 hover:underline">
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Password</h1>
          <p className="text-gray-600">Enter your new password below</p>
          
          {/* Token expiry info */}
          {tokenInfo && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Link expires in:</strong> {tokenInfo.minutesRemaining} minutes
              </p>
            </div>
          )}
        </div>

        {/* Password Requirements */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Password Requirements:</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            {getPasswordRequirements().map((req, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${req.met ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                <span className={req.met ? 'text-green-700 font-medium' : ''}>
                  {req.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password Field */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-24 ${
                  newPassword ? (
                    passwordStrength === "strong" ? "border-green-300" :
                    passwordStrength === "medium" ? "border-yellow-300" :
                    "border-red-300"
                  ) : "border-gray-300"
                }`}
                placeholder="Enter new password"
                disabled={isLoading}
                required
                minLength={8}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 rounded hover:bg-gray-100"
                  disabled={isLoading}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            
            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Password strength:</span>
                  <span className={`font-medium ${
                    passwordStrength === "strong" ? "text-green-600" :
                    passwordStrength === "medium" ? "text-yellow-600" :
                    "text-red-600"
                  }`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength === "strong" ? "w-full bg-green-500" :
                      passwordStrength === "medium" ? "w-2/3 bg-yellow-500" :
                      passwordStrength === "weak" ? "w-1/3 bg-red-500" :
                      "w-0"
                    }`}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-24 ${
                  confirmPassword ? (
                    newPassword === confirmPassword ? "border-green-300" : "border-red-300"
                  ) : "border-gray-300"
                }`}
                placeholder="Confirm new password"
                disabled={isLoading}
                required
                minLength={8}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 rounded hover:bg-gray-100"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            
            {/* Password Match Indicator */}
            {confirmPassword && (
              <div className="mt-2">
                <span className={`text-xs font-medium ${
                  newPassword === confirmPassword ? "text-green-600" : "text-red-600"
                }`}>
                  {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword || passwordStrength === "weak"}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </button>

          {/* Back to Login Link */}
          <div className="text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors hover:underline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </Link>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            <span className="font-semibold">Security Tip:</span> Choose a strong password that you haven&apos;t used before.
          </p>
        </div>

        {/* Debug Info (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Debug:</strong> Token: {token ? "✅ Present" : "❌ Missing"} | 
              Valid: {isTokenValid ? "✅ Yes" : "❌ No"} |
              Strength: {passwordStrength}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}