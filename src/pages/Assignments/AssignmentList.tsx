import { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Search,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui';
import { useAppStore, useAuthStore } from '@/store';
import type { Assignment } from '@/types';
import { cn } from '@/lib/utils';

type TabValue = 'all' | 'pending_submit' | 'pending_grade' | 'completed';

export default function AssignmentList() {
  const { user } = useAuthStore();
  const { assignments, courses, assignmentSubmissions, fetchAssignments, fetchCourses, fetchAssignmentSubmissions } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher' || user?.role === 'assistant';

  useEffect(() => {
    fetchAssignments();
    fetchCourses();
  }, [fetchAssignments, fetchCourses]);

  const courseMap = useMemo(() => {
    const map: Record<string, string> = {};
    courses.forEach((c) => (map[c.id] = c.title));
    return map;
  }, [courses]);

  const studentSubmissionsMap = useMemo(() => {
    const map: Record<string, any> = {};
    if (isStudent) {
      assignmentSubmissions
        .filter((s) => s.studentId === user?.id || s.userId === user?.id)
        .forEach((s) => (map[s.assignmentId] = s));
    }
    return map;
  }, [isStudent, user?.id, assignmentSubmissions]);

  const allSubmissionsMap = useMemo(() => {
    const map: Record<string, any[]> = {};
    assignmentSubmissions.forEach((s) => {
      if (!map[s.assignmentId]) map[s.assignmentId] = [];
      map[s.assignmentId].push(s);
    });
    return map;
  }, [assignmentSubmissions]);

  const getStudentStatus = (assignment: Assignment) => {
    const submission = studentSubmissionsMap[assignment.id];
    if (!submission) {
      const isOverdue = new Date(assignment.deadline || '') < new Date();
      return isOverdue
        ? { label: '已逾期', variant: 'danger' as const, icon: XCircle }
        : { label: '待提交', variant: 'warning' as const, icon: Clock };
    }
    if (submission.gradingStatus === 'pending') {
      return { label: '待批改', variant: 'warning' as const, icon: AlertCircle };
    }
    return {
      label: submission.isPassed ? '已通过' : '未通过',
      variant: submission.isPassed ? ('success' as const) : ('danger' as const),
      icon: CheckCircle2,
    };
  };

  const getTeacherStatus = (assignment: Assignment) => {
    const submissions = allSubmissionsMap[assignment.id] || [];
    const pending = submissions.filter((s) => s.gradingStatus === 'pending').length;
    if (pending > 0) {
      return { label: `${pending}份待批改`, variant: 'warning' as const, icon: AlertCircle };
    }
    if (submissions.length === 0) {
      return { label: '暂无提交', variant: 'secondary' as const, icon: FileText };
    }
    return { label: '全部批改完成', variant: 'success' as const, icon: CheckCircle2 };
  };

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (courseMap[a.courseId] || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (activeTab === 'all') return true;

      if (isStudent) {
        const status = getStudentStatus(a);
        if (activeTab === 'pending_submit') return status.label === '待提交';
        if (activeTab === 'pending_grade') return status.label === '待批改';
        if (activeTab === 'completed')
          return status.label === '已通过' || status.label === '未通过' || status.label === '已逾期';
      } else {
        const status = getTeacherStatus(a);
        if (activeTab === 'pending_submit') return status.label === '暂无提交';
        if (activeTab === 'pending_grade') return status.label.includes('待批改');
        if (activeTab === 'completed') return status.label === '全部批改完成';
      }
      return true;
    });
  }, [activeTab, searchQuery, courseMap, isStudent, assignments, getStudentStatus, getTeacherStatus]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysRemaining = (deadline?: string) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-surface-darker dark:via-surface-dark dark:to-surface-darker p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2 flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary-600" />
            作业管理
          </h1>
          <p className="text-primary-600 dark:text-primary-300">
            {isStudent ? '查看、提交作业，跟踪批改进度' : '管理作业布置，查看并批改学员提交'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: '全部作业',
              count: assignments.length,
              icon: FileText,
              color: 'text-primary-600',
              bg: 'bg-primary-100 dark:bg-primary-900',
            },
            {
              label: isStudent ? '待提交' : '暂无提交',
              count: assignments.filter((a) =>
                isStudent
                  ? getStudentStatus(a).label === '待提交'
                  : getTeacherStatus(a).label === '暂无提交',
              ).length,
              icon: Clock,
              color: 'text-accent-yellow',
              bg: 'bg-accent-yellow/15',
            },
            {
              label: '待批改',
              count: assignments.filter((a) =>
                isStudent
                  ? getStudentStatus(a).label === '待批改'
                  : getTeacherStatus(a).label.includes('待批改'),
              ).length,
              icon: AlertCircle,
              color: 'text-accent-orange',
              bg: 'bg-accent-orange/15',
            },
            {
              label: '已完成',
              count: assignments.filter((a) =>
                isStudent
                  ? getStudentStatus(a).label === '已通过' || getStudentStatus(a).label === '未通过'
                  : getTeacherStatus(a).label === '全部批改完成',
              ).length,
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
              <CardTitle className="text-lg">作业列表</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-400" />
                <Input
                  placeholder="搜索作业名称或课程..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as TabValue)}
            >
              <TabsList>
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="pending_submit">
                  {isStudent ? '待提交' : '暂无提交'}
                </TabsTrigger>
                <TabsTrigger value="pending_grade">待批改</TabsTrigger>
                <TabsTrigger value="completed">已完成</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <AssignmentTable
                  assignments={filteredAssignments}
                  courseMap={courseMap}
                  studentSubmissionsMap={studentSubmissionsMap}
                  allSubmissionsMap={allSubmissionsMap}
                  isStudent={isStudent}
                  isTeacher={isTeacher}
                  getStudentStatus={getStudentStatus}
                  getTeacherStatus={getTeacherStatus}
                  formatDate={formatDate}
                  getDaysRemaining={getDaysRemaining}
                />
              </TabsContent>
              <TabsContent value="pending_submit" className="mt-4">
                <AssignmentTable
                  assignments={filteredAssignments}
                  courseMap={courseMap}
                  studentSubmissionsMap={studentSubmissionsMap}
                  allSubmissionsMap={allSubmissionsMap}
                  isStudent={isStudent}
                  isTeacher={isTeacher}
                  getStudentStatus={getStudentStatus}
                  getTeacherStatus={getTeacherStatus}
                  formatDate={formatDate}
                  getDaysRemaining={getDaysRemaining}
                />
              </TabsContent>
              <TabsContent value="pending_grade" className="mt-4">
                <AssignmentTable
                  assignments={filteredAssignments}
                  courseMap={courseMap}
                  studentSubmissionsMap={studentSubmissionsMap}
                  allSubmissionsMap={allSubmissionsMap}
                  isStudent={isStudent}
                  isTeacher={isTeacher}
                  getStudentStatus={getStudentStatus}
                  getTeacherStatus={getTeacherStatus}
                  formatDate={formatDate}
                  getDaysRemaining={getDaysRemaining}
                />
              </TabsContent>
              <TabsContent value="completed" className="mt-4">
                <AssignmentTable
                  assignments={filteredAssignments}
                  courseMap={courseMap}
                  studentSubmissionsMap={studentSubmissionsMap}
                  allSubmissionsMap={allSubmissionsMap}
                  isStudent={isStudent}
                  isTeacher={isTeacher}
                  getStudentStatus={getStudentStatus}
                  getTeacherStatus={getTeacherStatus}
                  formatDate={formatDate}
                  getDaysRemaining={getDaysRemaining}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface AssignmentTableProps {
  assignments: Assignment[];
  courseMap: Record<string, string>;
  studentSubmissionsMap: Record<string, any>;
  allSubmissionsMap: Record<string, any[]>;
  isStudent: boolean;
  isTeacher: boolean;
  getStudentStatus: (a: Assignment) => { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'; icon: typeof FileText };
  getTeacherStatus: (a: Assignment) => { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'; icon: typeof FileText };
  formatDate: (d?: string) => string;
  getDaysRemaining: (d?: string) => number | null;
}

function AssignmentTable({
  assignments,
  courseMap,
  studentSubmissionsMap,
  allSubmissionsMap,
  isStudent,
  isTeacher,
  getStudentStatus,
  getTeacherStatus,
  formatDate,
  getDaysRemaining,
}: AssignmentTableProps) {
  if (assignments.length === 0) {
    return (
      <div className="text-center py-16 text-primary-500 dark:text-primary-400">
        <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p>暂无作业记录</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>作业名称</TableHead>
          <TableHead>所属课程</TableHead>
          <TableHead>截止时间</TableHead>
          <TableHead>分值</TableHead>
          {isStudent && <TableHead>得分</TableHead>}
          {isTeacher && <TableHead>提交情况</TableHead>}
          <TableHead>状态</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((assignment) => {
          const status = isStudent ? getStudentStatus(assignment) : getTeacherStatus(assignment);
          const StatusIcon = status.icon;
          const submission = studentSubmissionsMap[assignment.id];
          const submissions = allSubmissionsMap[assignment.id] || [];
          const daysRemaining = getDaysRemaining(assignment.deadline);
          const isUrgent = daysRemaining !== null && daysRemaining <= 3 && daysRemaining > 0;
          const isOverdue = daysRemaining !== null && daysRemaining < 0;

          return (
            <TableRow key={assignment.id} className="group">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900">
                    <FileText className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-primary-900 dark:text-white">{assignment.title}</p>
                    <p className="text-xs text-primary-500 dark:text-primary-400 line-clamp-1 max-w-[200px]">
                      {assignment.description}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm text-primary-700 dark:text-primary-200">
                  <BookOpen className="h-4 w-4 text-primary-400" />
                  {courseMap[assignment.courseId] || '-'}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm text-primary-700 dark:text-primary-200">
                    {formatDate(assignment.deadline)}
                  </p>
                  {daysRemaining !== null && (
                    <p
                      className={cn(
                        'text-xs mt-0.5',
                        isOverdue
                          ? 'text-accent-orange'
                          : isUrgent
                          ? 'text-accent-yellow'
                          : 'text-primary-500 dark:text-primary-400',
                      )}
                    >
                      {isOverdue
                        ? '已逾期'
                        : daysRemaining === 0
                        ? '今天截止'
                        : `还剩 ${daysRemaining} 天`}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-primary-700 dark:text-primary-200">
                  {assignment.totalScore} 分
                </span>
              </TableCell>
              {isStudent && (
                <TableCell>
                  {submission ? (
                    <div>
                      <p className="text-sm font-semibold text-primary-900 dark:text-white">
                        {submission.totalScore}/{submission.maxScore}
                      </p>
                      <div className="w-20 h-1.5 bg-primary-100 dark:bg-primary-800 rounded-full mt-1 overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            submission.isPassed ? 'bg-accent-teal' : 'bg-accent-orange',
                          )}
                          style={{
                            width: `${(submission.totalScore / submission.maxScore) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-primary-400">-</span>
                  )}
                </TableCell>
              )}
              {isTeacher && (
                <TableCell>
                  <span className="text-sm text-primary-700 dark:text-primary-200">
                    {submissions.length} 份提交
                  </span>
                </TableCell>
              )}
              <TableCell>
                <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" className="group-hover:bg-primary-100 dark:group-hover:bg-primary-800">
                  {isStudent
                    ? submission
                      ? submission.gradingStatus === 'pending'
                        ? '查看提交'
                        : '查看详情'
                      : '提交作业'
                    : '查看批改'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
