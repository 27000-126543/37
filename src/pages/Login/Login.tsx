import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  GraduationCap,
  UserCog,
  Users,
  Eye,
  EyeOff,
  RefreshCw,
  LogIn,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store';
import type { UserRole } from '@/types';

const ROLE_TABS: { key: UserRole; label: string; icon: typeof User; desc: string }[] = [
  { key: 'admin', label: '管理员', icon: Shield, desc: '全局管理与系统配置' },
  { key: 'dean', label: '教务', icon: UserCog, desc: '教学数据与课程审核' },
  { key: 'teacher', label: '讲师', icon: GraduationCap, desc: '课程开设与直播授课' },
  { key: 'assistant', label: '助教', icon: Users, desc: '学员管理与作业评分' },
  { key: 'student', label: '学员', icon: BookOpen, desc: '课程学习与在线考试' },
];

const DEMO_ACCOUNTS: { role: UserRole; username: string; password: string; label: string }[] = [
  { role: 'admin', username: 'admin', password: '123456', label: '管理员' },
  { role: 'dean', username: 'dean', password: '123456', label: '教务' },
  { role: 'teacher', username: 'teacher1', password: '123456', label: '讲师' },
  { role: 'assistant', username: 'assistant1', password: '123456', label: '助教' },
  { role: 'student', username: 'student1', password: '123456', label: '学员' },
];

