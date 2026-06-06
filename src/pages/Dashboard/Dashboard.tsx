import { useState, useMemo, useEffect } from 'react';
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Award,
  FileText,
  Calendar,
  Filter,
  Download,
  ChevronDown,
  Activity,
  Clock,
  CheckCircle2,
  Circle,
  ArrowUpRight,
  Sparkles,
  Target,
  Layers,
  BarChart3,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useAppStore, useAuthStore } from '@/store';
import { mockCertificates, mockUsers } from '@/data';

const CHART_COLORS = ['#3e92cc', '#2ec4b6', '#fbbf24', '#f472b6', '#a78bfa', '#f97316'];

const SUBJECT_OPTIONS = [
  { value: 'all', label: '全部学科' },
  { value: '编程语言', label: '编程语言' },
  { value: '数据科学', label: '数据科学' },
  { value: '设计创意', label: '设计创意' },
  { value: '项目管理', label: '项目管理' },
  { value: '网络安全', label: '网络安全' },
  { value: '人工智能', label: '人工智能' },
];

const EDUCATION_DATA = [
  { name: '博士', value: 45, color: CHART_COLORS[0] },
  { name: '硕士', value: 320, color: CHART_COLORS[1] },
  { name: '本科', value: 1680, color: CHART_COLORS[2] },
  { name: '大专', value: 985, color: CHART_COLORS[3] },
  { name: '其他', value: 220, color: CHART_COLORS[4] },
];

const PLATFORM_ABILITY_DATA = [
  { dimension: '教学质量', score: 92, fullMark: 100 },
  { dimension: '课程体系', score: 88, fullMark: 100 },
  { dimension: '师资力量', score: 85, fullMark: 100 },
  { dimension: '学员服务', score: 90, fullMark: 100 },
  { dimension: '技术支持', score: 95, fullMark: 100 },
  { dimension: '证书认可度', score: 82, fullMark: 100 },
];

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon: typeof Users;
  color: string;
  description?: string;
}

