'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  MailOpen, 
  Mail, 
  CheckCircle, 
  Reply, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  MessageSquare,
  X
} from 'lucide-react';

// ===================== TYPES =====================
interface Feedback {
  id: string;
  patientName: string;
  email: string;
  rating: number;
  comment: string;
  platform: 'Google' | 'Yelp' | 'Facebook' | 'Direct';
  status: 'new' | 'read' | 'replied' | 'resolved';
  date: string;
  sentiment: 'negative' | 'neutral' | 'positive';
}

// ===================== MOCK DATA =====================
const MOCK_FEEDBACK: Feedback[] = [
  {
    id: '1',
    patientName: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    rating: 2,
    comment: 'Wait time was too long and the front desk staff seemed overwhelmed. The doctor was great though.',
    platform: 'Google',
    status: 'new',
    date: '2026-06-03T14:30:00',
    sentiment: 'negative'
  },
  {
    id: '2',
    patientName: 'Mike Chen',
    email: 'mchen@email.com',
    rating: 5,
    comment: 'Best dental experience ever! Dr. Smith and the team were incredibly professional and gentle.',
    platform: 'Yelp',
    status: 'read',
    date: '2026-06-03T10:15:00',
    sentiment: 'positive'
  },
  {
    id: '3',
    patientName: 'Emily Davis',
    email: 'emily.d@email.com',
    rating: 1,
    comment: "I was charged for a service I didn't receive. Very frustrated with the billing process.",
    platform: 'Google',
    status: 'replied',
    date: '2026-06-02T16:45:00',
    sentiment: 'negative'
  },
  {
    id: '4',
    patientName: 'Robert Wilson',
    email: 'rwilson@email.com',
    rating: 4,
    comment: 'Good service overall. Parking was a bit difficult but the treatment was worth it.',
    platform: 'Facebook',
    status: 'resolved',
    date: '2026-06-01T09:20:00',
    sentiment: 'neutral'
  },
  {
    id: '5',
    patientName: 'Lisa Anderson',
    email: 'lisa.a@email.com',
    rating: 3,
    comment: 'Average experience. Nothing particularly good or bad to mention.',
    platform: 'Direct',
    status: 'new',
    date: '2026-06-03T11:00:00',
    sentiment: 'neutral'
  }
];

// ===================== COMPONENTS =====================

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
};

