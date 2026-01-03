import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Bug,
  ArrowRight,
  Shield,
  Leaf,
  CheckCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRedirectIfAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';

const features = [
  { icon: Shield, text: '24/7 Protection Monitoring' },
  { icon: Bug, text: 'Smart Pest Detection' },
  { icon: Leaf, text: 'Eco-Friendly Solutions' },
  { icon: CheckCircle, text: 'Guaranteed Results' },
];

export const SignUp = () => {
  useRedirectIfAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please ensure both passwords are the same.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await authApi.register(name, email, password);
      toast({
        title: 'Account created 🎉',
        description: 'Please sign in with your new credentials.',
      });
      navigate('/signin');
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description:
          error.response?.data?.detail ||
          'Could not create account. Please try again.',
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
            Join thousands of farmers protecting their crops.
          </h1>

          {/* Description */}
          <p className="text-xl text-primary-foreground/90 mb-5">
            Get started with AI-powered pest detection and early warning system.
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
            “The early detection feature saved my entire rice crop last season.
            Highly recommended!”
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
          <h2 className="text-4xl font-bold mb-2">Create your account</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join PestGuard to protect your crops with AI
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label className="text-base">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-12 text-lg"
                  required
                />
              </div>
            </div>

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

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label className="text-base">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 h-12 text-lg"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full text-lg py-6"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          {/* Sign In */}
          <p className="text-center text-base text-muted-foreground mt-8">
            Already have an account?{' '}
            <Link
              to="/signin"
              className="text-primary font-medium hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
