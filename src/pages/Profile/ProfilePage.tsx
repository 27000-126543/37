import { useState } from 'react';
import {
  User,
  Camera,
  Mail,
  Phone,
  Lock,
  Clock,
  BookOpen,
  FileText,
  Award,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store';
import { cn } from '@/lib/utils';

const statCards = [
  { icon: Clock, label: '学习时长', value: '128.5', unit: '小时', color: 'from-blue-500 to-cyan-500' },
  { icon: BookOpen, label: '学习课程', value: '11', unit: '门', color: 'from-emerald-500 to-teal-500' },
  { icon: FileText, label: '完成作业', value: '24', unit: '份', color: 'from-amber-500 to-orange-500' },
  { icon: Award, label: '获得证书', value: '5', unit: '张', color: 'from-purple-500 to-pink-500' },
];

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const [activeSection, setActiveSection] = useState<'info' | 'password'>('info');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveProfile = () => {
    console.log('保存用户信息:', formData);
    setEditMode(false);
  };

  const handleChangePassword = () => {
    console.log('修改密码:', passwordData);
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900 flex items-center gap-3">
            <User className="h-8 w-8 text-primary-600" />
            个人中心
          </h1>
          <p className="text-primary-500 mt-2">管理您的个人信息与学习数据</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-6">
          <div className="relative h-40 bg-gradient-primary">
            <div className="absolute inset-0 bg-grid-pattern opacity-30" />
          </div>
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 relative z-10">
              <div className="relative group">
                <img
                  src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                  alt="avatar"
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                />
                <button className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg hover:bg-primary-700 transition-colors opacity-0 group-hover:opacity-100">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-primary-900">{user?.name || '用户'}</h2>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-primary-500">
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {user?.role === 'admin'
                      ? '管理员'
                      : user?.role === 'dean'
                      ? '教务'
                      : user?.role === 'teacher' || user?.role === 'lecturer'
                      ? '讲师'
                      : user?.role === 'assistant'
                      ? '助教'
                      : '学员'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {user?.department || '未设置部门'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {user?.email || '未设置邮箱'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="relative bg-white rounded-2xl shadow-card p-5 overflow-hidden group hover:shadow-card-hover transition-all duration-300"
              >
                <div className={cn('absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br opacity-10', card.color)} />
                <div className="relative z-10">
                  <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-3', card.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-primary-500 text-sm">{card.label}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold text-primary-900">{card.value}</span>
                    <span className="text-primary-500 text-sm">{card.unit}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-card p-2 h-fit lg:sticky lg:top-6">
            <nav className="space-y-1">
              {[
                { key: 'info', label: '基本信息', icon: User },
                { key: 'password', label: '修改密码', icon: Lock },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key as 'info' | 'password')}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl flex items-center gap-3 text-left font-medium transition-all',
                      activeSection === item.key
                        ? 'bg-gradient-primary text-white shadow-glow'
                        : 'text-primary-600 hover:bg-primary-50',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="lg:col-span-3 bg-white rounded-2xl shadow-card p-6">
            {activeSection === 'info' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-primary-600" />
                    基本信息
                  </h3>
                  {!editMode ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Edit2 className="h-4 w-4" />}
                      onClick={() => setEditMode(true)}
                    >
                      编辑
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditMode(false)}
                      >
                        取消
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Save className="h-4 w-4" />}
                        onClick={handleSaveProfile}
                      >
                        保存
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      姓名
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!editMode}
                        className={cn(
                          'w-full pl-12 pr-4 py-3 rounded-xl border text-primary-900 transition-all',
                          editMode
                            ? 'border-primary-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent'
                            : 'border-primary-100 bg-primary-50/50 cursor-not-allowed',
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      邮箱
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!editMode}
                        className={cn(
                          'w-full pl-12 pr-4 py-3 rounded-xl border text-primary-900 transition-all',
                          editMode
                            ? 'border-primary-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent'
                            : 'border-primary-100 bg-primary-50/50 cursor-not-allowed',
                        )}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      手机号
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!editMode}
                        className={cn(
                          'w-full pl-12 pr-4 py-3 rounded-xl border text-primary-900 transition-all',
                          editMode
                            ? 'border-primary-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent'
                            : 'border-primary-100 bg-primary-50/50 cursor-not-allowed',
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-5 bg-primary-50/50 rounded-xl border border-primary-100">
                  <h4 className="font-semibold text-primary-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    账号信息
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-primary-500">登录账号</span>
                      <p className="text-primary-900 font-medium mt-0.5">{user?.username || '—'}</p>
                    </div>
                    <div>
                      <span className="text-primary-500">注册时间</span>
                      <p className="text-primary-900 font-medium mt-0.5">
                        {user?.registeredAt ? new Date(user.registeredAt).toLocaleDateString('zh-CN') : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'password' && (
              <div>
                <h3 className="text-lg font-bold text-primary-900 flex items-center gap-2 mb-6">
                  <Lock className="h-5 w-5 text-primary-600" />
                  修改密码
                </h3>

                <div className="space-y-5 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      当前密码
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                        placeholder="请输入当前密码"
                        className="w-full pl-12 pr-12 py-3 rounded-xl border border-primary-200 bg-white text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600"
                      >
                        {showOldPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      新密码
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="请输入新密码（至少6位）"
                        className="w-full pl-12 pr-12 py-3 rounded-xl border border-primary-200 bg-white text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600"
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      确认新密码
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="请再次输入新密码"
                        className="w-full pl-12 pr-12 py-3 rounded-xl border border-primary-200 bg-white text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5 rotate-45" />
                        两次输入的密码不一致
                      </p>
                    )}
                  </div>

                  <div className="pt-4">
                    <Button
                      variant="primary"
                      leftIcon={<Save className="h-4 w-4" />}
                      onClick={handleChangePassword}
                      disabled={!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword}
                    >
                      确认修改
                    </Button>
                  </div>
                </div>

                <div className="mt-8 p-5 bg-amber-50 rounded-xl border border-amber-100">
                  <h4 className="font-semibold text-amber-900 mb-2">密码安全提示</h4>
                  <ul className="text-sm text-amber-700 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      密码长度建议至少 8 位
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      建议包含大小写字母、数字和特殊字符
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      不要使用生日、手机号等容易猜测的信息
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      定期更换密码，不同平台使用不同密码
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
