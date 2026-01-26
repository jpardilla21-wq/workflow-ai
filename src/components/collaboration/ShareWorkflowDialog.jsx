import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { Share2, Loader2, CheckCircle, UserPlus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ShareWorkflowDialog({ workflow, isOpen, onClose, onShared }) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleShare = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const user = await base44.auth.me();
      
      // Check if already shared with this user
      const existing = await base44.entities.WorkflowShare.filter({
        workflow_id: workflow.id,
        shared_with_email: email
      });

      if (existing.length > 0) {
        setError('Already shared with this user');
        setLoading(false);
        return;
      }

      // Create share
      await base44.entities.WorkflowShare.create({
        workflow_id: workflow.id,
        shared_with_email: email,
        permission: permission,
        shared_by_email: user.email
      });

      // Update workflow share count
      await base44.entities.Workflow.update(workflow.id, {
        isShared: true,
        sharedCount: (workflow.sharedCount || 0) + 1
      });

      setSuccess(true);
      setEmail('');
      setTimeout(() => {
        setSuccess(false);
        if (onShared) onShared();
      }, 2000);
    } catch (err) {
      setError('Failed to share workflow');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-600" />
            Share Workflow
          </DialogTitle>
          <DialogDescription>
            Invite team members to view or collaborate on this workflow
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900">
                Workflow shared successfully!
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="teammate@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="permission">Permission Level</Label>
            <Select value={permission} onValueChange={setPermission} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View Only - Can see the workflow</SelectItem>
                <SelectItem value="edit">Edit - Can modify the workflow</SelectItem>
                <SelectItem value="admin">Admin - Can manage sharing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleShare} 
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Share
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}