const StatusBadge = ({ status }: { status: Feedback['status'] }) => {
  const styles = {
    new: 'bg-blue-50 text-blue-700 border-blue-200',
    read: 'bg-gray-50 text-gray-700 border-gray-200',
    replied: 'bg-purple-50 text-purple-700 border-purple-200',
    resolved: 'bg-green-50 text-green-700 border-green-200'
  };

  const icons = {
    new: Mail,
    read: MailOpen,
    replied: Reply,
    resolved: CheckCircle
  };

  const Icon = icons[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      <Icon size={12} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const SentimentBadge = ({ sentiment }: { sentiment: Feedback['sentiment'] }) => {
  const styles = {
    negative: 'bg-red-50 text-red-700',
    neutral: 'bg-yellow-50 text-yellow-700',
    positive: 'bg-green-50 text-green-700'
  };

  return (
    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${styles[sentiment]}`}>
      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
    </span>
  );
};

// ===================== MAIN PAGE =====================

export default function FeedbackInbox() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>(MOCK_FEEDBACK);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [showReplyForm, setShowReplyForm] = useState<string | null>(null);

  const quickTemplates = [
    "Thank you for your feedback. We sincerely apologize for the inconvenience and are looking into this matter.",
    "We're so glad you had a positive experience! Thank you for choosing us.",
    "We appreciate your feedback and would love to discuss this further. Please contact our office directly."
  ];

  const filteredFeedback = useMemo(() => {
    return feedbackList.filter((item) => {
      const matchesSearch = 
        item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesRating = ratingFilter === 'all' || item.rating.toString() === ratingFilter;

      return matchesSearch && matchesStatus && matchesRating;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [feedbackList, searchQuery, statusFilter, ratingFilter]);

  const stats = {
    total: feedbackList.length,
    new: feedbackList.filter(f => f.status === 'new').length,
    negative: feedbackList.filter(f => f.sentiment === 'negative').length,
    resolved: feedbackList.filter(f => f.status === 'resolved').length
  };

  const updateStatus = (id: string, newStatus: Feedback['status']) => {
    setFeedbackList(prev => prev.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ));
    if (newStatus !== 'replied') {
      setShowReplyForm(null);
    }
  };

  const handleReply = (id: string) => {
    console.log(`Reply draft saved for feedback ${id}:`, replyDraft[id]);
    updateStatus(id, 'replied');
    setReplyDraft(prev => ({ ...prev, [id]: '' }));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Feedback Inbox</h1>
          <p className="text-gray-600">Manage and respond to patient reviews across all platforms.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MessageSquare className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Feedback</p>
                <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
              </div>
              <Mail className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Needs Attention</p>
                <p className="text-2xl font-bold text-red-600">{stats.negative}</p>
              </div>
              <Star className="text-red-500 fill-red-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by patient name, email, or keyword..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <select
                  className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="resolved">Resolved</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
              <div className="relative">
                <select
                  className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                >
                  <option value="all">All Ratings</option>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
                <Star className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-3">
          {filteredFeedback.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <MessageSquare className="mx-auto text-gray-300 mb-3" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No feedback found</h3>
              <p className="text-gray-500">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            filteredFeedback.map((feedback) => (
              <div 
                key={feedback.id} 
                className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
                  feedback.status === 'new' ? 'border-blue-300 shadow-md' : 'border-gray-200 shadow-sm'
                }`}
              >
                {/* Main Row */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(expandedId === feedback.id ? null : feedback.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shrink-0">
                        {feedback.patientName.split(' ').map(n => n[0]).join('')}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{feedback.patientName}</h3>
                          <StatusBadge status={feedback.status} />
                          <SentimentBadge sentiment={feedback.sentiment} />
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(feedback.date)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <StarRating rating={feedback.rating} />
                          <span className="text-xs text-gray-400">via {feedback.platform}</span>
                        </div>

                        <p className="text-gray-700 text-sm line-clamp-2">{feedback.comment}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {feedback.status === 'new' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(feedback.id, 'read');
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <MailOpen size={18} />
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                        {expandedId === feedback.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Detail */}
                {expandedId === feedback.id && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                    <div className="ml-14">
                      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                        <p className="text-gray-800 leading-relaxed">{feedback.comment}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        {feedback.status !== 'resolved' && (
                          <button
                            onClick={() => updateStatus(feedback.id, 'resolved')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            <CheckCircle size={16} />
                            Mark Resolved
                          </button>
                        )}

                        {feedback.status !== 'replied' && (
                          <button
                            onClick={() => setShowReplyForm(showReplyForm === feedback.id ? null : feedback.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            <Reply size={16} />
                            {showReplyForm === feedback.id ? 'Cancel Reply' : 'Draft Reply'}
                          </button>
                        )}

                        <button
                          onClick={() => updateStatus(feedback.id, 'read')}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          <MailOpen size={16} />
                          Mark as Read
                        </button>
                      </div>

                      {showReplyForm === feedback.id && (
                        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Draft Reply</h4>
                            <button 
                              onClick={() => setShowReplyForm(null)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X size={16} />
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {quickTemplates.map((template, idx) => (
                              <button
                                key={idx}
                                onClick={() => setReplyDraft(prev => ({ ...prev, [feedback.id]: template }))}
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs hover:bg-gray-200 transition-colors text-left"
                              >
                                Template {idx + 1}
                              </button>
                            ))}
                          </div>

                          <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
                            rows={4}
                            placeholder="Write your response here..."
                            value={replyDraft[feedback.id] || ''}
                            onChange={(e) => setReplyDraft(prev => ({ ...prev, [feedback.id]: e.target.value }))}
                          />

                          <div className="flex justify-between items-center mt-3">
                            <p className="text-xs text-gray-500">
                              This will be saved as a draft. Direct platform reply coming soon.
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setReplyDraft(prev => ({ ...prev, [feedback.id]: '' }))}
                                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                Clear
                              </button>
                              <button
                                onClick={() => handleReply(feedback.id)}
                                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                Save Draft
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail size={14} />
                          {feedback.email}
                        </span>
                        <span>Platform: {feedback.platform}</span>
                        <span>Review ID: {feedback.id}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
