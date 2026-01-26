import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Trash2, AlertCircle, Sparkles, Crown } from 'lucide-react';

export default function MyWorkflows() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.pathname);
      }
    };
    fetchUser();
  }, []);

  const { data: workflows, isLoading } = useQuery({
    queryKey: ['my-workflows'],
    queryFn: async () => {
      const userData = await base44.auth.me();
      return base44.entities.Workflow.filter({ created_by: userData.email }, '-created_date');
    },
    initialData: [],
    enabled: !!user
  });

  const deleteWorkflowMutation = useMutation({
    mutationFn: (id) => base44.entities.Workflow.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-workflows'] });
    }
  });

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to delete this workflow?')) {
      deleteWorkflowMutation.mutate(id);
    }
  };

  const getPlatformBadge = (platform) => {
    const colors = {
      'n8n': 'bg-blue-100 text-blue-800 border-blue-200',
      'make': 'bg-purple-100 text-purple-800 border-purple-200',
      'both': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[platform] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const canSaveMore = () => {
    if (!user) return false;
    if (user.subscription_tier === 'premium') return true;
    return workflows.length < 5;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <Skeleton className="h-10 w-64 mb-12" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-50 to-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                My Workflows
              </h1>
              <p className="text-lg text-slate-600">
                {workflows.length} saved workflow{workflows.length !== 1 ? 's' : ''}
              </p>
            </div>
            {user?.subscription_tier === 'premium' && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 px-4 py-2 text-sm">
                <Crown className="w-4 h-4 mr-2" />
                Premium
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        {/* Storage Warning */}
        {user && user.subscription_tier === 'free' && workflows.length >= 5 && (
          <Alert className="mb-8 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900">
              <div className="flex items-center justify-between">
                <span>
                  You've reached the <strong>5 workflow limit</strong> for free users. 
                  Delete old workflows or upgrade to save unlimited workflows.
                </span>
                <Link to={createPageUrl('Pricing')}>
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {workflows.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-3">No workflows yet</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Create your first automation using AI or choose from our template library
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={createPageUrl('AIBuilder')}>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create with AI
                </Button>
              </Link>
              <Link to={createPageUrl('Templates')}>
                <Button variant="outline">
                  Browse Templates
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map(workflow => (
              <Link key={workflow.id} to={createPageUrl('WorkflowDetail') + `?id=${workflow.id}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-slate-200 hover:border-indigo-300 relative">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Badge className={`${getPlatformBadge(workflow.platform)} border`}>
                        {workflow.platform === 'both' ? 'n8n & Make' : workflow.platform}
                      </Badge>
                      <Badge variant="outline" className="bg-slate-50">
                        {workflow.sourceType === 'ai_generated' ? '🤖 AI' : '📋 Template'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight pr-8">
                      {workflow.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {workflow.description}
                    </p>
                    <div className="text-xs text-slate-400">
                      Created {new Date(workflow.created_date).toLocaleDateString()}
                    </div>
                  </CardContent>
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(workflow.id, e)}
                    className="absolute top-4 right-4 p-2 hover:bg-red-50 rounded-lg transition-colors group"
                  >
                    <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
                  </button>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}