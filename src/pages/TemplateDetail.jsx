import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, AlertCircle, Crown, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

export default function TemplateDetail() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const templateId = urlParams.get('id');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const { data: template, isLoading } = useQuery({
    queryKey: ['template', templateId],
    queryFn: () => base44.entities.Template.filter({ id: templateId }),
    enabled: !!templateId,
    select: (data) => data[0]
  });

  const { data: userWorkflows } = useQuery({
    queryKey: ['user-workflows-count'],
    queryFn: async () => {
      const userData = await base44.auth.me();
      return base44.entities.Workflow.filter({ created_by: userData.email });
    },
    enabled: !!user,
    initialData: []
  });

  const canSaveWorkflow = () => {
    if (!user) return false;
    if (user.subscription_tier === 'premium') return true;
    return userWorkflows.length < 5;
  };

  const handleSaveToMyWorkflows = async () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }

    if (!canSaveWorkflow()) {
      alert('You\'ve reached the 5 workflow limit for free users. Upgrade to Premium for unlimited saves.');
      return;
    }

    setSaving(true);
    try {
      const workflow = await base44.entities.Workflow.create({
        name: template.name,
        description: template.description,
        platform: template.platform,
        n8nJson: template.n8nTemplate || '',
        makeJson: template.makeTemplate || '',
        setupGuide: template.setupGuide,
        requiredApis: template.requiredApis || [],
        sourceType: 'template',
        templateId: template.id
      });

      navigate(createPageUrl('WorkflowDetail') + `?id=${workflow.id}`);
    } catch (error) {
      alert('Failed to save workflow. Please try again.');
      console.error(error);
    } finally {
      setSaving(false);
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

  if (isLoading || !template) {
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3 mb-8"></div>
            <div className="h-96 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-50 to-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('Templates'))}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <Badge className={`${getPlatformBadge(template.platform)} border`}>
                  {template.platform === 'both' ? 'n8n & Make' : template.platform}
                </Badge>
                <Badge variant="outline" className="bg-slate-50">
                  {template.category}
                </Badge>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
                {template.name}
              </h1>
              <p className="text-lg text-slate-600">
                {template.description}
              </p>
            </div>

            <Button
              onClick={handleSaveToMyWorkflows}
              disabled={saving || (user && !canSaveWorkflow())}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save to My Workflows
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        {/* Limit Warning */}
        {user && user.subscription_tier === 'free' && userWorkflows.length >= 5 && (
          <Alert className="mb-8 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900">
              <div className="flex items-center justify-between">
                <span>
                  You've reached the <strong>5 workflow limit</strong>. Delete old workflows or upgrade to save more.
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Setup Guide */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  Setup Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown>{template.setupGuide}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Required APIs */}
            {template.requiredApis && template.requiredApis.length > 0 && (
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">Required Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {template.requiredApis.map((api, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                        <span>{api}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {template.tags && template.tags.length > 0 && (
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Popularity */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Template Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-500">Popularity Score:</span>
                  <div className="font-medium text-lg">{template.popularity}/100</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}