import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Filter,
  Search,
  Camera,
  Upload,
  X as XIcon,
  Image as ImageIcon
} from 'lucide-react';

interface Ticket {
  id: string;
  ticket_number: string;
  reporter_id: string;
  reporter_name: string;
  reporter_email: string;
  reporter_role: string;
  report_type: string;
  priority: string;
  status: string;
  subject: string;
  description: string;
  attachments: any[];
  assigned_to: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
}

interface TicketComment {
  id: string;
  ticket_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  comment: string;
  created_at: string;
}

export default function SupportTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [comments, setComments] = useState<Record<string, TicketComment[]>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    report_type: 'bug',
    priority: 'medium'
  });

  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [newComment, setNewComment] = useState('');

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachedImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      setLoading(true);

      const isAdmin = ['CHRO', 'CFO', 'MD', 'VP'].includes(user?.role || '');

      let query = supabase
        .from('tickets')
        .select('*');

      if (!isAdmin) {
        query = query.eq('reporter_id', user?.id);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('ticket_comments')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(prev => ({ ...prev, [ticketId]: data || [] }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const createTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const { data, error } = await supabase
        .from('tickets')
        .insert([
          {
            reporter_id: user?.id,
            reporter_name: user?.name,
            reporter_email: user?.email || '',
            reporter_role: user?.role,
            subject: newTicket.subject,
            description: newTicket.description,
            report_type: newTicket.report_type,
            priority: newTicket.priority,
            status: 'open',
            ticket_number: ticketNumber
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setTickets(prev => [data, ...prev]);
      setNewTicket({ subject: '', description: '', report_type: 'bug', priority: 'medium' });
      setAttachedImages([]);
      setShowCreateModal(false);
      alert('Ticket created successfully!');
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket');
    }
  };

  const addComment = async (ticketId: string) => {
    if (!newComment.trim()) return;

    try {
      const { data, error } = await supabase
        .from('ticket_comments')
        .insert([
          {
            ticket_id: ticketId,
            user_id: user?.id,
            user_name: user?.name,
            user_role: user?.role,
            comment: newComment
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setComments(prev => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), data]
      }));
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'in_progress':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'closed':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low':
        return 'bg-gray-100 text-gray-700';
      case 'medium':
        return 'bg-blue-100 text-blue-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'urgent':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const isAdmin = ['CHRO', 'CFO', 'MD', 'VP'].includes(user?.role || '');

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticketId);

      if (error) throw error;

      setTickets(prev =>
        prev.map(t => (t.id === ticketId ? { ...t, status: newStatus } : t))
      );

      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
      }

      alert('Ticket status updated successfully!');
    } catch (error) {
      console.error('Error updating ticket status:', error);
      alert('Failed to update ticket status');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600 mt-1">
            {isAdmin
              ? 'Manage and respond to all support tickets'
              : 'Manage and track your support requests'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Ticket
        </button>
      </div>

      {isAdmin && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-800">
              <strong>Admin View:</strong> You can see all tickets from all users and manage their status.
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="text-gray-600 mt-4">Loading tickets...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filterStatus !== 'all' || filterPriority !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first support ticket to get started'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedTicket(ticket);
                if (!comments[ticket.id]) {
                  fetchComments(ticket.id);
                }
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(ticket.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{ticket.subject}</h3>
                    <p className="text-sm text-gray-500">{ticket.ticket_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">{ticket.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                  {isAdmin && (
                    <span className="text-gray-700">
                      by <strong>{ticket.reporter_name}</strong> ({ticket.reporter_role})
                    </span>
                  )}
                </div>
                <span className="capitalize">{ticket.report_type}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Support Ticket</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Brief description of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Detailed description of the issue..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={newTicket.report_type}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, report_type: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="bug">Bug</option>
                    <option value="feature">Feature Request</option>
                    <option value="question">Question</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attach Screenshots/Photos <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 text-gray-700"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="text-sm font-medium">Take Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 text-gray-700"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-sm font-medium">Upload File</span>
                  </button>
                </div>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageCapture}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageCapture}
                  className="hidden"
                />

                {attachedImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {attachedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Attachment ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={createTicket}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Create Ticket
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTicket({ subject: '', description: '', report_type: 'bug', priority: 'medium' });
                  setAttachedImages([]);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedTicket.subject}</h2>
                  <p className="text-sm text-gray-500">{selectedTicket.ticket_number}</p>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                  {selectedTicket.priority}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                  {selectedTicket.status.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-500 ml-auto">
                  Created {new Date(selectedTicket.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Description</h3>
                  <div className="text-sm text-gray-600">
                    Reporter: <strong>{selectedTicket.reporter_name}</strong> ({selectedTicket.reporter_role})
                  </div>
                </div>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {isAdmin && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Admin Actions</h3>
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600">Update Status:</label>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>

                <div className="space-y-4 mb-4">
                  {(comments[selectedTicket.id] || []).map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{comment.user_name}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.comment}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addComment(selectedTicket.id);
                      }
                    }}
                  />
                  <button
                    onClick={() => addComment(selectedTicket.id)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
