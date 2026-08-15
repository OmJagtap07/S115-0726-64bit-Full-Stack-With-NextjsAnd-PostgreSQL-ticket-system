"use client";

import React from 'react';
import { UserDTO } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ChangePasswordModal } from './ChangePasswordModal';
import { Switch } from '@/components/ui/switch';
import { 
  User, Mail, Phone, Hash, Clock, MapPin, 
  Briefcase, ShieldCheck, LogOut, FileText, 
  CheckCircle2, Circle, AlertCircle 
} from 'lucide-react';

interface ProfileViewProps {
  user: UserDTO;
  onEdit: () => void;
}

export function ProfileView({ user, onEdit }: ProfileViewProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'January 2024';
    const d = new Date(date);
    return `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your personal information and account preferences</p>
        </div>
        <Button onClick={onEdit} className="bg-brand-purple hover:bg-brand-purple-hover text-white flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          Edit Profile
        </Button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Left Column */}
        <div className="w-full xl:w-1/3 flex flex-col gap-6">
          <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center text-center shadow-sm relative">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple text-3xl font-bold">
                {getInitials(user.name)}
              </div>
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground capitalize mt-1">
              {user.role.toLowerCase()} • Customer Support
            </p>
            <div className="text-xs text-muted-foreground mt-4 py-1.5 px-3 bg-muted rounded-full">
              Member since {formatDate(user.createdAt)}
            </div>

            {user.role === 'AGENT' && (
              <div className="grid grid-cols-2 gap-4 w-full mt-8 pt-6 border-t border-border text-left">
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Tickets Handled</div>
                  <div className="text-xl font-bold">48</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Resolved</div>
                  <div className="text-xl font-bold text-green-500">36</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Open</div>
                  <div className="text-xl font-bold text-orange-500">8</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Avg Response</div>
                  <div className="text-xl font-bold">12 min</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full xl:w-2/3 flex flex-col gap-6">
          
          {/* Personal Information */}
          <div className="bg-card border border-border rounded-xl shadow-sm">
            <div className="p-6 flex justify-between items-center border-b border-border">
              <h3 className="font-semibold">Personal Information</h3>
              <button onClick={onEdit} className="text-sm font-medium text-brand-purple hover:underline">Edit</button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <User className="w-3.5 h-3.5" /> Full Name
                </div>
                <div className="text-sm font-medium">{user.name}</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </div>
                <div className="text-sm font-medium">{user.email}</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Phone className="w-3.5 h-3.5" /> Phone Number
                </div>
                <div className="text-sm font-medium">{user.phoneNumber || '+1 (555) 123-4567'}</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Hash className="w-3.5 h-3.5" /> Employee ID
                </div>
                <div className="text-sm font-medium">{user.employeeId || 'EMP-2024-089'}</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Clock className="w-3.5 h-3.5" /> Timezone
                </div>
                <div className="text-sm font-medium">{user.timezone || '(UTC-08:00) Pacific Time (US & Canada)'}</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <MapPin className="w-3.5 h-3.5" /> Location
                </div>
                <div className="text-sm font-medium">{user.location || 'San Francisco, CA'}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Work Information */}
            <div className="bg-card border border-border rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 font-semibold mb-6">
                <Briefcase className="w-4 h-4 text-muted-foreground" /> Work Information
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-medium">Customer Support</span>
                </div>
                <div className="w-full h-px bg-border"></div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Role</span>
                  <span className="font-medium capitalize">{user.role.toLowerCase()} L1</span>
                </div>
                <div className="w-full h-px bg-border"></div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Manager</span>
                  <span className="font-medium text-brand-purple">Admin User</span>
                </div>
                <div className="w-full h-px bg-border"></div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Joined</span>
                  <span className="font-medium">{formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-card border border-border rounded-xl shadow-sm p-6">
              <div className="font-semibold mb-6">Notifications</div>
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">Email Notifications</div>
                    <div className="text-[10px] text-muted-foreground">Receive daily summaries</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">Ticket Assignments</div>
                    <div className="text-[10px] text-muted-foreground">When assigned to</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">Customer Replies</div>
                    <div className="text-[10px] text-muted-foreground">Alerts for new messages</div>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-card border border-border rounded-xl shadow-sm p-6">
              <div className="font-semibold mb-6">Security</div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <div className="font-medium">Password</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Last changed 3 months ago</div>
                  </div>
                  <ChangePasswordModal>
                    <button className="text-brand-purple font-medium text-xs hover:underline">Update</button>
                  </ChangePasswordModal>
                </div>
                <div className="w-full h-px bg-border"></div>
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <div className="font-medium">Two-Factor Auth</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Enabled via Authenticator</div>
                  </div>
                  <button className="text-brand-purple font-medium text-xs hover:underline">Manage</button>
                </div>
                <div className="w-full h-px bg-border"></div>
                <div className="flex justify-between items-center text-sm mt-4">
                  <div>
                    <div className="font-medium text-destructive">Logout All Devices</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">End all active sessions</div>
                  </div>
                  <button className="text-destructive font-medium"><LogOut className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
