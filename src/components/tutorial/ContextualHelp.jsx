import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Book, Video, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContextualHelp({ context, tips }) {
  const [isOpen, setIsOpen] = useState(false);

  const helpContent = {
    'ai-builder': {
      title: 'AI Builder Help',
      tips: [
        'Be specific about what you want to automate',
        'Include trigger conditions and desired outcomes',
        'Mention any specific tools or services you want to use',
        'Describe data transformations you need'
      ],
      examples: [
        'When a new Stripe payment succeeds, create a customer in Salesforce and send a welcome email',
        'Every Monday at 9am, fetch new leads from my website, score them, and post to Slack'
      ]
    },
    'workflow-deployment': {
      title: 'Deployment Guide',
      tips: [
        'Copy the JSON workflow to your clipboard',
        'Open n8n or Make platform in a new tab',
        'Use the import function to load the workflow',
        'Follow the setup guide to configure API credentials',
        'Test each node before activating'
      ],
      resources: [
        { label: 'n8n Import Guide', url: 'https://docs.n8n.io' },
        { label: 'Make Blueprint Import', url: 'https://www.make.com/en/help' }
      ]
    },
    'collaboration': {
      title: 'Collaboration Help',
      tips: [
        'Share workflows with teammates by email',
        'Set view permissions for read-only access',
        'Set edit permissions for collaborative work',
        'Admin permissions allow managing shares',
        'Real-time updates show when others are viewing'
      ]
    }
  };

  const content = helpContent[context] || helpContent['ai-builder'];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg z-40"
      >
        <HelpCircle className="w-6 h-6" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">{content.title}</h2>
                  <button onClick={() => setIsOpen(false)}>
                    <X className="w-6 h-6 text-slate-400 hover:text-slate-600" />
                  </button>
                </div>

                {/* Tips Section */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Book className="w-5 h-5 text-indigo-600" />
                      Quick Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {content.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="text-indigo-600 font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Examples Section */}
                {content.examples && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-purple-600" />
                        Examples
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {content.examples.map((example, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700">
                          "{example}"
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Resources Section */}
                {content.resources && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Video className="w-5 h-5 text-green-600" />
                        Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {content.resources.map((resource, idx) => (
                        <a
                          key={idx}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 bg-slate-50 rounded-lg text-sm text-indigo-600 hover:bg-slate-100 transition-colors"
                        >
                          {resource.label} →
                        </a>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}