import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Shield,
  Bug,
  Leaf,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useRedirectIfAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';

const features = [
  { icon: Shield, text: '24/7 Protection Monitoring' },
  { icon: Bug, text: 'Smart Pest Detection' },
  { icon: Leaf, text: 'Eco-Friendly Solutions' },
  { icon: CheckCircle, text: 'Guaranteed Results' },
];

export const SignIn = () => {
  useRedirectIfAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.login(email, password);
      login(response.data.token);

      toast({
        title: 'Welcome back 👋',
        description: 'Successfully signed in to PestGuard.',
      });
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description:
          error.response?.data?.detail ||
          'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ================= LEFT PANEL ================= */}
      <div
        className="
          hidden lg:flex lg:w-[45%]
          bg-primary
          text-primary-foreground
          px-10 py-8
          flex-col justify-between
        "
      >
        {/* TOP CONTENT */}
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-foreground/15">
              <Bug className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold">PestGuard</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold leading-tight mb-3">
            Professional pest control management at your fingertips.
          </h1>

          {/* Description */}
          <p className="text-xl text-primary-foreground/90 mb-5">
            Protect your crops with intelligent monitoring and eco-friendly
            solutions.
          </p>

          {/* Features */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/15">
                  <feature.icon className="h-5 w-5" />
                </div>
                <span className="text-lg font-medium">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* TESTIMONIAL (gap reduced) */}
        <div className="bg-primary-foreground/15 rounded-xl p-5 mt-3">
          <p className="italic text-primary-foreground/95 text-lg">
            “PestGuard transformed how we manage pest control. Monitoring became
            effortless.”
          </p>
        </div>
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6 justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary">
              <Bug className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">PestGuard</span>
          </div>

          {/* Title */}
          <h2 className="text-4xl font-bold mb-2">Welcome back</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Sign in to access your pest control dashboard
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label className="text-base">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 text-lg"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label className="text-base">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 text-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                to="#"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full text-lg py-6"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          {/* Signup */}
          <p className="text-center text-base text-muted-foreground mt-8">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="text-primary font-medium hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
