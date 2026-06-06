import { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Clock,
  Calendar,
  Search,
  BookOpen,
  ChevronRight,
  Play,
  Award,
  AlertCircle,
  CheckCircle2,
  Trophy,
  AlertTriangle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import { useAppStore, useAuthStore } from '@/store';
import type { Exam } from '@/types';
import { cn } from '@/lib/utils';

type TabValue = 'all' | 'not_started' | 'in_progress' | 'ended';

export default function ExamList() {
  const { user } = useAuthStore();
  const { exams, courses, examAttempts, fetchExams, fetchCourses, fetchExamAttempts } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchExams();
    fetchCourses();
    if (user?.id) fetchExamAttempts({ studentId: user.id });
  }, [fetchExams, fetchCourses, fetchExamAttempts, user?.id]);

  const courseMap = useMemo(() => {
    const map: Record<string, string> = {};
    courses.forEach((c) => (map[c.id] = c.title));
    return map;
  }, [courses]);

  const userAttemptsMap = useMemo(() => {
    const map: Record<string, any> = {};
    examAttempts
      .filter((a) => a.userId === user?.id)
      .forEach((a) => (map[a.examId] = a));
    return map;
  }, [user?.id, examAttempts]);

  const getExamStatus = (exam: Exam) => {
    const attempt = userAttemptsMap[exam.id];
    const now = new Date();
    const start = exam.startTime ? new Date(exam.startTime) : null;
    const end = exam.endTime ? new Date(exam.endTime) : null;

    if (attempt) {
      if (attempt.status === 'submitted') {
        return { label: '已完成', variant: 'success' as const, icon: CheckCircle2 };
      }
      if (attempt.status === 'in_progress') {
        return { label: '进行中', variant: 'warning' as const, icon: Play };
      }
    }

    if (exam.status === 'draft') {
      return { label: '未发布', variant: 'secondary' as const, icon: AlertCircle };
    }

    if (start && now < start) {
      return { label: '未开始', variant: 'warning' as const, icon: Clock };
    }

    if (start && end && now >= start && now <= end) {
      return { label: '考试中', variant: 'danger' as const, icon: Play };
    }

    return { label: '已结束', variant: 'secondary' as const, icon: CheckCircle2 };
  };

  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (courseMap[e.courseId] || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (activeTab === 'all') return true;

      const status = getExamStatus(e);
      if (activeTab === 'not_started') return status.label === '未开始' || status.label === '未发布';
      if (activeTab === 'in_progress') return status.label === '考试中' || status.label === '进行中';
      if (activeTab === 'ended') return status.label === '已结束' || status.label === '已完成';

      return true;
    });
  }, [activeTab, searchQuery, courseMap, exams, getExamStatus]);

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}小时${mins > 0 ? `${mins}分钟` : ''}` : `${mins}分钟`;
  };

  const getStatusCount = (tab: TabValue) => {
    return exams.filter((e) => {
      const status = getExamStatus(e);
      if (tab === 'all') return true;
      if (tab === 'not_started') return status.label === '未开始' || status.label === '未发布';
      if (tab === 'in_progress') return status.label === '考试中' || status.label === '进行中';
      if (tab === 'ended') return status.label === '已结束' || status.label === '已完成';
      return false;
    }).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-surface-darker dark:via-surface-dark dark:to-surface-darker p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary-600" />
            在线考试
          </h1>
          <p className="text-primary-600 dark:text-primary-300">
            参加课程考试，检验学习成果，获取结业证书
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: '全部考试',
              count: getStatusCount('all'),
              icon: FileText,
              color: 'text-primary-600',
              bg: 'bg-primary-100 dark:bg-primary-900',
            },
            {
              label: '未开始',
              count: getStatusCount('not_started'),
              icon: Clock,
              color: 'text-accent-yellow',
              bg: 'bg-accent-yellow/15',
            },
            {
              label: '进行中',
              count: getStatusCount('in_progress'),
              icon: Play,
              color: 'text-accent-orange',
              bg: 'bg-accent-orange/15',
            },
            {
              label: '已完成',
              count: getStatusCount('ended'),
              icon: CheckCircle2,
              color: 'text-accent-teal',
              bg: 'bg-accent-teal/15',
            },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className={cn('p-3 rounded-lg', stat.bg)}>
                  <stat.icon className={cn('h-6 w-6', stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-900 dark:text-white">{stat.count}</p>
                  <p className="text-sm text-primary-600 dark:text-primary-300">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle className="text-lg">考试列表</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-400" />
                <Input
                  placeholder="搜索考试名称或课程..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs defaultValue="all" value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
              <TabsList>
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="not_started">未开始</TabsTrigger>
                <TabsTrigger value="in_progress">进行中</TabsTrigger>
                <TabsTrigger value="ended">已结束</TabsTrigger>
              </TabsList>

              {(['all', 'not_started', 'in_progress', 'ended'] as const).map((tab) => (
                <TabsContent key={tab} value={tab} className="mt-4">
                  {filteredExams.length === 0 ? (
                    <div className="text-center py-16 text-primary-500 dark:text-primary-400">
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>暂无考试记录</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>考试名称</TableHead>
                          <TableHead>所属课程</TableHead>
                          <TableHead>考试时长</TableHead>
                          <TableHead>考试时间</TableHead>
                          <TableHead>总分/及格</TableHead>
                          <TableHead>状态</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredExams.map((exam) => {
                          const status = getExamStatus(exam);
                          const StatusIcon = status.icon;
                          const attempt = userAttemptsMap[exam.id];
                          const hasAntiCheat = exam.enableAntiCheat;

                          return (
                            <TableRow key={exam.id} className="group">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900">
                                    <FileText className="h-4 w-4 text-primary-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-primary-900 dark:text-white">{exam.title}</p>
                                    <p className="text-xs text-primary-500 dark:text-primary-400">
                                      {exam.questionCount || 0} 道题
                                      {hasAntiCheat && (
                                        <span className="ml-2 inline-flex items-center gap-1 text-accent-orange">
                                          <AlertTriangle className="h-3 w-3" />
                                          防作弊
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-sm text-primary-700 dark:text-primary-200">
                                  <BookOpen className="h-4 w-4 text-primary-400" />
                                  {courseMap[exam.courseId] || '-'}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-sm text-primary-700 dark:text-primary-200">
                                  <Clock className="h-4 w-4 text-primary-400" />
                                  {formatDuration(exam.duration)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm text-primary-700 dark:text-primary-200">
                                    {formatDateTime(exam.startTime)}
                                  </p>
                                  <p className="text-xs text-primary-500 dark:text-primary-400">
                                    至 {formatDateTime(exam.endTime)}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                {attempt && attempt.totalScore !== undefined ? (
                                  <div>
                                    <p className="text-sm font-semibold text-primary-900 dark:text-white">
                                      {attempt.totalScore}/{exam.totalScore}
                                    </p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <Award
                                        className={cn(
                                          'h-3 w-3',
                                          attempt.isPassed ? 'text-accent-teal' : 'text-accent-orange',
                                        )}
                                      />
                                      <span
                                        className={cn(
                                          'text-xs',
                                          attempt.isPassed ? 'text-accent-teal' : 'text-accent-orange',
                                        )}
                                      >
                                        {attempt.isPassed ? '已通过' : '未通过'}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-sm text-primary-600 dark:text-primary-300">
                                    {exam.totalScore}分 / {exam.passScore}分
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                                  <StatusIcon className="h-3 w-3" />
                                  {status.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {attempt && attempt.status === 'submitted' ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="group-hover:bg-primary-100 dark:group-hover:bg-primary-800"
                                  >
                                    <Award className="h-4 w-4 mr-1" />
                                    查看成绩
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                ) : attempt && attempt.status === 'in_progress' ? (
                                  <Button variant="default" size="sm">
                                    <Play className="h-4 w-4 mr-1" />
                                    继续考试
                                  </Button>
                                ) : status.label === '考试中' ? (
                                  <Button variant="default" size="sm">
                                    <Play className="h-4 w-4 mr-1" />
                                    进入考试
                                  </Button>
                                ) : (
                                  <Button variant="outline" size="sm" disabled>
                                    <Clock className="h-4 w-4 mr-1" />
                                    {status.label === '未发布' ? '未开放' : '等待开始'}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
