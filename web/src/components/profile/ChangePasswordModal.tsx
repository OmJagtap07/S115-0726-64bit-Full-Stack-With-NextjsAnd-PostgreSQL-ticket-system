"use client";

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export function ChangePasswordModal({ children }: { children: React.ReactElement }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  const mutation = useMutation({
    mutationFn: () => api.users.changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      setIsOpen(false);
      resetFields();
      // Optional: Add a success toast here
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to change password');
    }
  });

  const resetFields = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg('');
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) resetFields();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long');
      return;
    }

    mutation.mutate();
  };

  // Simple strength calc
  const getStrength = () => {
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    return score;
  };

  const strength = getStrength();

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger render={children} />
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Ensure your new password is at least 8 characters long and includes a mix of letters, numbers, and symbols.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 mb-2 rounded-md bg-destructive/15 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Password</label>
            <div className="relative">
              <Input 
                type={showCurrent ? "text" : "password"} 
                placeholder="Enter current password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                disabled={mutation.isPending}
                className="pr-10"
              />
              <button 
                type="button" 
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <div className="relative">
              <Input 
                type={showNew ? "text" : "password"} 
                placeholder="Enter new password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                disabled={mutation.isPending}
                className="pr-10"
              />
              <button 
                type="button" 
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {newPassword && (
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs font-medium text-muted-foreground">Password Strength</div>
                <div className="text-xs font-bold text-primary">
                  {strength < 2 ? 'Weak' : strength < 4 ? 'Fair' : 'Good'}
                </div>
              </div>
            )}
            {newPassword && (
              <div className="flex gap-1 mt-1">
                <div className={`h-1 flex-1 rounded-full ${strength >= 1 ? 'bg-primary' : 'bg-muted'}`}></div>
                <div className={`h-1 flex-1 rounded-full ${strength >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
                <div className={`h-1 flex-1 rounded-full ${strength >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
                <div className={`h-1 flex-1 rounded-full ${strength >= 4 ? 'bg-primary' : 'bg-muted'}`}></div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm New Password</label>
            <div className="relative">
              <Input 
                type={showConfirm ? "text" : "password"} 
                placeholder="Confirm new password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                disabled={mutation.isPending}
                className="pr-10"
              />
              <button 
                type="button" 
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" className="bg-brand-purple hover:bg-brand-purple-hover text-white" disabled={mutation.isPending || !currentPassword || !newPassword || !confirmPassword}>
              {mutation.isPending ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
