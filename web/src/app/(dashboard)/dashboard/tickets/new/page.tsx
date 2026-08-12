"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, UploadCloud, X } from 'lucide-react';
import Link from 'next/link';
import { Priority } from '@/lib/api';

import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const createTicketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
});

type CreateTicketValues = z.infer<typeof createTicketSchema> & { file?: File | null };

export default function NewTicketPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateTicketValues>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      subject: '',
      description: '',
      priority: 'MEDIUM'
    }
  });

  const priorityValue = watch('priority');

  const createMutation = useMutation({
    mutationFn: (data: CreateTicketValues) => api.tickets.create(data),
    onSuccess: (newTicket) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['summaryTickets'] });
      router.push(`/dashboard/tickets/${newTicket.id}`);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create ticket. Please try again.');
    }
  });

  const onSubmit = (data: CreateTicketValues) => {
    setError(null);
    createMutation.mutate({ ...data, file });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/tickets" className="text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-lg hover:bg-muted/50">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create New Ticket</h1>
          <p className="text-sm text-muted-foreground">Describe your issue in detail and we'll help you resolve it.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">
          
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Subject</label>
            <Input 
              placeholder="Briefly describe your issue..." 
              {...register('subject')}
              className={errors.subject ? "border-destructive" : ""}
            />
            {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Priority</label>
            <Select value={priorityValue} onValueChange={(val) => setValue('priority', val as Priority)}>
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low - General query</SelectItem>
                <SelectItem value="MEDIUM">Medium - Non-critical issue</SelectItem>
                <SelectItem value="HIGH">High - Core functionality impaired</SelectItem>
                <SelectItem value="URGENT">Urgent - System down</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Description</label>
            <textarea
              {...register('description')}
              placeholder="Please provide as much detail as possible to help us resolve your issue quickly..."
              className={`flex w-full rounded-md border ${errors.description ? 'border-destructive focus-visible:ring-destructive' : 'border-input focus-visible:ring-ring'} bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 min-h-[160px] resize-y`}
            />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex justify-between">
              <span>Attachments (Optional)</span>
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center gap-3 bg-muted/20 hover:bg-muted/40 transition-colors relative group">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
              />
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">Images, PDF, or Docs (max. 5MB)</p>
              </div>
            </div>
            
            {file && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-md border border-border mt-3">
                <span className="text-sm truncate max-w-[80%]">{file.name}</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" 
                  onClick={() => setFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border mt-8">
            <Button type="button" variant="ghost" onClick={() => router.push('/dashboard/tickets')}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending} className="min-w-[120px]">
              {createMutation.isPending ? "Creating..." : "Submit Ticket"}
            </Button>
          </div>

        </form>
      </div>

    </div>
  );
}
