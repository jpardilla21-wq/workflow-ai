import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Trash2, Shield, Eye, Edit } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SharedUsersList({ workflowId, isOwner }) {
  const queryClient = useQueryClient();

  const { data: shares, isLoading } = useQuery({
    queryKey: ['workflow-shares', workflowId],
    queryFn: () => base44.entities.WorkflowShare.filter({ workflow_id: workflowId })
  });

  const removeShareMutation = useMutation({
    mutationFn: (shareId) => base44.entities.WorkflowShare.delete(shareId),
    onSuccess: () => {
      queryClient.invalidateQueries(['workflow-shares', workflowId]);
    }
  });

  const getPermissionIcon = (permission) => {
    switch(permission) {
      case 'view': return <Eye className="w-4 h-4" />;
      case 'edit': return <Edit className="w-4 h-4" />;
      case 'admin': return <Shield className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getPermissionColor = (permission) => {
    switch(permission) {
      case 'view': return 'bg-slate-100 text-slate-700';
      case 'edit': return 'bg-blue-100 text-blue-700';
      case 'admin': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Shared With
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!shares || shares.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Shared With
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Not shared with anyone yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5" />
          Shared With ({shares.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {shares.map((share) => (
          <div key={share.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{share.shared_with_email}</p>
              <Badge className={`mt-1 text-xs ${getPermissionColor(share.permission)}`}>
                {getPermissionIcon(share.permission)}
                <span className="ml-1">{share.permission}</span>
              </Badge>
            </div>
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeShareMutation.mutate(share.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}