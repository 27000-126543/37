import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  BookOpen,
  Award,
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  BarChart3,
  Target,
  History,
  Calendar,
  Sparkles,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store';
import { cn } from '@/lib/utils';

const abilityData = [
  { dimension: '编程能力', current: 82, lastMonth: 75, fullMark: 100 },
  { dimension: '理论知识', current: 75, lastMonth: 70, fullMark: 100 },
  { dimension: '实践操作', current: 68, lastMonth: 60, fullMark: 100 },
  { dimension: '项目经验', current: 55, lastMonth: 45, fullMark: 100 },
  { dimension: '沟通协作', current: 88, lastMonth: 85, fullMark: 100 },
  { dimension: '创新思维', current: 72, lastMonth: 68, fullMark: 100 },
];

const dailyStudyData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: `${date.getMonth() + 1}/${date.getDate()}`,
    hours: Math.floor(Math.random() * 4 + 0.5),
  };
});

const weakPoints = [
  {
    id: 'wp1',
    name: '数据结构与算法',
    masterLevel: 45,
    recommendCourse: 'Python算法与数据结构精讲',
    courseId: 'c001',
  },
  {
    id: 'wp2',
    name: '数据库设计与优化',
    masterLevel: 38,
    recommendCourse: 'MySQL数据库从入门到精通',
    courseId: 'c002',
  },
  {
    id: 'wp3',
    name: 'RESTful API设计',
    masterLevel: 52,
    recommendCourse: 'Web API设计最佳实践',
    courseId: 'c001',
  },
];

const learningTimeline = [
  {
    id: 't1',
    date: '2025-06-05',
    title: '完成《Python全栈开发实战》第三章',
    type: 'lesson',
    description: '学习了面向对象编程，掌握类的继承与多态',
    duration: '2小时15分',
  },
  {
    id: 't2',
    date: '2025-06-04',
    title: '提交作业：冒泡排序算法实现',
    type: 'assignment',
    description: '获得 92 分，教师评语：代码规范，逻辑清晰',
    duration: '1小时30分',
  },
  {
    id: 't3',
    date: '2025-06-03',
    title: '参与《数据分析》直播课',
    type: 'live',
    description: '学习 Pandas 数据清洗实战技巧',
    duration: '2小时',
  },
  {
    id: 't4',
    date: '2025-06-01',
    title: '获得《数据分析入门》结业证书',
    type: 'certificate',
    description: '最终成绩 88 分，排名前 15%',
    duration: '',
  },
  {
    id: 't5',
    date: '2025-05-28',
    title: '通过在线测验：Python基础',
    type: 'exam',
    description: '正确率 95%，用时 18 分钟',
    duration: '18分钟',
  },
];

const statCards = [
  {
    icon: Clock,
    label: '学习总时长',
    value: '128.5',
    unit: '小时',
    trend: '+12.5h',
    trendUp: true,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: BookOpen,
    label: '已完成课程',
    value: '8',
    unit: '门',
    trend: '+2',
    trendUp: true,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Target,
    label: '进行中课程',
    value: '3',
    unit: '门',
    trend: '持平',
    trendUp: true,
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Award,
    label: '获得证书',
    value: '5',
    unit: '张',
    trend: '+1',
    trendUp: true,
    color: 'from-purple-500 to-pink-500',
  },
];

const timelineIconMap = {
  lesson: BookOpen,
  assignment: Target,
  live: BarChart3,
  certificate: Award,
  exam: Sparkles,
};

