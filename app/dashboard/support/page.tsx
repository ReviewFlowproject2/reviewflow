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
  MessageSquare
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
    title: '导入患者 CSV 时中文姓名乱码',
    description: '上传 CSV 文件后，患者姓名中的中文字符显示为问号。文件编码是 UTF-8，但导入后全部乱码。希望能支持 UTF-8 with BOM 或者自动检测编码。',
    type: 'bug',
    status: 'processing',
    priority: 'high',
    createdAt: '2026-06-02T10:30:00',
    updatedAt: '2026-06-03T14:20:00',
    replies: [
      {
        id: 'R-1',
        from: 'team',
        author: 'ReviewFlow 技术支持',
        content: '感谢您的反馈！我们已复现这个问题。原因是后端读取 CSV 时默认使用了 ASCII 编码。我们计划在本周五的更新中修复，增加 UTF-8 自动检测。',
        createdAt: '2026-06-03T14:20:00'
      }
    ]
  },
  {
    id: 'T-002',
    title: '希望增加微信通知渠道',
    description: '我们诊所的员工更常用微信，希望能把差评提醒和周报也推送到企业微信或微信群机器人。',
    type: 'feature',
    status: 'submitted',
    priority: 'medium',
    createdAt: '2026-06-03T09:15:00',
    updatedAt: '2026-06-03T09:15:00',
    replies: []
  },
  {
    id: 'T-003',
    title: 'Dashboard 趋势图数据不对',
    description: 'Dashboard 上的评分趋势图显示上周平均 4.2 星，但手动计算应该是 3.8 星。怀疑是统计逻辑有问题。',
    type: 'bug',
    status: 'resolved',
    priority: 'urgent',
    createdAt: '2026-05-28T16:00:00',
    updatedAt: '2026-06-01T11:00:00',
    replies: [
      {
        id: 'R-2',
        from: 'team',
        author: 'ReviewFlow 技术支持',
        content: '已确认是时区转换导致的日期边界错误。已在 v1.2.1 中修复，请刷新页面查看最新数据。',
        createdAt: '2026-06-01T11:00:00'
      },
      {
        id: 'R-3',
        from: 'user',
        author: '诊所管理员',
        content: '已验证，数据现在正确了，谢谢！',
        createdAt: '2026-06-01T13:30:00'
      }
    ]
  }
];

// ===================== COMPONENTS =====================

const TypeBadge = ({ type }: { type: TicketType }) => {
  const config = {
    bug: { icon: Bug, label: 'Bug', color: 'bg-red-50 text-red-700 border-red-200' },
    feature: { icon: Lightbulb, label: '功能建议', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    question: { icon: HelpCircle, label: '使用问题', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    other: { icon: MessageSquare, label: '其他', color: 'bg-gray-50 text-gray-700 border-gray-200' }
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
    submitted: { icon: Send, label: '已提交', color: 'bg-gray-50 text-gray-700 border-gray-200' },
    processing: { icon: Loader2, label: '处理中', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    resolved: { icon: CheckCircle2, label: '已解决', color: 'bg-green-50 text-green-700 border-green-200' },
    closed: { icon: XCircle, label: '已关闭', color: 'bg-gray-50 text-gray-500 border-gray-200' }
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
    urgent: { label: '紧急', color: 'bg-red-100 text-red-800' },
    high: { label: '高', color: 'bg-orange-100 text-orange-800' },
    medium: { label: '中', color: 'bg-yellow-100 text-yellow-800' },
    low: { label: '低', color: 'bg-green-100 text-green-800' }
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

  // Form state
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim()) return;

    const newTicket: TicketItem = {
      id: `T-${String(tickets.length + 1).padStart(3, '0')}`,
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
    setShowModal(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">产品反馈与工单</h1>
            <p className="text-gray-600">遇到问题或有新想法？提交工单，我们会尽快处理。</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <MessageSquarePlus size={18} />
            提交反馈
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">我的工单</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Ticket className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">处理中</p>
                <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
              </div>
              <Loader2 className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">已解决</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle2 className="text-green-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">待处理紧急</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
              <AlertTriangle className="text-red-500" size={24} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="搜索工单标题、编号或关键词..."
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
                  <option value="all">全部状态</option>
                  <option value="submitted">已提交</option>
                  <option value="processing">处理中</option>
                  <option value="resolved">已解决</option>
                  <option value="closed">已关闭</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
              <div className="relative">
                <select
                  className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">全部类型</option>
                  <option value="bug">Bug</option>
                  <option value="feature">功能建议</option>
                  <option value="question">使用问题</option>
                  <option value="other">其他</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Ticket List */}
        <div className="space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Ticket className="mx-auto text-gray-300 mb-3" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-1">暂无工单</h3>
              <p className="text-gray-500 mb-4">还没有提交过反馈，遇到问题请随时告诉我们。</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <MessageSquarePlus size={16} />
                提交第一个反馈
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
                {/* Main Row */}
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
                            提交于 {formatDate(ticket.createdAt)}
                          </span>
                          <span>更新于 {formatDate(ticket.updatedAt)}</span>
                          {ticket.replies.length > 0 && (
                            <span className="flex items-center gap-1 text-blue-600">
                              <MessageSquare size={12} />
                              {ticket.replies.length} 条回复
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

                {/* Expanded Detail */}
                {expandedId === ticket.id && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                    <div className="ml-14">
                      {/* Description */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">问题描述</h4>
                        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                      </div>

                      {/* Replies */}
                      {ticket.replies.length > 0 && (
                        <div className="space-y-3 mb-4">
                          <h4 className="text-sm font-semibold text-gray-900">回复记录</h4>
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

                      {/* Info Footer */}
                      <div className="flex items-center gap-6 text-xs text-gray-500">
                        <span>工单编号: {ticket.id}</span>
                        <span>类型: {ticket.type === 'bug' ? 'Bug' : ticket.type === 'feature' ? '功能建议' : ticket.type === 'question' ? '使用问题' : '其他'}</span>
                        <span>优先级: {ticket.priority === 'urgent' ? '紧急' : ticket.priority === 'high' ? '高' : ticket.priority === 'medium' ? '中' : '低'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Submit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">提交新反馈</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  反馈类型 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: 'bug', label: 'Bug 报告', icon: Bug },
                    { value: 'feature', label: '功能建议', icon: Lightbulb },
                    { value: 'question', label: '使用问题', icon: HelpCircle },
                    { value: 'other', label: '其他', icon: MessageSquare }
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
                  优先级
                </label>
                <div className="flex gap-2">
                  {([
                    { value: 'urgent', label: '紧急' },
                    { value: 'high', label: '高' },
                    { value: 'medium', label: '中' },
                    { value: 'low', label: '低' }
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
                  标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="简要描述问题，例如：CSV 导入中文乱码"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  详细描述 <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="请详细描述问题现象、复现步骤、期望结果等..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Paperclip size={16} />
                <span>截图上传功能开发中，目前请用文字描述。</span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  提交工单
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