function StatCard({ title, value, unit, trend, trendValue, icon: Icon, color, description }: StatCardProps) {
  return (
    <div className="glass-card p-5 relative overflow-hidden group hover:border-primary-400/30 transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }} />
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-primary-200/60 font-medium">{title}</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
              {unit && <span className="text-sm text-primary-300/70">{unit}</span>}
            </div>
          </div>
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: `${color}20`, border: `1px solid ${color}40` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
          {trend && (
            <span className={cn(
              'inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded',
              trend === 'up' ? 'text-emerald-400 bg-emerald-500/10' :
              trend === 'down' ? 'text-red-400 bg-red-500/10' :
              'text-primary-300 bg-primary-500/10'
            )}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
               trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
               <Circle className="w-3 h-3" />}
              {trendValue}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-primary-200/50">{description}</span>
          )}
        </div>
      </div>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: typeof Activity;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function SectionCard({ title, subtitle, icon: Icon, action, children, className }: SectionCardProps) {
  return (
    <div className={cn('glass-card overflow-hidden', className)}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-primary-500/15 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary-300" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {subtitle && <p className="text-[11px] text-primary-200/50 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const stats = useAppStore((s) => s.dashboardStats);
  const users = useAppStore((s) => s.users);
  const fetchDashboardStats = useAppStore((s) => s.fetchDashboardStats);
  const fetchUsers = useAppStore((s) => s.fetchUsers);

  useEffect(() => {
    fetchDashboardStats();
    fetchUsers();
  }, [fetchDashboardStats, fetchUsers]);

  const [selectedSubject, setSelectedSubject] = useState('all');
  const [startDate, setStartDate] = useState('2025-05-31');
  const [endDate, setEndDate] = useState('2025-06-06');
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  const filteredSubjectDistribution = useMemo(() => {
    if (!stats.subjectDistribution) return [];
    if (selectedSubject === 'all') return stats.subjectDistribution;
    return stats.subjectDistribution.filter((s: { subject: string; studentCount: number; courseCount: number }) => s.subject === selectedSubject);
  }, [stats.subjectDistribution, selectedSubject]);

  const barChartData = useMemo(() => {
    return (filteredSubjectDistribution || []).map((s: { subject: string; studentCount: number; courseCount: number }) => ({
      subject: s.subject,
      学员数: s.studentCount,
      课程数: s.courseCount * 20,
    }));
  }, [filteredSubjectDistribution]);

  const pendingCertificates = mockCertificates.filter((c) => c.auditStatus === 'pending');
  const studentUsers = users.filter((u) => u.role === 'student').slice(0, 6);

  const handleExport = () => {
    const data = [
      ['指标', '数值'],
      ['总学员数', stats.totalStudents],
      ['总课程数', stats.totalCourses],
      ['完课率', `${stats.completionRate || stats.courseCompletionRate}%`],
      ['考试通过率', `${stats.examPassRate}%`],
      ['师生比', String(stats.teacherStudentRatio)],
    ];
    const csv = data.map((row) => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[var(--deep-sea-950)] via-[var(--deep-sea-900)] to-[var(--deep-sea-800)]">
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-teal/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-[1600px] mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">数据驾驶舱</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-500/20 border border-primary-400/30 text-[11px] text-primary-300">
                  <Sparkles className="w-3 h-3" />
                  实时数据
                </span>
              </div>
              <p className="text-sm text-primary-200/60 mt-1">
                欢迎回来，{user?.name || '用户'} · 今天是 {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                className="flex items-center gap-2 h-10 px-4 rounded-xl glass-button text-sm text-white"
              >
                <Filter className="w-3.5 h-3.5 text-primary-300" />
                {SUBJECT_OPTIONS.find((s) => s.value === selectedSubject)?.label || '全部学科'}
                <ChevronDown className={cn('w-3.5 h-3.5 text-primary-300 transition-transform', showSubjectDropdown && 'rotate-180')} />
              </button>
              {showSubjectDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 glass-card-sm py-1 z-20 shadow-glow-lg">
                  {SUBJECT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSelectedSubject(opt.value);
                        setShowSubjectDropdown(false);
                      }}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm transition-colors',
                        selectedSubject === opt.value
                          ? 'text-primary-300 bg-primary-500/20'
                          : 'text-primary-100/80 hover:text-white hover:bg-white/5',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 h-10 px-4 rounded-xl glass-button">
              <Calendar className="w-3.5 h-3.5 text-primary-300" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-sm text-white border-none outline-none w-[110px] text-primary-100/80"
              />
              <span className="text-primary-300/50">~</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-sm text-white border-none outline-none w-[110px] text-primary-100/80"
              />
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium text-white
                bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500
                shadow-glow hover:shadow-glow-lg transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              导出报表
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard
            title="总学员数"
            value={stats.totalStudents?.toLocaleString() || 0}
            unit="人"
            trend="up"
            trendValue="+12.5%"
            icon={Users}
            color="#3e92cc"
            description="较上周"
          />
          <StatCard
            title="总课程数"
            value={stats.totalCourses || 0}
            unit="门"
            trend="up"
            trendValue="+8 门"
            icon={BookOpen}
            color="#2ec4b6"
            description="较上周"
          />
          <StatCard
            title="完课率"
            value={stats.completionRate || stats.courseCompletionRate || 0}
            unit="%"
            trend="up"
            trendValue="+3.2%"
            icon={GraduationCap}
            color="#fbbf24"
            description="较上月"
          />
          <StatCard
            title="考试通过率"
            value={stats.examPassRate || 0}
            unit="%"
            trend="stable"
            trendValue="持平"
            icon={CheckCircle2}
            color="#a78bfa"
            description="较上月"
          />
          <StatCard
            title="师生比"
            value={stats.teacherStudentRatio || '0'}
            trend="down"
            trendValue="-2.1%"
            icon={UserCheck}
            color="#f472b6"
            description="较上月"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <SectionCard
            title="近7天报名/完课趋势"
            subtitle="Enrollment & Completion Trends"
            icon={TrendingUp}
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dailyTrend || []} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3e92cc" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3e92cc" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorComplete" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2ec4b6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2ec4b6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(62,146,204,0.1)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#7dd3fc', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(62,146,204,0.2)' }}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis
                    tick={{ fill: '#7dd3fc', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(62,146,204,0.2)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(6,21,57,0.95)',
                      border: '1px solid rgba(62,146,204,0.3)',
                      borderRadius: 12,
                      color: '#fff',
                      fontSize: 12,
                      backdropFilter: 'blur(10px)',
                    }}
                    labelStyle={{ color: '#7dd3fc' }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                    formatter={(value) => <span className="text-primary-200/80">{value}</span>}
                  />
                  <Line
                    type="monotone"
                    dataKey="enrollments"
                    name="报名人数"
                    stroke="#3e92cc"
                    strokeWidth={2.5}
                    dot={{ fill: '#3e92cc', r: 4 }}
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completions"
                    name="完课人数"
                    stroke="#2ec4b6"
                    strokeWidth={2.5}
                    dot={{ fill: '#2ec4b6', r: 4 }}
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="各学科课程报名人数对比"
            subtitle="Subject Enrollment Comparison"
            icon={BarChart3}
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(62,146,204,0.1)" />
                  <XAxis
                    dataKey="subject"
                    tick={{ fill: '#7dd3fc', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(62,146,204,0.2)' }}
                  />
                  <YAxis
                    tick={{ fill: '#7dd3fc', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(62,146,204,0.2)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(6,21,57,0.95)',
                      border: '1px solid rgba(62,146,204,0.3)',
                      borderRadius: 12,
                      color: '#fff',
                      fontSize: 12,
                      backdropFilter: 'blur(10px)',
                    }}
                    labelStyle={{ color: '#7dd3fc' }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                    formatter={(value) => <span className="text-primary-200/80">{value}</span>}
                  />
                  <Bar dataKey="学员数" fill="#3e92cc" radius={[6, 6, 0, 0]} barSize={20} />
                  <Bar dataKey="课程数" fill="#a78bfa" radius={[6, 6, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <SectionCard
            title="学员学历分布"
            subtitle="Education Distribution"
            icon={Layers}
          >
            <div className="flex items-center gap-4 h-72">
              <div className="flex-1 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={EDUCATION_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="rgba(6,21,57,0.8)"
                      strokeWidth={2}
                    >
                      {EDUCATION_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(6,21,57,0.95)',
                        border: '1px solid rgba(62,146,204,0.3)',
                        borderRadius: 12,
                        color: '#fff',
                        fontSize: 12,
                        backdropFilter: 'blur(10px)',
                      }}
                      formatter={(value: number) => [`${value} 人`, '人数']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-40 space-y-2.5">
                {EDUCATION_DATA.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                      <span className="text-xs text-primary-200/80">{item.name}</span>
                    </div>
                    <span className="text-xs text-white font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="平台综合能力评估"
            subtitle="Platform Capability Radar"
            icon={Target}
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={PLATFORM_ABILITY_DATA} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke="rgba(62,146,204,0.15)" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fill: '#7dd3fc', fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: 'rgba(125,211,252,0.5)', fontSize: 10 }}
                    axisLine={false}
                    tickCount={5}
                  />
                  <Radar
                    name="能力值"
                    dataKey="score"
                    stroke="#3e92cc"
                    fill="#3e92cc"
                    fillOpacity={0.35}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(6,21,57,0.95)',
                      border: '1px solid rgba(62,146,204,0.3)',
                      borderRadius: 12,
                      color: '#fff',
                      fontSize: 12,
                      backdropFilter: 'blur(10px)',
                    }}
                    formatter={(value: number) => [`${value}/100`, '得分']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <SectionCard
            title="最新报名学员"
            subtitle="New Registrations"
            icon={Users}
            action={
              <button className="flex items-center gap-1 text-xs text-primary-300 hover:text-primary-200 transition-colors">
                查看全部 <ArrowUpRight className="w-3 h-3" />
              </button>
            }
          >
            <div className="space-y-3">
              {studentUsers.map((stu) => (
                <div
                  key={stu.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors border border-white/5"
                >
                  <img
                    src={stu.avatar}
                    alt={stu.name}
                    className="w-10 h-10 rounded-full bg-primary-700 border-2 border-primary-500/30"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">{stu.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-300">
                        {stu.department?.split('班')[0] || '学员'}
                      </span>
                    </div>
                    <p className="text-xs text-primary-200/50 mt-0.5">
                      @{stu.username} · {stu.email}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                      <Clock className="w-3 h-3" />
                      刚刚注册
                    </div>
                    <p className="text-[10px] text-primary-200/40 mt-0.5">{stu.registeredAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="待审核证书"
            subtitle={`Pending Certificates · ${pendingCertificates.length} 份待处理`}
            icon={Award}
            action={
              <button className="flex items-center gap-1 text-xs text-primary-300 hover:text-primary-200 transition-colors">
                查看全部 <ArrowUpRight className="w-3 h-3" />
              </button>
            }
          >
            <div className="space-y-3">
              {pendingCertificates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-primary-200/50">
                  <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-400" />
                  <p className="text-sm">暂无待审核证书</p>
                </div>
              ) : (
                pendingCertificates.map((cert) => {
                  const certUser = mockUsers.find((u: { id: string; name?: string }) => u.id === cert.userId);
                  return (
                    <div
                      key={cert.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors border border-white/5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-yellow/20 to-accent-orange/20 border border-accent-yellow/30 flex items-center justify-center">
                        <Award className="w-5 h-5 text-accent-yellow" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white truncate">{cert.title}</span>
                          {cert.type === 'honor' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30">
                              荣誉
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-primary-200/50 mt-0.5">
                          申请人：{certUser?.name || '未知'} · 分数：{cert.score} 分
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-[11px] text-accent-yellow">
                          <FileText className="w-3 h-3" />
                          待审核
                        </div>
                        <p className="text-[10px] text-primary-200/40 mt-0.5">
                          证书编号：{cert.certificateNo?.slice(-6)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
