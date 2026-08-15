"use client";

import React, { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, UserDTO } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserCog, Search, Check, AlertCircle } from 'lucide-react';
import { LoadingState } from '@/components/ui/states';

export function InviteAgentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  
  // Create New Agent State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Promote Customer State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch customers for promotion
  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers-list'],
    queryFn: () => api.users.list({ role: 'CUSTOMER' }),
    enabled: isOpen && activeTab === 'promote',
  });

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    return customers.filter(c => {
      const nameMatch = (c.name || '').toLowerCase().includes((searchQuery || '').toLowerCase());
      const emailMatch = (c.email || '').toLowerCase().includes((searchQuery || '').toLowerCase());
      return nameMatch || emailMatch;
    });
  }, [customers, searchQuery]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: () => api.users.create({ name, email, password, role: 'AGENT' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      resetAndClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to create agent');
    }
  });

  const promoteMutation = useMutation({
    mutationFn: (id: string) => api.users.update(id, { role: 'AGENT' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['customers-list'] });
      resetAndClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to promote customer');
    }
  });

  const resetAndClose = () => {
    setIsOpen(false);
    setName('');
    setEmail('');
    setPassword('');
    setErrorMsg('');
    setSearchQuery('');
    setSelectedCustomerId(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!name || !email || !password) {
      setErrorMsg('All fields are required');
      return;
    }
    createMutation.mutate();
  };

  const handlePromoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!selectedCustomerId) {
      setErrorMsg('Please select a customer to promote');
      return;
    }
    promoteMutation.mutate(selectedCustomerId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <Button className="shrink-0 gap-1.5">
          <UserCog className="w-4 h-4" />
          Invite Agent
        </Button>
      } />
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Agent</DialogTitle>
          <DialogDescription>
            Create a new agent account directly, or promote an existing customer to an agent role.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 mb-2 rounded-md bg-destructive/15 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errorMsg}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="promote">Promote Customer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create">
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input 
                  placeholder="e.g. John Doe" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  disabled={createMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input 
                  type="email" 
                  placeholder="e.g. john@freshworks.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  disabled={createMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Temporary Password</label>
                <Input 
                  type="password" 
                  placeholder="Requires uppercase, lowercase, number, and special character" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  disabled={createMutation.isPending}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Share this securely with the new agent.
                </p>
              </div>
              
              <Button type="submit" className="w-full mt-4" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating Agent...' : 'Create Agent Account'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="promote">
            <form onSubmit={handlePromoteSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Customers</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name or email..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="border border-border rounded-md overflow-hidden flex flex-col">
                <div className="bg-muted/30 px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border">
                  Select a customer to promote
                </div>
                <div className="max-h-[200px] overflow-y-auto p-1">
                  {isLoadingCustomers ? (
                    <div className="p-4 flex justify-center"><LoadingState message="Loading customers..." /></div>
                  ) : filteredCustomers.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">No customers found.</div>
                  ) : (
                    <div className="space-y-1">
                      {filteredCustomers.map(customer => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => setSelectedCustomerId(customer.id)}
                          className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-sm text-sm transition-colors ${
                            selectedCustomerId === customer.id 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted/50 text-foreground'
                          }`}
                        >
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className={`text-xs ${selectedCustomerId === customer.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                              {customer.email}
                            </div>
                          </div>
                          {selectedCustomerId === customer.id && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full mt-4" 
                disabled={!selectedCustomerId || promoteMutation.isPending}
              >
                {promoteMutation.isPending ? 'Promoting...' : 'Promote to Agent'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
