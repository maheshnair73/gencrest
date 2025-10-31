import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, Save, X, Search, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface TechDoc {
  id: string;
  module_name: string;
  category: string;
  description: string;
  tech_stack: string[];
  implementation_details: string;
  database_schema: Record<string, any>;
  api_endpoints: Array<{ method: string; path: string; description: string }>;
  dependencies: string[];
  security_notes: string;
  last_updated: string;
  updated_by: string;
  version: string;
  status: 'Active' | 'Deprecated' | 'In Development';
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  'Database',
  'Frontend',
  'API',
  'Authentication',
  'Reports',
  'Liquidation',
  'Work Plan',
  'User Management',
  'Mobile App',
  'Infrastructure',
  'Security',
  'Integration'
];

const STATUS_OPTIONS = ['Active', 'Deprecated', 'In Development'];

export const TechnicalDocumentation: React.FC = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<TechDoc[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<TechDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('Active');
  const [isEditing, setIsEditing] = useState(false);
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());
  const [editingDoc, setEditingDoc] = useState<Partial<TechDoc>>({
    module_name: '',
    category: 'Frontend',
    description: '',
    tech_stack: [],
    implementation_details: '',
    database_schema: {},
    api_endpoints: [],
    dependencies: [],
    security_notes: '',
    version: '1.0.0',
    status: 'Active',
    updated_by: user?.name || 'Admin'
  });

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchDocumentation();
    }
  }, [user]);

  useEffect(() => {
    filterDocumentation();
  }, [docs, searchQuery, selectedCategory, selectedStatus]);

  const fetchDocumentation = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('technical_documentation')
        .select('*')
        .order('last_updated', { ascending: false });

      if (error) throw error;
      setDocs(data || []);
    } catch (error) {
      console.error('Error fetching documentation:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDocumentation = () => {
    let filtered = [...docs];

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    if (selectedStatus !== 'All') {
      filtered = filtered.filter(doc => doc.status === selectedStatus);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.module_name.toLowerCase().includes(query) ||
        doc.description.toLowerCase().includes(query) ||
        doc.implementation_details?.toLowerCase().includes(query)
      );
    }

    setFilteredDocs(filtered);
  };

  const handleSave = async () => {
    try {
      const docData = {
        ...editingDoc,
        last_updated: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updated_by: user?.name || 'Admin'
      };

      if (editingDoc.id) {
        const { error } = await supabase
          .from('technical_documentation')
          .update(docData)
          .eq('id', editingDoc.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('technical_documentation')
          .insert([docData]);

        if (error) throw error;
      }

      setIsEditing(false);
      setEditingDoc({
        module_name: '',
        category: 'Frontend',
        description: '',
        tech_stack: [],
        implementation_details: '',
        database_schema: {},
        api_endpoints: [],
        dependencies: [],
        security_notes: '',
        version: '1.0.0',
        status: 'Active',
        updated_by: user?.name || 'Admin'
      });
      fetchDocumentation();
    } catch (error) {
      console.error('Error saving documentation:', error);
      alert('Error saving documentation');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this documentation entry?')) return;

    try {
      const { error } = await supabase
        .from('technical_documentation')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchDocumentation();
    } catch (error) {
      console.error('Error deleting documentation:', error);
      alert('Error deleting documentation');
    }
  };

  const handleEdit = (doc: TechDoc) => {
    setEditingDoc(doc);
    setIsEditing(true);
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedDocs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedDocs(newExpanded);
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-semibold">Access Denied</p>
          <p className="text-red-600 text-sm mt-2">Only Admin users can access technical documentation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              Technical Documentation
            </h1>
            <p className="text-gray-600 mt-1">System technical audit documentation</p>
          </div>
          <button
            onClick={() => {
              setEditingDoc({
                module_name: '',
                category: 'Frontend',
                description: '',
                tech_stack: [],
                implementation_details: '',
                database_schema: {},
                api_endpoints: [],
                dependencies: [],
                security_notes: '',
                version: '1.0.0',
                status: 'Active',
                updated_by: user?.name || 'Admin'
              });
              setIsEditing(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Documentation
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingDoc.id ? 'Edit Documentation' : 'New Documentation'}
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Module Name *</label>
                  <input
                    type="text"
                    value={editingDoc.module_name}
                    onChange={(e) => setEditingDoc({ ...editingDoc, module_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Reports Module"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={editingDoc.category}
                    onChange={(e) => setEditingDoc({ ...editingDoc, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
                  <input
                    type="text"
                    value={editingDoc.version}
                    onChange={(e) => setEditingDoc({ ...editingDoc, version: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="1.0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={editingDoc.status}
                    onChange={(e) => setEditingDoc({ ...editingDoc, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={editingDoc.description}
                  onChange={(e) => setEditingDoc({ ...editingDoc, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief overview of the module..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Implementation Details</label>
                <textarea
                  value={editingDoc.implementation_details}
                  onChange={(e) => setEditingDoc({ ...editingDoc, implementation_details: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Detailed technical implementation..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  value={Array.isArray(editingDoc.tech_stack) ? editingDoc.tech_stack.join(', ') : ''}
                  onChange={(e) => setEditingDoc({ ...editingDoc, tech_stack: e.target.value.split(',').map(s => s.trim()) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="React, TypeScript, Supabase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dependencies (comma-separated)</label>
                <input
                  type="text"
                  value={Array.isArray(editingDoc.dependencies) ? editingDoc.dependencies.join(', ') : ''}
                  onChange={(e) => setEditingDoc({ ...editingDoc, dependencies: e.target.value.split(',').map(s => s.trim()) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="@supabase/supabase-js, react-router-dom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Database Schema (JSON)</label>
                <textarea
                  value={typeof editingDoc.database_schema === 'object' ? JSON.stringify(editingDoc.database_schema, null, 2) : '{}'}
                  onChange={(e) => {
                    try {
                      setEditingDoc({ ...editingDoc, database_schema: JSON.parse(e.target.value) });
                    } catch (err) {
                      setEditingDoc({ ...editingDoc, database_schema: {} });
                    }
                  }}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder='{"table_name": {"fields": ["field1", "field2"]}}'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Endpoints (JSON)</label>
                <textarea
                  value={Array.isArray(editingDoc.api_endpoints) ? JSON.stringify(editingDoc.api_endpoints, null, 2) : '[]'}
                  onChange={(e) => {
                    try {
                      setEditingDoc({ ...editingDoc, api_endpoints: JSON.parse(e.target.value) });
                    } catch (err) {
                      setEditingDoc({ ...editingDoc, api_endpoints: [] });
                    }
                  }}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder='[{"method": "GET", "path": "/api/reports", "description": "Fetch reports"}]'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Security Notes</label>
                <textarea
                  value={editingDoc.security_notes}
                  onChange={(e) => setEditingDoc({ ...editingDoc, security_notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Security considerations, RLS policies, authentication requirements..."
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!editingDoc.module_name || !editingDoc.description}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Save Documentation
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading documentation...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No documentation found</p>
          <p className="text-gray-400 text-sm mt-2">Add your first documentation entry to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocs.map(doc => (
            <div key={doc.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => toggleExpand(doc.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedDocs.has(doc.id) ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>
                      <h3 className="text-xl font-bold text-gray-900">{doc.module_name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        doc.status === 'Active' ? 'bg-green-100 text-green-800' :
                        doc.status === 'Deprecated' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {doc.status}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {doc.category}
                      </span>
                      <span className="text-xs text-gray-500">v{doc.version}</span>
                    </div>
                    <p className="text-gray-600">{doc.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>Updated by: {doc.updated_by}</span>
                      <span>•</span>
                      <span>{new Date(doc.last_updated).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(doc)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expandedDocs.has(doc.id) && (
                  <div className="mt-6 space-y-6 border-t border-gray-200 pt-6">
                    {doc.implementation_details && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Implementation Details</h4>
                        <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                          {doc.implementation_details}
                        </pre>
                      </div>
                    )}

                    {doc.tech_stack && doc.tech_stack.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Tech Stack</h4>
                        <div className="flex flex-wrap gap-2">
                          {doc.tech_stack.map((tech, idx) => (
                            <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {doc.database_schema && Object.keys(doc.database_schema).length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Database Schema</h4>
                        <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                          {JSON.stringify(doc.database_schema, null, 2)}
                        </pre>
                      </div>
                    )}

                    {doc.api_endpoints && doc.api_endpoints.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">API Endpoints</h4>
                        <div className="space-y-2">
                          {doc.api_endpoints.map((endpoint, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded text-xs font-mono font-semibold ${
                                  endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                                  endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                                  endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {endpoint.method}
                                </span>
                                <code className="text-sm font-mono">{endpoint.path}</code>
                              </div>
                              {endpoint.description && (
                                <p className="text-sm text-gray-600 mt-2">{endpoint.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {doc.dependencies && doc.dependencies.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Dependencies</h4>
                        <div className="flex flex-wrap gap-2">
                          {doc.dependencies.map((dep, idx) => (
                            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm font-mono">
                              {dep}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {doc.security_notes && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Security Notes</h4>
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{doc.security_notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
