'use client';

import React, { useState } from 'react';
import {
  MessageSquarePlus,
  Ticket,
  Bug,
  Lightbulb,
  HelpCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Paperclip,
  MessageSquare,
} from 'lucide-react';

// ===================== TYPES =====================
type TicketType = 'bug' | 'feature' | 'question' | 'other';
type TicketStatus = 'submitted' | 'processing' | 'resolved' | 'closed';
type Priority = 'urgent' | 'high' | 'medium' | 'low';

interface TicketItem {
  id: string;
  title: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  replies: Reply[];
}

interface Reply {
  id: string;
  from: 'user' | 'team';
  author: string;
  content: string;
  createdAt: string;
}

// ===================== MOCK DATA =====================
const MOCK_TICKETS: TicketItem[] = [
  {
    id: 'T-001',
    title: 'CSV import shows garbled Chinese characters',
    description: 'After uploading the CSV file, Chinese characters in patient names display as question marks. The file is UTF-8 encoded, but the import seems to use ASCII. Please support UTF-8 with BOM or auto-detect encoding.',
    type: 'bug',
    status: 'processing',
    priority: 'high',
    createdAt: '2026-06-02T10:30:00',
    updatedAt: '2026-06-03T14:20:00',
    replies: [
      {
        id: 'R-1',
        from: 'team',
        author: 'ReviewFlow Support',
        content: 'Thanks for reporting! We have reproduced this issue. The backend was defaulting to ASCII encoding when reading CSV files. We plan to fix this in Friday's update by adding UTF-8 auto-detection.',
        createdAt: '2026-06-03T14:20:00'
      }
    ]
  },
  {
    id: 'T-002',
    title: 'Request WeChat notification channel',
    description: 'Our clinic staff use WeChat heavily. It would be great if negative review alerts and weekly reports could also be pushed to WeChat Work or a WeChat group bot.',
    type: 'feature',
    status: 'submitted',
    priority: 'medium',
    createdAt: '2026-06-03T09:15:00',
    updatedAt: '2026-06-03T09:15:00',
    replies: []
  },
  {
    id: 'T-003',
    title: 'Dashboard trend chart data is incorrect',
    description: 'The rating trend chart on the Dashboard shows an average of 4.2 stars last week, but manual calculation should be 3.8 stars. Suspect there is a bug in the aggregation logic.',
    type: 'bug',
    status: 'resolved',
    priority: 'urgent',
    createdAt: '2026-05-28T16:00:00',
    updatedAt: '2026-06-01T11:00:00',
    replies: [
      {
        id: 'R-2',
        from: 'team',
        author: 'ReviewFlow Support',
        content: 'Confirmed: this was caused by a timezone conversion error at date boundaries. Fixed in v1.2.1. Please refresh the page to see the corrected data.',
        createdAt: '2026-06-01T11:00:00'
      },
      {
        id: 'R-3',
        from: 'user',
        author: 'Clinic Admin',
        content: 'Verified, the data is now correct. Thank you!',
        createdAt: '2026-06-01T13:30:00'
      }
    ]
  }
];

const SUPPORT_EMAIL = 'dengxiaofeng880914@gmail.com';
const FORMSUBMIT_URL = `https://formsubmit.co/ajax/${SUPPORT_EMAIL}`;

// ===================== COMPONENTS =====================