function generateCaptcha(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [activeRole, setActiveRole] = useState<UserRole>('admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha());
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const demo = DEMO_ACCOUNTS.find((a) => a.role === activeRole);
    if (demo) {
      setUsername(demo.username);
      setPassword(demo.password);
    }
  }, [activeRole]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRefreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('请输入账号');
      return;
    }
    if (!password.trim()) {
      setError('请输入密码');
      return;
    }
    if (!captchaInput.trim()) {
      setError('请输入验证码');
      return;
    }
    if (captchaInput.toUpperCase() !== captchaCode.toUpperCase()) {
      setError('验证码错误');
      handleRefreshCaptcha();
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const user = login(username.trim(), activeRole);
      if (user) {
        navigate('/dashboard', { replace: true });
      } else {
        setError('账号或密码错误');
        handleRefreshCaptcha();
      }
      setLoading(false);
    }, 600);
  };

  const handleDemoLogin = (role: UserRole) => {
    const demo = DEMO_ACCOUNTS.find((a) => a.role === role);
    if (!demo) return;
    setActiveRole(role);
    setUsername(demo.username);
    setPassword(demo.password);
  };

  const currentRoleInfo = ROLE_TABS.find((r) => r.key === activeRole);
  const RoleIcon = currentRoleInfo?.icon || User;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[var(--deep-sea-950)] via-[var(--deep-sea-900)] to-[var(--deep-sea-800)]">
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-teal/15 rounded-full blur-3xl" />

      <div className="absolute inset-0 scanline-bg opacity-30 pointer-events-none" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
          <div className="hidden lg:flex flex-col gap-8 pr-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-glow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">VocEdu Platform</h1>
                <p className="text-sm text-primary-200/70">在线职业教育管理平台</p>
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-bold leading-tight">
                <span className="gradient-text">数字化教学</span>
                <br />
                <span className="text-white">智能化管理</span>
              </h2>
              <p className="mt-4 text-primary-100/70 leading-relaxed max-w-md">
                集课程管理、在线学习、直播授课、作业考试、证书颁发于一体的一站式职业教育解决方案，
                助力院校构建高效、透明、可追溯的数字化教学体系。
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: '精品课程', value: '156+' },
                { label: '注册学员', value: '3,250' },
                { label: '师资团队', value: '84' },
              ].map((item) => (
                <div key={item.label} className="glass-card-sm p-4">
                  <div className="text-2xl font-bold gradient-text">{item.value}</div>
                  <div className="text-xs text-primary-200/70 mt-1">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-primary-200/50">
              <Sparkles className="w-3.5 h-3.5 text-accent-yellow" />
              <span>Secure · Reliable · Professional</span>
            </div>
          </div>

          <div className="glass-card-strong p-8 sm:p-10">
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">VocEdu Platform</h1>
                <p className="text-xs text-primary-200/70">在线职业教育管理平台</p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">欢迎登录</h2>
              <p className="text-sm text-primary-200/60 mt-1">请选择您的身份并输入登录信息</p>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-6">
              {ROLE_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeRole === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveRole(tab.key)}
                    className={cn(
                      'group relative flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-xl transition-all duration-300',
                      isActive
                        ? 'bg-gradient-to-b from-primary-500/30 to-primary-600/20 border border-primary-400/40 shadow-glow'
                        : 'glass-button hover:border-primary-400/20',
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 transition-colors',
                        isActive ? 'text-primary-300' : 'text-primary-200/60 group-hover:text-primary-200',
                      )}
                    />
                    <span
                      className={cn(
                        'text-[11px] font-medium transition-colors',
                        isActive ? 'text-white' : 'text-primary-200/60 group-hover:text-primary-200',
                      )}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 px-3 py-2 mb-6 rounded-lg bg-primary-500/10 border border-primary-400/20">
              <RoleIcon className="w-4 h-4 text-primary-300 flex-shrink-0" />
              <span className="text-xs text-primary-200/80">
                {currentRoleInfo?.label} · {currentRoleInfo?.desc}
              </span>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-primary-200/70 mb-1.5">账号</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300/60" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入账号"
                    className={cn(
                      'w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]',
                      'text-white placeholder:text-primary-200/40 text-sm',
                      'focus:outline-none focus:border-primary-400/50 focus:ring-2 focus:ring-primary-400/20',
                      'transition-all',
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-primary-200/70 mb-1.5">密码</label>
                <div className="relative">
                  <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className={cn(
                      'w-full h-11 pl-10 pr-11 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]',
                      'text-white placeholder:text-primary-200/40 text-sm',
                      'focus:outline-none focus:border-primary-400/50 focus:ring-2 focus:ring-primary-400/20',
                      'transition-all',
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-300/60 hover:text-primary-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-primary-200/70 mb-1.5">验证码</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300/60" />
                    <input
                      type="text"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      placeholder="请输入验证码"
                      maxLength={4}
                      className={cn(
                        'w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]',
                        'text-white placeholder:text-primary-200/40 text-sm uppercase tracking-widest',
                        'focus:outline-none focus:border-primary-400/50 focus:ring-2 focus:ring-primary-400/20',
                        'transition-all',
                      )}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRefreshCaptcha}
                    className={cn(
                      'relative h-11 w-28 rounded-xl overflow-hidden flex-shrink-0',
                      'bg-gradient-to-br from-primary-700/60 to-primary-900/60 border border-primary-400/30',
                      'hover:border-primary-300/50 transition-colors group',
                    )}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-mono text-lg font-bold tracking-[0.3em] text-white italic select-none scale-110">
                        {captchaCode}
                      </span>
                    </div>
                    <div className="absolute inset-0 pointer-events-none opacity-30"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.08) 4px, rgba(255,255,255,0.08) 8px)',
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <RefreshCw className="w-4 h-4 text-white" />
                    </div>
                  </button>
                </div>
              </div>

              {error && (
                <div className="px-3 py-2 rounded-lg bg-red-500/15 border border-red-400/30 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'relative w-full h-12 rounded-xl font-semibold text-white text-sm',
                  'bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500',
                  'bg-[length:200%_100%] hover:bg-[position:100%_0]',
                  'shadow-glow hover:shadow-glow-lg',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                  'transition-all duration-500',
                )}
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      登录中...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      立即登录
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-accent-yellow" />
                <span className="text-xs font-medium text-primary-200/70">演示账号（点击快速填充）</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleDemoLogin(acc.role)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs transition-all',
                      activeRole === acc.role
                        ? 'bg-primary-500/30 border border-primary-400/40 text-white'
                        : 'glass-button text-primary-200/70 hover:text-white',
                    )}
                  >
                    {acc.label}: {acc.username}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-primary-200/50">所有演示账号默认密码：123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
