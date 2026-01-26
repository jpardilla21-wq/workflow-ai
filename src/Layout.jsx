import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { Sparkles, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-slate-900">Workflow AI</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link 
                to={createPageUrl('Templates')} 
                className={`text-sm font-medium transition-colors ${
                  currentPageName === 'Templates' ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Templates
              </Link>
              <Link 
                to={createPageUrl('AIBuilder')} 
                className={`text-sm font-medium transition-colors ${
                  currentPageName === 'AIBuilder' ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                AI Builder
              </Link>
              {user && (
                <Link 
                  to={createPageUrl('MyWorkflows')} 
                  className={`text-sm font-medium transition-colors ${
                    currentPageName === 'MyWorkflows' ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  My Workflows
                </Link>
              )}
              <Link 
                to={createPageUrl('Pricing')} 
                className={`text-sm font-medium transition-colors ${
                  currentPageName === 'Pricing' ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pricing
              </Link>
            </div>

            {/* Auth Section */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                      {user.subscription_tier === 'premium' ? 'Premium' : 'Free'}
                    </div>
                    <span className="text-sm text-slate-600">{user.full_name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-6 py-4 space-y-4">
              <Link 
                to={createPageUrl('Templates')} 
                className="block text-sm font-medium text-slate-600 hover:text-slate-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Templates
              </Link>
              <Link 
                to={createPageUrl('AIBuilder')} 
                className="block text-sm font-medium text-slate-600 hover:text-slate-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                AI Builder
              </Link>
              {user && (
                <Link 
                  to={createPageUrl('MyWorkflows')} 
                  className="block text-sm font-medium text-slate-600 hover:text-slate-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Workflows
                </Link>
              )}
              <Link 
                to={createPageUrl('Pricing')} 
                className="block text-sm font-medium text-slate-600 hover:text-slate-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              {user ? (
                <Button variant="ghost" onClick={handleLogout} className="w-full">
                  Sign Out
                </Button>
              ) : (
                <Button 
                  onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="text-center text-sm text-slate-500">
            © 2024 Workflow AI. Democratizing AI automation for everyone.
          </div>
        </div>
      </footer>
    </div>
  );
}