const TypeBadge = ({ type }: { type: TicketType }) => {
  const config = {
    bug: { icon: Bug, label: 'Bug', color: 'bg-red-50 text-red-700 border-red-200' },
    feature: { icon: Lightbulb, label: 'Feature', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    question: { icon: HelpCircle, label: 'Question', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    other: { icon: MessageSquare, label: 'Other', color: 'bg-gray-50 text-gray-700 border-gray-200' }
  };
  const { icon: Icon, label, color } = config[type];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
      <Icon size={12} />
      {label}
    </span>
  );
};

const StatusBadge = ({ status }: { status: TicketStatus }) => {
  const config = {
    submitted: { icon: Send, label: 'Submitted', color: 'bg-gray-50 text-gray-700 border-gray-200' },
    processing: { icon: Loader2, label: 'Processing', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    resolved: { icon: CheckCircle2, label: 'Resolved', color: 'bg-green-50 text-green-700 border-green-200' },
    closed: { icon: XCircle, label: 'Closed', color: 'bg-gray-50 text-gray-500 border-gray-200' }
  };
  const { icon: Icon, label, color } = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
      <Icon size={12} className={status === 'processing' ? 'animate-spin' : ''} />
      {label}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const config = {
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
    medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    low: { label: 'Low', color: 'bg-green-100 text-green-800' }
  };
  const { label, color } = config[priority];
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
};

// ===================== MAIN PAGE =====================

export default function SupportTickets() {
  const [tickets, setTickets] = useState<TicketItem[]>(MOCK_TICKETS);
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<TicketType>('bug');
  const [formPriority, setFormPriority] = useState<Priority>('medium');
  const [formDesc, setFormDesc] = useState('');

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const stats = {
    total: tickets.length,
    processing: tickets.filter((t) => t.status === 'processing').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    urgent: tickets.filter((t) => t.priority === 'urgent' && t.status !== 'resolved' && t.status !== 'closed').length
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim()) return;

    setIsSubmitting(true);
    setSubmitError('');

    const ticketId = `T-${String(tickets.length + 1).padStart(3, '0')}`;
    const subject = `[ReviewFlow Support] [${formType.toUpperCase()}] ${formTitle}`;
    const messageBody = `Ticket ID: ${ticketId}\nType: ${formType}\nPriority: ${formPriority}\n\nDescription:\n${formDesc}`;

    try {
      const response = await fetch(FORMSUBMIT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: 'ReviewFlow Clinic User',
          email: 'noreply@reviewflow.com',
          subject: subject,
          message: messageBody
        })
      });

      if (!response.ok) throw new Error('FormSubmit failed');

      const newTicket: TicketItem = {
        id: ticketId,
        title: formTitle,
        description: formDesc,
        type: formType,
        status: 'submitted',
        priority: formPriority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replies: []
      };

      setTickets((prev) => [newTicket, ...prev]);
      setFormTitle('');
      setFormDesc('');
      setFormType('bug');
      setFormPriority('medium');
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      const mailtoLink = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageBody)}`;
      window.open(mailtoLink, '_blank');
      setSubmitError('Auto-send failed. Please send via your email client (we have pre-filled the content).');
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Support & Feedback</h1>
            <p className="text-gray-600">Found a bug or have an idea? Submit a ticket and we will get back to you.</p>
          </div>
          <button
            onClick={() => {
              setShowModal(true);
              setSubmitError('');
              setSubmitSuccess(false);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <MessageSquarePlus size={18} />
            Submit Ticket
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Ticket className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
              </div>
              <Loader2 className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle2 className="text-green-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgent Pending</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
              <AlertTriangle className="text-red-500" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search ticket title, ID, or keywords..."
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
                  <option value="submitted">Submitted</option>
                  <option value="processing">Processing</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
              <div className="relative">
                <select
                  className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="bug">Bug</option>
                  <option value="feature">Feature</option>
                  <option value="question">Question</option>
                  <option value="other">Other</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Ticket className="mx-auto text-gray-300 mb-3" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No tickets yet</h3>
              <p className="text-gray-500 mb-4">Have a question or found an issue? We are here to help.</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <MessageSquarePlus size={16} />
                Submit your first ticket
              </button>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
                  ticket.status === 'submitted' ? 'border-blue-300 shadow-md' : 'border-gray-200 shadow-sm'
                }`}
              >
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        ticket.type === 'bug' ? 'bg-red-100 text-red-600' :
                        ticket.type === 'feature' ? 'bg-amber-100 text-amber-600' :
                        ticket.type === 'question' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {ticket.type === 'bug' && <Bug size={20} />}
                        {ticket.type === 'feature' && <Lightbulb size={20} />}
                        {ticket.type === 'question' && <HelpCircle size={20} />}
                        {ticket.type === 'other' && <MessageSquare size={20} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-mono text-gray-400">{ticket.id}</span>
                          <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                          <TypeBadge type={ticket.type} />
                          <StatusBadge status={ticket.status} />
                          <PriorityBadge priority={ticket.priority} />
                        </div>

                        <p className="text-gray-600 text-sm line-clamp-1 mb-1">{ticket.description}</p>

                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Submitted {formatDate(ticket.createdAt)}
                          </span>
                          <span>Updated {formatDate(ticket.updatedAt)}</span>
                          {ticket.replies.length > 0 && (
                            <span className="flex items-center gap-1 text-blue-600">
                              <MessageSquare size={12} />
                              {ticket.replies.length} {ticket.replies.length === 1 ? 'reply' : 'replies'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                        {expandedId === ticket.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {expandedId === ticket.id && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                    <div className="ml-14">
                      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
                        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                      </div>

                      {ticket.replies.length > 0 && (
                        <div className="space-y-3 mb-4">
                          <h4 className="text-sm font-semibold text-gray-900">Conversation</h4>
                          {ticket.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className={`p-3 rounded-lg border text-sm ${
                                reply.from === 'team'
                                  ? 'bg-blue-50 border-blue-200'
                                  : 'bg-white border-gray-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className={`font-medium ${
                                  reply.from === 'team' ? 'text-blue-800' : 'text-gray-900'
                                }`}>
                                  {reply.author}
                                </span>
                                <span className="text-xs text-gray-400">{formatDate(reply.createdAt)}</span>
                              </div>
                              <p className="text-gray-700">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-6 text-xs text-gray-500">
                        <span>Ticket ID: {ticket.id}</span>
                        <span>Type: {ticket.type === 'bug' ? 'Bug' : ticket.type === 'feature' ? 'Feature Request' : ticket.type === 'question' ? 'Question' : 'Other'}</span>
                        <span>Priority: {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <MessageSquare size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">New Support Ticket</h2>
                  <p className="text-xs text-gray-500">Sent to {SUPPORT_EMAIL}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Ticket Submitted!</h3>
                <p className="text-gray-600 mb-4">We have received your ticket and will reply via email shortly.</p>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSubmitSuccess(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Got it
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {submitError && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{submitError}</p>
                        <p className="text-xs mt-1">Your email client should have opened with a pre-filled message. Just hit send!</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ticket Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: 'bug', label: 'Bug Report', icon: Bug },
                      { value: 'feature', label: 'Feature Request', icon: Lightbulb },
                      { value: 'question', label: 'Question', icon: HelpCircle },
                      { value: 'other', label: 'Other', icon: MessageSquare }
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormType(opt.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          formType === opt.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <opt.icon size={16} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <div className="flex gap-2">
                    {([
                      { value: 'urgent', label: 'Urgent' },
                      { value: 'high', label: 'High' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'low', label: 'Low' }
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormPriority(opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                          formPriority === opt.value
                            ? opt.value === 'urgent' ? 'bg-red-100 border-red-300 text-red-800' :
                              opt.value === 'high' ? 'bg-orange-100 border-orange-300 text-orange-800' :
                              opt.value === 'medium' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' :
                              'bg-green-100 border-green-300 text-green-800'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., CSV import shows garbled characters"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe the issue, steps to reproduce, expected vs actual behavior..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Paperclip size={16} />
                  <span>Screenshot upload coming soon. Please describe in detail for now.</span>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Submit Ticket
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
