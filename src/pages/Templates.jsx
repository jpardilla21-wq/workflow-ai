import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const categories = [
  'All',
  'Sales',
  'Marketing',
  'Project Management',
  'Construction',
  'Customer Service',
  'Solopreneur',
  'Professional Services',
  'Education',
  'Healthcare',
  'Real Estate'
];

export default function Templates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => base44.entities.Template.list('-popularity'),
    initialData: []
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getPlatformBadge = (platform) => {
    const colors = {
      'n8n': 'bg-blue-100 text-blue-800 border-blue-200',
      'make': 'bg-purple-100 text-purple-800 border-purple-200',
      'both': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[platform] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-50 to-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Automation Templates
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Browse 300+ pre-built automation templates for n8n and Make. 
            Find the perfect workflow and deploy in minutes.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-slate-600">
          {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
        </div>

        {/* Templates Grid */}
        {isLoading ? (
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
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <Link key={template.id} to={createPageUrl('TemplateDetail') + `?id=${template.id}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-slate-200 hover:border-indigo-300">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Badge className={`${getPlatformBadge(template.platform)} border`}>
                        {template.platform === 'both' ? 'n8n & Make' : template.platform}
                      </Badge>
                      {template.popularity > 40 && (
                        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg leading-tight">{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {template.tags?.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {filteredTemplates.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No templates found</h3>
            <p className="text-slate-600 mb-6">Try adjusting your search or filters</p>
            <Link to={createPageUrl('AIBuilder')}>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Sparkles className="w-4 h-4 mr-2" />
                Create Custom with AI
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}