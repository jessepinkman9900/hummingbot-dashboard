'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAddAccount } from '@/lib/hooks/useAccountsQuery';
import { toast } from 'sonner';

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAccountDialog({ open, onOpenChange }: AddAccountDialogProps) {
  const addAccountMutation = useAddAccount();
  const [accountName, setAccountName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountName.trim()) {
      toast.error('Please enter an account name');
      return;
    }

    // Validate account name format
    if (!/^[a-zA-Z0-9_-]+$/.test(accountName)) {
      toast.error('Account name can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    if (accountName.length < 3) {
      toast.error('Account name must be at least 3 characters long');
      return;
    }

    if (accountName.length > 50) {
      toast.error('Account name must be less than 50 characters');
      return;
    }

    try {
      await addAccountMutation.mutateAsync(accountName.trim());
      setAccountName('');
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Failed to create account:', error);
    }
  };

  const handleClose = () => {
    if (!addAccountMutation.isPending) {
      setAccountName('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Portfolio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-name">Portfolio Name</Label>
            <Input
              id="account-name"
              placeholder="Enter portfolio name (e.g., my-binance-account)"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              disabled={addAccountMutation.isPending}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Use only letters, numbers, underscores, and hyphens. 3-50 characters.
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addAccountMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!accountName.trim() || addAccountMutation.isPending}
            >
              {addAccountMutation.isPending ? 'Creating...' : 'Create Portfolio'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}