"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Headphones } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      await api.auth.login(data);
      window.location.href = '/dashboard';
    } catch (error: any) {
      setErrorMsg(error.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-24">
      {/* Left Column: Branding / Marketing */}
      <div className="hidden md:flex flex-1 flex-col space-y-6">
        <h1 className="text-4xl lg:text-5xl font-bold text-brand-dark tracking-tight leading-tight">
          Smarter support,<br />
          <span className="text-primary">Stronger relationships</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Welcome back! Please login to your Freshworks Ticket System account.
        </p>
        <div className="pt-8">
          <div className="bg-primary/5 w-64 h-64 rounded-full flex items-center justify-center relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse blur-xl"></div>
            <Headphones className="w-32 h-32 text-primary relative z-10" />
          </div>
        </div>
      </div>

      {/* Right Column: Form Card */}
      <div className="flex-1 w-full max-w-md">
        <Card className="border-none shadow-xl bg-card">
          <CardHeader className="space-y-2 text-center pb-8">
            <CardTitle className="text-2xl font-bold">Welcome Back <span role="img" aria-label="wave">👋</span></CardTitle>
            <p className="text-sm text-muted-foreground">Login to continue</p>
          </CardHeader>
          <CardContent>
            {errorMsg && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md text-center">
                {errorMsg}
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    {...register("email")}
                    className={errors.email ? "border-destructive focus-visible:ring-destructive/50" : ""}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password" 
                    {...register("password")}
                    className={errors.password ? "border-destructive focus-visible:ring-destructive/50 pr-10" : "pr-10"}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="flex justify-end pt-1">
                <Link href="#" className="text-sm text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full h-11 text-base font-semibold mt-2" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              <div className="text-center pt-6 text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary font-semibold hover:underline">
                  Register
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-xs text-muted-foreground mt-8">
          © 2024 Freshworks. All rights reserved.
        </p>
      </div>
    </div>
  );
}
