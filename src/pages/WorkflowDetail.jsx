import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Copy, Check, ArrowLeft, Save, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ShareWorkflowDialog from '../components/collaboration/ShareWorkflowDialog';
import SharedUsersList from '../components/collaboration/SharedUsersList';
import RealtimeCollaborators from '../components/collaboration/RealtimeCollaborators';
import ContextualHelp from '../components/tutorial/ContextualHelp';

export default function WorkflowDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copiedJson, setCopiedJson] = useState('');
  const [notes, setNotes] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [user, setUser] = useState(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const workflowId = urlParams.get('id');

  const { data: workflow, isLoading } = useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: () => base44.entities.Workflow.filter({ id: workflowId }),
    enabled: !!workflowId,
    select: (data) => data[0]
  });

  useEffect(() => {
    if (workflow) {
      setNotes(workflow.notes || '');
    }
  }, [workflow]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  const updateNotesMutation = useMutation({
    mutationFn: (newNotes) => base44.entities.Workflow.update(workflowId, { notes: newNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', workflowId] });
    }
  });

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedJson(type);
    setTimeout(() => setCopiedJson(''), 2000);
  };

  const handleDownload = (content, filename) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveNotes = () => {
    updateNotesMutation.mutate(notes);
  };

  const getPlatformBadge = (platform) => {
    const colors = {
      'n8n': 'bg-blue-100 text-blue-800 border-blue-200',
      'make': 'bg-purple-100 text-purple-800 border-purple-200',
      'both': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[platform] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const isOwner = user && workflow && user.email === workflow.created_by;

  if (isLoading || !workflow) {
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
      <ContextualHelp context="workflow-deployment" />
      <ShareWorkflowDialog 
        workflow={workflow}
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        onShared={() => queryClient.invalidateQueries(['workflow', workflowId])}
      />
      
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-50 to-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(createPageUrl('MyWorkflows'))}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Workflows
            </Button>
            
            <div className="flex items-center gap-3">
              <RealtimeCollaborators workflowId={workflowId} />
              {isOwner && (
                <Button 
                  onClick={() => setShowShareDialog(true)}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <Badge className={`${getPlatformBadge(workflow.platform)} border`}>
                  {workflow.platform === 'both' ? 'n8n & Make' : workflow.platform}
                </Badge>
                <Badge variant="outline" className="bg-slate-50">
                  {workflow.sourceType === 'ai_generated' ? '🤖 AI Generated' : '📋 From Template'}
                </Badge>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
                {workflow.name}
              </h1>
              <p className="text-lg text-slate-600">
                {workflow.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Setup Guide */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  Complete Setup Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown>{workflow.setupGuide}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            {/* JSON Files */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">💾</span>
                  Workflow Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={workflow.platform === 'make' ? 'make' : 'n8n'}>
                  <TabsList className="mb-4">
                    {(workflow.platform === 'n8n' || workflow.platform === 'both') && (
                      <TabsTrigger value="n8n">n8n JSON</TabsTrigger>
                    )}
                    {(workflow.platform === 'make' || workflow.platform === 'both') && (
                      <TabsTrigger value="make">Make Blueprint</TabsTrigger>
                    )}
                  </TabsList>

                  {(workflow.platform === 'n8n' || workflow.platform === 'both') && (
                    <TabsContent value="n8n" className="space-y-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(workflow.n8nJson, 'n8n')}
                        >
                          {copiedJson === 'n8n' ? (
                            <><Check className="w-4 h-4 mr-2" /> Copied!</>
                          ) : (
                            <><Copy className="w-4 h-4 mr-2" /> Copy JSON</>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(workflow.n8nJson, `${workflow.name}-n8n.json`)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{workflow.n8nJson || 'No n8n JSON available'}</code>
                      </pre>
                    </TabsContent>
                  )}

                  {(workflow.platform === 'make' || workflow.platform === 'both') && (
                    <TabsContent value="make" className="space-y-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(workflow.makeJson, 'make')}
                        >
                          {copiedJson === 'make' ? (
                            <><Check className="w-4 h-4 mr-2" /> Copied!</>
                          ) : (
                            <><Copy className="w-4 h-4 mr-2" /> Copy Blueprint</>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(workflow.makeJson, `${workflow.name}-make.json`)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{workflow.makeJson || 'No Make blueprint available'}</code>
                      </pre>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Required APIs */}
            {workflow.requiredApis && workflow.requiredApis.length > 0 && (
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">Required Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {workflow.requiredApis.map((api, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                        <span>{api}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Collaboration */}
            {isOwner && (
              <SharedUsersList workflowId={workflowId} isOwner={isOwner} />
            )}

            {/* Personal Notes */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Personal Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Add your personal notes about this workflow..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[150px] text-sm"
                />
                <Button
                  onClick={handleSaveNotes}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  size="sm"
                  disabled={updateNotesMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateNotesMutation.isPending ? 'Saving...' : 'Save Notes'}
                </Button>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Workflow Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-500">Created:</span>
                  <div className="font-medium">
                    {new Date(workflow.created_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Last Updated:</span>
                  <div className="font-medium">
                    {new Date(workflow.updated_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                {workflow.isShared && (
                  <div>
                    <span className="text-slate-500">Shared with:</span>
                    <div className="font-medium">{workflow.sharedCount} user{workflow.sharedCount !== 1 ? 's' : ''}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}