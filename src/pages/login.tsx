import NavHeader from "@/components/shared/Header/NavHeader";
import { useLogin } from "@/hooks/useAuth";
import { NextPage } from "next";
import { useForm, SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/dist/client/link";
import CryptoJS from 'crypto-js';

interface LoginInputs {
  email: string;
  password: string;
}

const LoginForm: NextPage = () => {
  const { mutate: login, isPending: loginIsPending } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInputs>();

  // Encryption function - FIXED VERSION
  const encryptData = (data: string): string => {
    try {
      // Get encryption key from environment
      const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
      
      if (!encryptionKey) {
        console.warn('Encryption key not found, sending plain text');
        return data;
      }
      
      // Trim key to 32 bytes (256 bits) if needed
      const key = encryptionKey.substring(0, 64); // 64 hex chars = 32 bytes
      
      console.log('Encrypting with key:', key.substring(0, 10) + '...');
      
      // Use simple CryptoJS encryption
      const encrypted = CryptoJS.AES.encrypt(data, key).toString();
      
      console.log('Encrypted result:', encrypted.substring(0, 50) + '...');
      return encrypted;
      
    } catch (error) {
      console.error('Encryption error:', error);
      return data; // Fallback to plain text
    }
  };

  const onSubmit: SubmitHandler<LoginInputs> = (data) => {
    setLoading(true);
    setError(null);
    
    try {
      // Encrypt credentials before sending
      const encryptedPayload = {
        email: encryptData(data.email),
        password: encryptData(data.password),
        timestamp: Date.now()
      };
      
      console.log('Sending encrypted payload:', {
        email: encryptedPayload.email.substring(0, 50) + '...',
        password: encryptedPayload.password.substring(0, 50) + '...',
        timestamp: encryptedPayload.timestamp
      });
      
      login(
        encryptedPayload,
        {
          onSuccess: (res) => {
            console.log('Login success:', res);
            const userData = res?.userDetails;
            const accessToken = res?.status?.accessToken;
            const department = res?.userDetails?.department_name?.toLowerCase();
            const superAdmin = res?.userDetails?.is_super_admin;
            
            // Store in sessionStorage (consider using HTTP-only cookies in production)
            sessionStorage.setItem("userdetail", JSON.stringify(userData));
            sessionStorage.setItem("OAuthCredentials", accessToken);
            
            if (superAdmin === 1) {
              router.replace(`/admin`);
            } else {
              router.replace(`/${department}/dashboard`);
            }
          },
          onError: (err: any) => {
            console.error('Login error details:', err);
            const errorMsg = err?.response?.data?.message || 
                            err?.message || 
                            "Login failed. Please check your credentials.";
            setError(errorMsg);
            alert(errorMsg);
            setLoading(false);
          },
        }
      );
    } catch (error) {
      console.error('Form submission error:', error);
      alert('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader />
      <div className="flex flex-1">
        {/* Left side */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-900 to-blue-600 text-white flex-col justify-center items-center p-10">
          <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
          <p className="text-lg text-gray-200 text-center max-w-md">
            Secure login to access your departmental dashboard.
          </p>
        </div>
        {/* Right side */}
        <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50">
          <div className="w-full max-w-md bg-white shadow-2xl rounded-xl p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-blue-800">Login</h1>
              <p className="text-gray-500 text-sm mt-2">
                Enter your credentials to continue
              </p>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-1 font-medium">
                  Email Id <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  disabled={loading}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", { 
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters"
                      }
                    })}
                    className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            <div className="text-center mt-4">
              <Link href="/forgot-password" className="text-blue-500 text-sm hover:underline">
                Forgot Password?
              </Link>
            </div>
            <p className="text-center text-xs text-red-600 mt-4">
              <b>Note:</b> Please contact MIS Cell for any login issues.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;