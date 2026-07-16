"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, ClipboardList } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[\W_]/, 'Must contain at least one special character'),
  role: z.enum(['customer', 'agent', 'admin'], {
    required_error: "Please select a role.",
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'agent',
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      await api.auth.register({ name: data.fullName, email: data.email, password: data.password, role: data.role.toUpperCase() });
      alert("Registration successful! Please log in.");
      router.push('/login');
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-24">
      {/* Left Column: Branding / Marketing */}
      <div className="hidden md:flex flex-1 flex-col space-y-6">
        <h1 className="text-4xl lg:text-5xl font-bold text-brand-dark tracking-tight leading-tight">
          Create your account
        </h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Join your team and start managing tickets efficiently.
        </p>
        <div className="pt-8">
          <div className="bg-primary/5 w-64 h-64 rounded-full flex items-center justify-center relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse blur-xl"></div>
            <ClipboardList className="w-32 h-32 text-primary relative z-10" />
          </div>
        </div>
      </div>

      {/* Right Column: Form Card */}
      <div className="flex-1 w-full max-w-md">
        <Card className="border-none shadow-xl bg-card">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <p className="text-sm text-muted-foreground">Fill in the details to get started</p>
          </CardHeader>
          <CardContent>
            {errorMsg && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md text-center">
                {errorMsg}
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <div className="relative">
                  <Input 
                    type="text" 
                    placeholder="Enter your full name" 
                    {...register("fullName")}
                    className={errors.fullName ? "border-destructive focus-visible:ring-destructive/50" : ""}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-destructive">{errors.fullName.message}</p>
                )}
              </div>

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

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Role</label>
                <Select 
                  onValueChange={(val) => setValue("role", val as any)}
                  defaultValue={watch("role")}
                >
                  <SelectTrigger className={errors.role ? "border-destructive focus-visible:ring-destructive/50" : ""}>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-xs text-destructive">{errors.role.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full h-11 text-base font-semibold mt-4" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Register"}
              </Button>

              <div className="text-center pt-6 text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
