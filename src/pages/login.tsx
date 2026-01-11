import {NavHeader} from "@/components/shared/Header/NavHeader";
import { useLogin } from "@/hooks/useAuth";
import { NextPage } from "next";
import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/dist/client/link";

interface LoginInputs {
  email: string;
  password: string;
}
const LoginForm: NextPage = () => {
  const { mutate: login, isPending: loginIsPanding } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInputs>();
  const onSubmit: SubmitHandler<LoginInputs> = (data) => {
    setLoading(true);
    login(
      data,
      {
        onSuccess: (res) => {
          const userData = res?.userDetails;
          const accessToken = res?.status?.accessToken;
          const department = res?.userDetails?.department_name.toLowerCase();
          const superAdmin = res?.userDetails?.is_super_admin;
          sessionStorage.setItem("userdetail", JSON.stringify(userData));
          sessionStorage.setItem("OAuthCredentials", accessToken);
          if (superAdmin === 1) {
            router.replace(`/admin`);
          } else {
            router.replace(`/${department}/dashboard`);
          }
        },
        onError: (err: any) => {
          alert("Login failed: " + (err?.response?.data?.message || err.message));
          setLoading(false);
        },
      }
    );
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-1 font-medium">
                  Email Id <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register("email", { required: "Email is required" })}
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
                    {...register("password", { required: "Password is required" })}
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
