import { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  QrCode,
  Stamp,
  User,
  BookOpen,
  Hash,
  Star,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore, useAppStore } from '@/store';
import { mockUsers, mockCourses } from '@/data';
import type { Certificate } from '@/types';
import { cn } from '@/lib/utils';

const statusMap = {
  pending: { label: '待审核', icon: Clock, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  approved: { label: '已通过', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  rejected: { label: '已驳回', icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200' },
};

export default function CertificateList() {
  const { user } = useAuthStore();
  const { fetchCertificates, certificates } = useAppStore();
  const [activeTab, setActiveTab] = useState<'mine' | 'audit'>('mine');
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditCert, setAuditCert] = useState<Certificate | null>(null);
  const [auditRemark, setAuditRemark] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const isDean = user?.role === 'dean' || user?.role === 'admin';

  const myCertificates = certificates.filter((c) => c.userId === user?.id);
  const auditCertificates = certificates.filter((c) => c.auditStatus === 'pending');

  const displayList = activeTab === 'mine' ? myCertificates : auditCertificates;
  const filteredList = displayList.filter(
    (c) =>
      c.certificateNo?.toLowerCase().includes(searchText.toLowerCase()) ||
      c.title?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const getUser = (userId: string) => mockUsers.find((u) => u.id === userId);
  const getCourse = (courseId: string) => mockCourses.find((c) => c.id === courseId);

  const handleAudit = (cert: Certificate) => {
    setAuditCert(cert);
    setAuditRemark('');
    setAuditModalOpen(true);
  };

  const handleAuditSubmit = (decision: 'approved' | 'rejected') => {
    console.log(`审核证书: ${auditCert?.id}, 决定: ${decision}, 意见: ${auditRemark}`);
    setAuditModalOpen(false);
    setAuditCert(null);
    setAuditRemark('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900 flex items-center gap-3">
            <Award className="h-8 w-8 text-primary-600" />
            证书管理
          </h1>
          <p className="text-primary-500 mt-2">查看与管理您的学习证书</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card mb-6 overflow-hidden">
          <div className="flex border-b border-primary-100">
            <button
              onClick={() => setActiveTab('mine')}
              className={cn(
                'px-8 py-4 font-medium transition-all relative',
                activeTab === 'mine'
                  ? 'text-primary-700 bg-primary-50'
                  : 'text-primary-400 hover:text-primary-600 hover:bg-primary-50/50',
              )}
            >
              <span className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                我的证书
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                  {myCertificates.length}
                </span>
              </span>
              {activeTab === 'mine' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-primary" />
              )}
            </button>
            {isDean && (
              <button
                onClick={() => setActiveTab('audit')}
                className={cn(
                  'px-8 py-4 font-medium transition-all relative',
                  activeTab === 'audit'
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-primary-400 hover:text-primary-600 hover:bg-primary-50/50',
                )}
              >
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  待审核证书
                  {auditCertificates.length > 0 && (
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                      {auditCertificates.length}
                    </span>
                  )}
                </span>
                {activeTab === 'audit' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-primary" />
                )}
              </button>
            )}
          </div>

          <div className="p-6 border-b border-primary-100">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
              <input
                type="text"
                placeholder="搜索证书编号或名称..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-primary-200 bg-primary-50/50 text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="p-6">
            {filteredList.length === 0 ? (
              <div className="text-center py-16 text-primary-400">
                <Award className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>暂无证书数据</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredList.map((cert) => {
                  const certUser = getUser(cert.userId);
                  const course = getCourse(cert.courseId);
                  const status = statusMap[cert.auditStatus || 'pending'];
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={cert.id}
                      className="group relative bg-white rounded-2xl border border-primary-100 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="relative h-40 bg-gradient-primary p-6 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Stamp className="h-6 w-6 text-yellow-300" />
                            <span className="text-yellow-200 text-sm font-medium">
                              {cert.type === 'honor' ? '荣誉证书' : cert.type === 'qualification' ? '资格认证' : '结业证书'}
                            </span>
                          </div>
                          <div className={cn('px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1', status.color)}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg leading-tight">{cert.title}</h3>
                          <div className="flex items-center gap-1 text-primary-200 text-xs mt-1">
                            <Hash className="h-3 w-3" />
                            {cert.certificateNo}
                          </div>
                        </div>
                        <div className="absolute top-4 right-4 opacity-10">
                          <Award className="h-24 w-24 text-white" />
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-primary-600">
                          <BookOpen className="h-4 w-4 text-primary-400" />
                          <span className="truncate">{course?.title || '未知课程'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-primary-600">
                          <User className="h-4 w-4 text-primary-400" />
                          <span>{certUser?.name || '未知用户'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-primary-100">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-primary-900 font-semibold">{cert.score}</span>
                            <span className="text-primary-400 text-sm">分</span>
                          </div>
                          <div className="text-primary-600 text-sm">
                            {cert.credits || 0} 学分
                          </div>
                        </div>
                      </div>

                      <div className="px-5 pb-5 flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          leftIcon={<Eye className="h-4 w-4" />}
                          onClick={() => setSelectedCert(cert)}
                        >
                          预览
                        </Button>
                        {activeTab === 'audit' && isDean && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleAudit(cert)}
                          >
                            审核
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedCert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-flip">
            <div className="flex items-center justify-between p-6 border-b border-primary-100">
              <h3 className="text-xl font-bold text-primary-900 flex items-center gap-2">
                <Award className="h-6 w-6 text-primary-600" />
                证书预览
              </h3>
              <button
                onClick={() => setSelectedCert(null)}
                className="p-2 rounded-lg hover:bg-primary-50 text-primary-400 hover:text-primary-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-8">
              <div className="relative p-12 bg-gradient-to-br from-primary-50 via-white to-yellow-50 rounded-2xl border-4 border-yellow-400" style={{
                borderImage: 'linear-gradient(135deg, #d4af37, #f4e4bc, #d4af37, #f4e4bc) 1'
              }}>
                <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-yellow-300/60 rounded-xl pointer-events-none" />
                <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-yellow-500" />
                <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-yellow-500" />
                <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-yellow-500" />
                <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-yellow-500" />

                <div className="text-center relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-full text-sm font-medium mb-6">
                    <Award className="h-4 w-4" />
                    职业教育在线平台
                  </div>

                  <h2 className="text-4xl font-bold text-primary-900 mb-2 font-display tracking-wide">
                    {selectedCert.type === 'honor' ? '荣誉证书' : selectedCert.type === 'qualification' ? '资格认证证书' : '结业证书'}
                  </h2>
                  <p className="text-primary-500 mb-10">CERTIFICATE OF ACHIEVEMENT</p>

                  <p className="text-primary-600 mb-2">兹证明</p>
                  <p className="text-3xl font-bold text-primary-900 mb-6 font-display">
                    {getUser(selectedCert.userId)?.name || '——'}
                  </p>
                  <p className="text-primary-600 mb-2">已完成</p>
                  <p className="text-xl font-semibold text-primary-800 mb-6">
                    《{getCourse(selectedCert.courseId)?.title || selectedCert.title}》
                  </p>
                  <p className="text-primary-600 mb-8 max-w-md mx-auto">
                    {selectedCert.description || '成绩合格，特发此证。'}
                  </p>

                  <div className="flex items-center justify-center gap-8 mb-8">
                    <div className="text-center">
                      <p className="text-primary-400 text-sm mb-1">最终成绩</p>
                      <p className="text-2xl font-bold text-primary-900">{selectedCert.score} 分</p>
                    </div>
                    <div className="w-px h-12 bg-primary-200" />
                    <div className="text-center">
                      <p className="text-primary-400 text-sm mb-1">获得学分</p>
                      <p className="text-2xl font-bold text-primary-900">{selectedCert.credits || 0} 学分</p>
                    </div>
                  </div>

                  <div className="flex items-end justify-between px-8">
                    <div className="text-left">
                      <p className="text-primary-400 text-xs mb-1">证书编号</p>
                      <p className="text-primary-700 font-mono text-sm">{selectedCert.certificateNo}</p>
                      <p className="text-primary-400 text-xs mt-3 mb-1">颁发日期</p>
                      <p className="text-primary-700 text-sm">
                        {selectedCert.issuedAt ? new Date(selectedCert.issuedAt).toLocaleDateString('zh-CN') : '——'}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full border-4 border-red-500/80 flex items-center justify-center rotate-[-12deg] opacity-90">
                        <div className="text-center">
                          <p className="text-red-600 text-[10px] font-bold leading-tight">职业教育</p>
                          <p className="text-red-600 text-[10px] font-bold leading-tight">认证专用章</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-white border-2 border-primary-200 rounded-lg flex items-center justify-center">
                        <QrCode className="h-14 w-14 text-primary-800" />
                      </div>
                      <p className="text-primary-400 text-[10px] mt-1">扫码验证</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {auditModalOpen && auditCert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-primary-100">
              <h3 className="text-xl font-bold text-primary-900 flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary-600" />
                证书审核
              </h3>
              <button
                onClick={() => setAuditModalOpen(false)}
                className="p-2 rounded-lg hover:bg-primary-50 text-primary-400 hover:text-primary-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-primary-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-primary-500">证书编号</span>
                  <span className="text-primary-900 font-mono">{auditCert.certificateNo}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary-500">证书名称</span>
                  <span className="text-primary-900 font-medium">{auditCert.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary-500">获得者</span>
                  <span className="text-primary-900">{getUser(auditCert.userId)?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary-500">成绩 / 学分</span>
                  <span className="text-primary-900">{auditCert.score}分 / {auditCert.credits || 0}学分</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  审核意见
                </label>
                <textarea
                  value={auditRemark}
                  onChange={(e) => setAuditRemark(e.target.value)}
                  rows={4}
                  placeholder="请输入审核意见..."
                  className="w-full px-4 py-3 rounded-xl border border-primary-200 bg-white text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-primary-100 bg-primary-50/50">
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
          </div>
        </div>
      )}
    </div>
  );
}