export default function AnalyticsPage() {
  const { user } = useAuthStore();

  const totalHours = dailyStudyData.reduce((sum, d) => sum + d.hours, 0);
  const avgHours = (totalHours / 30).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary-600" />
            学习分析与能力图谱
          </h1>
          <p className="text-primary-500 mt-2">全方位了解您的学习状况与能力成长</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <img
                src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                alt="avatar"
                className="w-24 h-24 rounded-full border-4 border-primary-100 object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-xs font-bold shadow-glow">
                LV.8
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-primary-900">{user?.name || '学习者'}</h2>
              <p className="text-primary-500 mt-1">{user?.department || '在线学习中心'}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary-400" />
                  <span className="text-primary-600 text-sm">
                    总学习时长：<span className="font-semibold text-primary-900">128.5 小时</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary-400" />
                  <span className="text-primary-600 text-sm">
                    已完成课程：<span className="font-semibold text-primary-900">8 门</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary-400" />
                  <span className="text-primary-600 text-sm">
                    连续学习：<span className="font-semibold text-primary-900">12 天</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" leftIcon={<Target className="h-4 w-4" />}>
                制定学习计划
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="relative bg-white rounded-2xl shadow-card p-5 overflow-hidden group hover:shadow-card-hover transition-all duration-300"
              >
                <div className={cn('absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br opacity-10', card.color)} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white', card.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {card.trend && (
                      <span className={cn(
                        'text-xs font-medium flex items-center gap-1',
                        card.trendUp ? 'text-emerald-600' : 'text-red-600',
                      )}>
                        <ArrowUpRight className={cn('h-3 w-3', !card.trendUp && 'rotate-180')} />
                        {card.trend}
                      </span>
                    )}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary-600" />
                能力图谱
              </h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-primary-600" />
                  <span className="text-primary-600">本月</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-primary-300" />
                  <span className="text-primary-400">上月</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={abilityData}>
                  <PolarGrid stroke="#d9e3f2" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fill: '#0a2463', fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: '#7da0cf', fontSize: 10 }}
                    axisLine={false}
                  />
                  <Radar
                    name="上月"
                    dataKey="lastMonth"
                    stroke="#7da0cf"
                    fill="#7da0cf"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="本月"
                    dataKey="current"
                    stroke="#1a6fb0"
                    fill="#1a6fb0"
                    fillOpacity={0.5}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {abilityData.slice(0, 3).map((item) => (
                <div key={item.dimension} className="bg-primary-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-primary-500">{item.dimension}</p>
                  <p className="text-lg font-bold text-primary-900 mt-1">{item.current}</p>
                  <p className={cn(
                    'text-xs mt-0.5 flex items-center justify-center gap-0.5',
                    item.current >= item.lastMonth ? 'text-emerald-600' : 'text-red-500',
                  )}>
                    <ArrowUpRight className={cn('h-3 w-3', item.current < item.lastMonth && 'rotate-180')} />
                    {Math.abs(item.current - item.lastMonth)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary-600" />
                学习行为统计
              </h3>
              <div className="flex items-center gap-2 text-sm text-primary-500">
                <Clock className="h-4 w-4" />
                近30天
                <span className="font-semibold text-primary-900 ml-1">{totalHours}h</span>
                <span className="text-primary-400">|</span>
                日均
                <span className="font-semibold text-primary-900 ml-1">{avgHours}h</span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStudyData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1a6fb0" />
                      <stop offset="100%" stopColor="#3e92cc" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5ebf5" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#7da0cf', fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: '#d9e3f2' }}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fill: '#7da0cf', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    unit="h"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #d9e3f2',
                      borderRadius: '12px',
                      boxShadow: '0 4px 24px rgba(10,36,99,0.08)',
                    }}
                    labelStyle={{ color: '#0a2463', fontWeight: 600 }}
                  />
                  <Legend />
                  <Bar
                    dataKey="hours"
                    name="学习时长(小时)"
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                薄弱点分析
              </h3>
              <span className="text-sm text-primary-500">基于学习数据智能分析</span>
            </div>
            <div className="space-y-4">
              {weakPoints.map((point) => (
                <div
                  key={point.id}
                  className="p-4 rounded-xl border border-primary-100 bg-primary-50/30 hover:bg-primary-50 hover:border-primary-200 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-primary-900">{point.name}</h4>
                      <p className="text-xs text-primary-500 mt-1">掌握程度较低，建议加强学习</p>
                    </div>
                    <span className={cn(
                      'text-sm font-bold px-2.5 py-1 rounded-full',
                      point.masterLevel < 40
                        ? 'bg-red-100 text-red-600'
                        : point.masterLevel < 60
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-blue-100 text-blue-600',
                    )}>
                      {point.masterLevel}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-primary-100 rounded-full overflow-hidden mb-3">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        point.masterLevel < 40
                          ? 'bg-gradient-to-r from-red-400 to-red-500'
                          : point.masterLevel < 60
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                          : 'bg-gradient-to-r from-blue-400 to-blue-500',
                      )}
                      style={{ width: `${point.masterLevel}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-primary-400" />
                      <span className="text-primary-600">推荐课程：</span>
                      <span className="text-primary-900 font-medium">{point.recommendCourse}</span>
                    </div>
                    <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />}>
                      去学习
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                <History className="h-5 w-5 text-primary-600" />
                学习轨迹
              </h3>
              <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />}>
                查看全部
              </Button>
            </div>
            <div className="relative pl-6">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary-500 via-primary-300 to-primary-100" />
              <div className="space-y-6">
                {learningTimeline.map((item, index) => {
                  const Icon = timelineIconMap[item.type as keyof typeof timelineIconMap] || User;
                  return (
                    <div key={item.id} className="relative">
                      <div className={cn(
                        'absolute -left-[22px] top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-md',
                        index === 0
                          ? 'bg-gradient-primary'
                          : 'bg-primary-400',
                      )}>
                        <Icon className="h-2.5 w-2.5 text-white" />
                      </div>
                      <div className="bg-primary-50/50 rounded-xl p-4 hover:bg-primary-50 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-primary-400">{item.date}</p>
                          {item.duration && (
                            <span className="text-xs text-primary-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {item.duration}
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-primary-900 text-sm">{item.title}</h4>
                        <p className="text-xs text-primary-500 mt-1">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
