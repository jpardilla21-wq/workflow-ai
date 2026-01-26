import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, AlertCircle, Crown } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';

export default function AIBuilder() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState('both');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [workflowCount, setWorkflowCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Count user's workflows
        const workflows = await base44.entities.Workflow.filter({ created_by: userData.email });
        setWorkflowCount(workflows.length);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.pathname);
      }
    };
    fetchUserData();
  }, []);

  const canGenerateWorkflow = () => {
    if (!user) return false;
    if (user.subscription_tier === 'premium') return true;
    
    // Check if it's a new month
    const lastReset = user.last_reset_date ? new Date(user.last_reset_date) : new Date(0);
    const now = new Date();
    const isNewMonth = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();
    
    const count = isNewMonth ? 0 : (user.workflows_generated_this_month || 0);
    return count < 5;
  };

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please describe your automation workflow');
      return;
    }

    if (!canGenerateWorkflow()) {
      setError('You\'ve reached your monthly limit. Upgrade to Premium for unlimited workflows.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generate workflow with AI
      const prompt = `Create a detailed automation workflow for: ${description}

Platform: ${platform === 'both' ? 'n8n and Make' : platform}

Provide:
1. A complete step-by-step setup guide including:
   - How to get each required API key/credential
   - Detailed configuration steps
   - Testing procedures
2. List of required APIs/services
3. ${platform === 'both' ? 'Both n8n JSON and Make blueprint' : platform === 'n8n' ? 'n8n JSON workflow' : 'Make blueprint'}

Be extremely detailed and practical. Include actual API documentation links where possible.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            setupGuide: { type: "string" },
            requiredApis: {
              type: "array",
              items: { type: "string" }
            },
            n8nJson: { type: "string" },
            makeJson: { type: "string" }
          }
        }
      });

      // Create workflow
      const workflow = await base44.entities.Workflow.create({
        name: result.name,
        description: description,
        platform: platform,
        n8nJson: result.n8nJson || '',
        makeJson: result.makeJson || '',
        setupGuide: result.setupGuide,
        requiredApis: result.requiredApis || [],
        sourceType: 'ai_generated'
      });

      // Update user's monthly count
      const now = new Date();
      const lastReset = user.last_reset_date ? new Date(user.last_reset_date) : new Date(0);
      const isNewMonth = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();
      
      await base44.auth.updateMe({
        workflows_generated_this_month: isNewMonth ? 1 : (user.workflows_generated_this_month || 0) + 1,
        last_reset_date: now.toISOString().split('T')[0]
      });

      // Navigate to workflow detail
      navigate(createPageUrl('WorkflowDetail') + `?id=${workflow.id}`);
    } catch (error) {
      setError('Failed to generate workflow. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const remainingWorkflows = user && user.subscription_tier === 'free' 
    ? Math.max(0, 5 - (user.workflows_generated_this_month || 0))
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            AI Workflow Builder
          </h1>
          <p className="text-lg text-slate-600">
            Describe your automation in plain English. AI will create the complete workflow.
          </p>
        </div>

        {/* Usage Indicator */}
        {user && user.subscription_tier === 'free' && (
          <Alert className="mb-8 border-indigo-200 bg-indigo-50">
            <AlertCircle className="h-4 w-4 text-indigo-600" />
            <AlertDescription className="text-indigo-900">
              <div className="flex items-center justify-between">
                <span>
                  <strong>{remainingWorkflows}</strong> of 5 free workflows remaining this month
                </span>
                <Link to={createPageUrl('Pricing')}>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {user && user.subscription_tier === 'premium' && (
          <Alert className="mb-8 border-amber-200 bg-amber-50">
            <Crown className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900">
              <strong>Premium Member</strong> - Unlimited workflow generations
            </AlertDescription>
          </Alert>
        )}

        {/* Builder Form */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle>Create Your Automation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Platform Selection */}
            <div className="space-y-3">
              <Label className="text-base">Target Platform</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={platform === 'n8n' ? 'default' : 'outline'}
                  onClick={() => setPlatform('n8n')}
                  className={`h-auto py-4 ${platform === 'n8n' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                >
                  n8n
                </Button>
                <Button
                  variant={platform === 'make' ? 'default' : 'outline'}
                  onClick={() => setPlatform('make')}
                  className={`h-auto py-4 ${platform === 'make' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                >
                  Make
                </Button>
                <Button
                  variant={platform === 'both' ? 'default' : 'outline'}
                  onClick={() => setPlatform('both')}
                  className={`h-auto py-4 ${platform === 'both' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                >
                  Both
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Label htmlFor="description" className="text-base">
                Describe Your Automation
              </Label>
              <Textarea
                id="description"
                placeholder="Example: I want to automatically qualify leads from my website form, score them based on company size and industry, then create deals in Salesforce and send personalized welcome emails..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[200px] text-base"
              />
              <p className="text-sm text-slate-500">
                Be as detailed as possible. Include triggers, actions, conditions, and desired outcomes.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={loading || !description.trim() || !canGenerateWorkflow()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Your Workflow...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Workflow
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Complete JSON</h3>
                <p className="text-sm text-slate-600">
                  Ready-to-import workflow files for your platform
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Detailed Guides</h3>
                <p className="text-sm text-slate-600">
                  Step-by-step setup with API instructions
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Production Ready</h3>
                <p className="text-sm text-slate-600">
                  Best practices and error handling included
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}