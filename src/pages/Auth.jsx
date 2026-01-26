import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import Logo from '../components/Logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function Auth() {
  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        await base44.auth.me();
        // If authenticated, redirect to home
        window.location.href = '/';
      } catch (error) {
        // User not authenticated, show login options
        // Base44 handles the actual login UI
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-slate-200 shadow-xl">
        <CardHeader className="text-center pb-8 pt-10">
          <div className="flex justify-center mb-6">
            <Logo size="large" />
          </div>
          <CardTitle className="text-2xl">Welcome to Workflow AI</CardTitle>
          <p className="text-slate-600 mt-2">
            Sign in to start creating AI-powered automations
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pb-10">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm text-slate-500">Loading authentication...</p>
          </div>
          
          <div className="text-center text-sm text-slate-500 border-t pt-6">
            <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}