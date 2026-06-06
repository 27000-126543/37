import { useState } from 'react';
import {
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  Search,
  AlertTriangle,
  FileText,
  Award,
  X,
  ChevronRight,
  User,
  BookOpen,
  Calendar,
  Hourglass,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store';
import { mockApplications, mockUsers } from '@/data';
import type { CourseApplication } from '@/types';
import { cn } from '@/lib/utils';

type AuditTab = 'pending_dean' | 'pending_expert' | 'approved' | 'rejected' | 'overdue';

const tabConfig: { key: AuditTab; label: string; icon: typeof Clock }[] = [
  { key: 'pending_dean', label: '待教务审核', icon: Clock },
  { key: 'pending_expert', label: '待专家评审', icon: UserCheck },
  { key: 'approved', label: '已通过', icon: CheckCircle },
  { key: 'rejected', label: '已驳回', icon: XCircle },
  { key: 'overdue', label: '超期自动驳回', icon: AlertTriangle },
];

const statusLabelMap: Record<string, { label: string; color: string }> = {
  pending_dean: { label: '待教务审核', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  pending_first_review: { label: '待教务审核', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  pending_expert: { label: '待专家评审', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  first_review_passed: { label: '待专家评审', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  approved: { label: '已通过', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  final_review_passed: { label: '已通过', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  rejected: { label: '已驳回', color: 'text-red-600 bg-red-50 border-red-200' },
  first_review_rejected: { label: '已驳回', color: 'text-red-600 bg-red-50 border-red-200' },
  final_review_rejected: { label: '已驳回', color: 'text-red-600 bg-red-50 border-red-200' },
  overdue: { label: '超期自动驳回', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  cancelled: { label: '已取消', color: 'text-gray-600 bg-gray-50 border-gray-200' },
};

export default function TeacherAudit() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AuditTab>('pending_dean');
  const [selectedApp, setSelectedApp] = useState<CourseApplication | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [auditRemark, setAuditRemark] = useState('');
  const [searchText, setSearchText] = useState('');
  const [formData, setFormData] = useState({
    courseTitle: '',
    category: '',
    description: '',
    courseOutline: '',
    estimatedHours: '',
    credits: '',
    qualifications: '',
  });

  const isTeacher = user?.role === 'teacher' || user?.role === 'lecturer';
  const isDean = user?.role === 'dean' || user?.role === 'admin';

  const getApplications = (tab: AuditTab) => {
    switch (tab) {
      case 'pending_dean':
        return mockApplications.filter((a) => a.status === 'pending_dean' || a.status === 'pending_first_review');
      case 'pending_expert':
        return mockApplications.filter((a) => a.status === 'pending_expert' || a.status === 'first_review_passed');
      case 'approved':
        return mockApplications.filter((a) => a.status === 'approved' || a.status === 'final_review_passed');
      case 'rejected':
        return mockApplications.filter(
          (a) => a.status === 'rejected' || a.status === 'first_review_rejected' || a.status === 'final_review_rejected',
        );
      case 'overdue':
        return mockApplications.filter((a) => a.status === 'overdue');
      default:
        return [];
    }
  };

  const getRemainingDays = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getUser = (userId?: string) => mockUsers.find((u) => u.id === userId);

  const displayList = getApplications(activeTab).filter(
    (a) =>
      a.courseTitle?.toLowerCase().includes(searchText.toLowerCase()) ||
      a.title?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleAuditSubmit = (decision: 'approved' | 'rejected') => {
    console.log(`审核申请: ${selectedApp?.id}, 决定: ${decision}, 意见: ${auditRemark}`);
    setSelectedApp(null);
    setAuditRemark('');
  };

  const handleApplySubmit = () => {
    console.log('提交开课申请:', formData);
    setApplyModalOpen(false);
    setFormData({
      courseTitle: '',
      category: '',
      description: '',
      courseOutline: '',
      estimatedHours: '',
      credits: '',
      qualifications: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-primary-600" />
              师资审核管理
            </h1>
            <p className="text-primary-500 mt-2">管理讲师开课申请与资质审核</p>
          </div>
          {isTeacher && (
            <Button
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setApplyModalOpen(true)}
            >
              申请开课
            </Button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-card mb-6 overflow-hidden">
          <div className="flex border-b border-primary-100 overflow-x-auto">
            {tabConfig.map((tab) => {
              const Icon = tab.icon;
              const count = getApplications(tab.key).length;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'px-6 py-4 font-medium transition-all relative whitespace-nowrap flex items-center gap-2',
                    activeTab === tab.key
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-primary-400 hover:text-primary-600 hover:bg-primary-50/50',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        tab.key === 'overdue'
                          ? 'bg-orange-100 text-orange-600'
                          : tab.key === 'pending_dean' || tab.key === 'pending_expert'
                          ? 'bg-red-500 text-white'
                          : 'bg-primary-100 text-primary-700',
                      )}
                    >
                      {count}
                    </span>
                  )}
                  {activeTab === tab.key && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-primary" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-6 border-b border-primary-100">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
              <input
                type="text"
                placeholder="搜索课程名称..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-primary-200 bg-primary-50/50 text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="p-6">
            {displayList.length === 0 ? (
              <div className="text-center py-16 text-primary-400">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>暂无申请数据</p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayList.map((app) => {
                  const applicant = getUser(app.lecturerId || app.applicantId);
                  const statusInfo = statusLabelMap[app.status] || { label: app.status, color: 'text-gray-600 bg-gray-50 border-gray-200' };
                  const remainingDays = getRemainingDays(app.expiresAt);
                  const isUrgent = remainingDays !== null && remainingDays <= 2;

                  return (
                    <div
                      key={app.id}
                      className="p-5 rounded-2xl border border-primary-100 hover:border-primary-200 hover:shadow-card transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <img
                          src={applicant?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                          alt="avatar"
                          className="w-14 h-14 rounded-full border-2 border-primary-100 object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-primary-900 truncate">
                              {app.courseTitle || app.title}
                            </h3>
                            <span className={cn('px-2.5 py-0.5 rounded-full border text-xs font-medium', statusInfo.color)}>
                              {statusInfo.label}
                            </span>
                            {isUrgent && (activeTab === 'pending_dean' || activeTab === 'pending_expert') && (
                              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-medium flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                紧急
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                            <span className="flex items-center gap-1 text-primary-600">
                              <User className="h-3.5 w-3.5 text-primary-400" />
                              {applicant?.name || '未知申请人'}
                            </span>
                            <span className="flex items-center gap-1 text-primary-600">
                              <BookOpen className="h-3.5 w-3.5 text-primary-400" />
                              {app.category || '未分类'}
                            </span>
                            <span className="flex items-center gap-1 text-primary-600">
                              <Calendar className="h-3.5 w-3.5 text-primary-400" />
                              {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('zh-CN') : '—'}
                            </span>
                            {remainingDays !== null && (activeTab === 'pending_dean' || activeTab === 'pending_expert') && (
                              <span className={cn(
                                'flex items-center gap-1 font-medium',
                                isUrgent ? 'text-red-600' : 'text-primary-600',
                              )}>
                                <Hourglass className="h-3.5 w-3.5" />
                                剩余 {remainingDays > 0 ? remainingDays : 0} 天
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Eye className="h-4 w-4" />}
                            onClick={() => {
                              setSelectedApp(app);
                              setAuditRemark('');
                            }}
                          >
                            查看详情
                          </Button>
                          {(activeTab === 'pending_dean' || activeTab === 'pending_expert') && isDean && (
                            <Button
                              variant="primary"
                              size="sm"
                              rightIcon={<ChevronRight className="h-4 w-4" />}
                              onClick={() => {
                                setSelectedApp(app);
                                setAuditRemark('');
                              }}
                            >
                              审核
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-primary-100 shrink-0">
              <h3 className="text-xl font-bold text-primary-900 flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary-600" />
                申请详情
              </h3>
              <button
                onClick={() => {
                  setSelectedApp(null);
                  setAuditRemark('');
                }}
                className="p-2 rounded-lg hover:bg-primary-50 text-primary-400 hover:text-primary-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {selectedApp.cover && (
                <img
                  src={selectedApp.cover}
                  alt="course cover"
                  className="w-full h-48 object-cover rounded-xl"
                />
              )}

              <div>
                <h4 className="text-lg font-bold text-primary-900 mb-2">
                  {selectedApp.courseTitle || selectedApp.title}
                </h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm">
                    {selectedApp.category || '未分类'}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm">
                    {selectedApp.estimatedHours || 0} 课时
                  </span>
                  <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm">
                    {selectedApp.credits || 0} 学分
                  </span>
                </div>
                <p className="text-primary-600 text-sm leading-relaxed">
                  {selectedApp.courseDescription || selectedApp.description}
                </p>
              </div>

              <div className="border-t border-primary-100 pt-6">
                <h5 className="font-semibold text-primary-900 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary-600" />
                  申请人资质
                </h5>
                <div className="flex items-center gap-4 bg-primary-50 rounded-xl p-4">
                  <img
                    src={getUser(selectedApp.lecturerId || selectedApp.applicantId)?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                    alt="avatar"
                    className="w-14 h-14 rounded-full border-2 border-white shadow-sm"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-primary-900">
                      {getUser(selectedApp.lecturerId || selectedApp.applicantId)?.name || '未知'}
                    </p>
                    <p className="text-sm text-primary-500">
                      {getUser(selectedApp.lecturerId || selectedApp.applicantId)?.title || '讲师'}
                    </p>
                  </div>
                </div>
                {(selectedApp.qualifications || selectedApp.credentials) && (
                  <div className="mt-3 space-y-2">
                    {(selectedApp.qualifications || selectedApp.credentials || []).map((q, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-primary-600">
                        <Award className="h-4 w-4 text-yellow-500" />
                        {q}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-primary-100 pt-6">
                <h5 className="font-semibold text-primary-900 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary-600" />
                  课程大纲
                </h5>
                <div className="bg-primary-50/50 rounded-xl p-4 text-sm text-primary-700 whitespace-pre-wrap leading-relaxed font-mono">
                  {selectedApp.courseOutline || selectedApp.syllabus || '暂无大纲'}
                </div>
              </div>

              {(selectedApp.deanReview || selectedApp.expertReview) && (
                <div className="border-t border-primary-100 pt-6 space-y-4">
                  <h5 className="font-semibold text-primary-900">审核记录</h5>
                  {selectedApp.deanReview && (
                    <div className={cn(
                      'p-4 rounded-xl border',
                      selectedApp.deanReview.decision === 'approved'
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-red-50 border-red-200',
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-primary-900">教务审核</span>
                        <span className={cn(
                          'text-sm font-medium flex items-center gap-1',
                          selectedApp.deanReview.decision === 'approved' ? 'text-emerald-600' : 'text-red-600',
                        )}>
                          {selectedApp.deanReview.decision === 'approved' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          {selectedApp.deanReview.decision === 'approved' ? '通过' : '驳回'}
                        </span>
                      </div>
                      <p className="text-sm text-primary-600">{selectedApp.deanReview.comment}</p>
                      <p className="text-xs text-primary-400 mt-2">
                        {selectedApp.deanReview.reviewerName} · {new Date(selectedApp.deanReview.reviewedAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  )}
                  {selectedApp.expertReview && (
                    <div className={cn(
                      'p-4 rounded-xl border',
                      selectedApp.expertReview.decision === 'approved'
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-red-50 border-red-200',
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-primary-900">专家评审</span>
                        <span className={cn(
                          'text-sm font-medium flex items-center gap-1',
                          selectedApp.expertReview.decision === 'approved' ? 'text-emerald-600' : 'text-red-600',
                        )}>
                          {selectedApp.expertReview.decision === 'approved' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          {selectedApp.expertReview.decision === 'approved' ? '通过' : '驳回'}
                        </span>
                      </div>
                      <p className="text-sm text-primary-600">{selectedApp.expertReview.comment}</p>
                      <p className="text-xs text-primary-400 mt-2">
                        {selectedApp.expertReview.reviewerName} · {new Date(selectedApp.expertReview.reviewedAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(activeTab === 'pending_dean' || activeTab === 'pending_expert') && isDean && (
                <div className="border-t border-primary-100 pt-6">
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    审核意见
                  </label>
                  <textarea
                    value={auditRemark}
                    onChange={(e) => setAuditRemark(e.target.value)}
                    rows={3}
                    placeholder="请输入审核意见..."
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 bg-white text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none"
                  />
                </div>
              )}
            </div>
            {(activeTab === 'pending_dean' || activeTab === 'pending_expert') && isDean && (
              <div className="flex gap-3 p-6 border-t border-primary-100 bg-primary-50/50 shrink-0">
                <Button
                  variant="danger"
                  className="flex-1"
                  leftIcon={<XCircle className="h-4 w-4" />}
                  onClick={() => handleAuditSubmit('rejected')}
                >
                  驳回
                </Button>
                <Button
                  variant="success"
                  className="flex-1"
                  leftIcon={<CheckCircle className="h-4 w-4" />}
                  onClick={() => handleAuditSubmit('approved')}
                >
                  通过
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {applyModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-primary-100 shrink-0">
              <h3 className="text-xl font-bold text-primary-900 flex items-center gap-2">
                <Plus className="h-6 w-6 text-primary-600" />
                开课申请
              </h3>
              <button
                onClick={() => setApplyModalOpen(false)}
                className="p-2 rounded-lg hover:bg-primary-50 text-primary-400 hover:text-primary-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    课程名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.courseTitle}
                    onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
                    placeholder="请输入课程名称"
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 bg-white text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    课程分类 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 bg-white text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  >
                    <option value="">请选择分类</option>
                    <option value="编程语言">编程语言</option>
                    <option value="数据科学">数据科学</option>
                    <option value="设计创意">设计创意</option>
                    <option value="项目管理">项目管理</option>
                    <option value="网络安全">网络安全</option>
                    <option value="人工智能">人工智能</option>
                    <option value="云计算">云计算</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    预计课时
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                    placeholder="课时数"
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 bg-white text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  课程简介 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="简要介绍课程内容、目标受众和学习收获"
                  className="w-full px-4 py-3 rounded-xl border border-primary-200 bg-white text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  课程大纲 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.courseOutline}
                  onChange={(e) => setFormData({ ...formData, courseOutline: e.target.value })}
                  rows={6}
                  placeholder="请分章节列出课程大纲"
                  className="w-full px-4 py-3 rounded-xl border border-primary-200 bg-white text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  个人资质证明
                </label>
                <textarea
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  rows={3}
                  placeholder="每行一项，例如：&#10;• 5年前端开发经验&#10;• 前阿里高级工程师&#10;• 出版技术书籍2本"
                  className="w-full px-4 py-3 rounded-xl border border-primary-200 bg-white text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-primary-100 bg-primary-50/50 shrink-0">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setApplyModalOpen(false)}
              >
                取消
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                leftIcon={<CheckCircle className="h-4 w-4" />}
                onClick={handleApplySubmit}
              >
                提交申请
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
