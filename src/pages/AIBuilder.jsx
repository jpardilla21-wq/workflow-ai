import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, AlertCircle, Crown, Upload, Image as ImageIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import OnboardingFlow from '../components/tutorial/OnboardingFlow';
import ContextualHelp from '../components/tutorial/ContextualHelp';

export default function AIBuilder() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState('both');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [workflowCount, setWorkflowCount] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Count user's workflows
        const workflows = await base44.entities.Workflow.filter({ created_by: userData.email });
        setWorkflowCount(workflows.length);

        // Check if user needs onboarding
        const progress = await base44.entities.UserProgress.filter({ user_email: userData.email });
        if (progress.length === 0 || !progress[0].onboarding_completed) {
          setShowOnboarding(true);
        }
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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);
      setUploadedImages(prev => [...prev, ...urls]);
      setError('');
    } catch (err) {
      setError('Failed to upload images');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!description.trim() && uploadedImages.length === 0) {
      setError('Please describe your automation or upload workflow images');
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
      let prompt = `Create a detailed automation workflow for: ${description}

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
        file_urls: uploadedImages.length > 0 ? uploadedImages : undefined,
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
      {showOnboarding && user && (
        <OnboardingFlow 
          user={user} 
          onComplete={() => setShowOnboarding(false)} 
        />
      )}
      
      <ContextualHelp context="ai-builder" />
      
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

            {/* Image Upload */}
            {user?.subscription_tier === 'premium' && (
              <div className="space-y-3">
                <Label className="text-base">Upload Workflow Images (Premium)</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 mb-1">
                      Click to upload screenshots or diagrams
                    </p>
                    <p className="text-xs text-slate-500">
                      AI will analyze your images and generate the workflow
                    </p>
                  </label>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {uploadedImages.map((url, idx) => (
                      <div key={idx} className="relative">
                        <img src={url} alt={`Upload ${idx + 1}`} className="w-20 h-20 object-cover rounded border" />
                        <button
                          onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                {user?.subscription_tier === 'premium' && ' Or upload workflow images above.'}
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
              disabled={loading || (!description.trim() && uploadedImages.length === 0) || !canGenerateWorkflow()}
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