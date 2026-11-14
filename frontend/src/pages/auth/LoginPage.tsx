import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

import { loginSchema, type LoginFormData } from '../../schemas/authSchema';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';
import { GatewayPipelineVisualizer } from '../../components/auth/GatewayPipelineVisualizer';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    const loadingToast = toast.loading('Verifying security token...');

    try {
      const role = await login(data);
      toast.dismiss(loadingToast);
      toast.success('Access Granted! Redirecting...');

      if (role === 'PLATFORM_ADMIN') {
        navigate('/platform/dashboard', { replace: true });
      } else {
        navigate('/tenant/dashboard', { replace: true });
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      const errorMsg = error.response?.data?.message || 'Invalid username or password.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-slate-950 font-sans">
      
      {/* Left Column */}
      <div className="hidden lg:flex lg:col-span-7 bg-slate-900 text-white p-10 lg:p-14 flex-col justify-between relative overflow-hidden border-r border-slate-800">
        
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between mb-8">
          <Logo size="lg" />
        </div>

        {/* Central Pipeline Visualizer */}
        <div className="relative z-10 my-auto py-6 max-w-2xl mx-auto w-full">
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              GateKeeper Control Plane v1.0
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Multi-tenant API Gateway & Security Infrastructure
            </h1>
          </div>

          <GatewayPipelineVisualizer />
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-6 text-xs font-mono text-slate-500 flex items-center justify-between border-t border-slate-800/80">
          <span>Spring Boot • PostgreSQL • Redis • Kafka</span>
          <span>© {new Date().getFullYear()} GateKeeper Inc.</span>
        </div>
      </div>

      {/* Right Column: High-End Interactive Login Form */}
      <div className="col-span-1 lg:col-span-5 flex flex-col justify-between px-6 sm:px-12 lg:px-14 py-8 lg:py-12 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative">
        
        <div className="lg:hidden flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <Logo size="md" />
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200">
            Secure Portal
          </span>
        </div>

        <div className="my-auto w-full max-w-md mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl shadow-gray-100/50 relative overflow-hidden"
          >
            {/* Top Security Line Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

            {/* Header with security icon badge */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> Identity Verification
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Sign in to GateKeeper</h2>
                <p className="text-xs text-gray-500 mt-1">Enter your admin credentials to access your control panel.</p>
              </div>
              <div className="hidden sm:flex p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-400">
                <KeyRound className="w-5 h-5 text-emerald-600" />
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {/* Username Input Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>Admin Username</span>
                  <span className="text-[10px] text-gray-400 normal-case font-normal">Case-sensitive</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    {...register('username')}
                    placeholder="admin_user"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errors.username.message}</p>
                )}
              </div>

              {/* Password Input Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-sm rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate Admin</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 text-[11px] font-mono text-gray-400">
          GateKeeper Control Plane • Spring Boot JWT Authenticated
        </div>

      </div>

    </div>
  );
}