"use client";

import React, { useState } from 'react';
import { UserDTO } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProfileEditProps {
  user: UserDTO;
  onSave: (data: any) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function ProfileEdit({ user, onSave, onCancel, isSaving }: ProfileEditProps) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
    employeeId: user.employeeId || '',
    timezone: user.timezone || '(UTC-08:00) Pacific Time (US & Canada)',
    location: user.location || 'San Francisco, CA',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Profile</h1>
          <p className="text-sm text-muted-foreground">Update your personal information and contact details.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
          <div className="w-20 h-20 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple text-2xl font-bold shrink-0">
            {getInitials(user.name)}
          </div>
          <div>
            <h3 className="text-sm font-medium mb-3">Profile Photo</h3>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="h-8 border-border text-xs text-brand-purple hover:text-brand-purple">Change Photo</Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10">Remove</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">JPG, GIF or PNG. Max size of 800K</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">Full Name</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </span>
              <Input id="name" className="pl-9" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email Address</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </span>
              <Input id="email" className="pl-9" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">Phone Number</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </span>
              <Input id="phone" className="pl-9" value={formData.phoneNumber} onChange={(e) => handleChange('phoneNumber', e.target.value)} placeholder="+1 (555) 123-4567" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeId" className="text-xs font-medium text-muted-foreground">Employee ID</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </span>
              <Input id="employeeId" className="pl-9" value={formData.employeeId} onChange={(e) => handleChange('employeeId', e.target.value)} placeholder="EMP-2024-089" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Timezone</Label>
            <Select value={formData.timezone} onValueChange={(val) => handleChange('timezone', val || '')}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <SelectValue placeholder="Select Timezone" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="(UTC-08:00) Pacific Time (US & Canada)">(UTC-08:00) Pacific Time (US & Canada)</SelectItem>
                <SelectItem value="(UTC-05:00) Eastern Time (US & Canada)">(UTC-05:00) Eastern Time (US & Canada)</SelectItem>
                <SelectItem value="(UTC+00:00) London">(UTC+00:00) London</SelectItem>
                <SelectItem value="(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi">(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Location</Label>
            <Select value={formData.location} onValueChange={(val) => handleChange('location', val || '')}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <SelectValue placeholder="Select Location" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="San Francisco, CA">San Francisco, CA</SelectItem>
                <SelectItem value="New York, NY">New York, NY</SelectItem>
                <SelectItem value="London, UK">London, UK</SelectItem>
                <SelectItem value="Chennai, IN">Chennai, IN</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
          <Button className="bg-brand-purple hover:bg-brand-purple-hover text-white" onClick={() => onSave(formData)} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
