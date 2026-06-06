import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Send,
  User,
  Calendar,
  Award,
  MessageSquare,
  Save,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Button,
  Textarea,
  Input,
} from '@/components/ui';
import { mockAssignments, mockAssignmentSubmissions, mockCourses, mockUsers } from '@/data';
import { useAuthStore } from '@/store';
import type { Question as CourseQuestion } from '@/data/mockCourses';
import { cn } from '@/lib/utils';

export default function AssignmentDetail() {
  const { user } = useAuthStore();
  const assignment = mockAssignments[0];
  const course = mockCourses.find((c) => c.id === assignment.courseId);

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher' || user?.role === 'assistant';

  const studentSubmission = useMemo(() => {
    return mockAssignmentSubmissions.find(
      (s) => (s.studentId === user?.id || s.userId === user?.id) && s.assignmentId === assignment.id,
    );
  }, [user?.id, assignment.id]);

  const allSubmissions = useMemo(() => {
    return mockAssignmentSubmissions.filter((s) => s.assignmentId === assignment.id);
  }, [assignment.id]);

  const questions = useMemo(() => {
    if (!course) return [];
    return assignment.questions
      ?.map((q) => course.questions.find((cq) => cq.id === q.questionId))
      .filter(Boolean) as CourseQuestion[];
  }, [assignment, course]);

  const [answers, setAnswers] = useState<Record<string, string | string[]>>(() => {
    const initial: Record<string, string | string[]> = {};
    if (studentSubmission?.answerMap) {
      Object.assign(initial, studentSubmission.answerMap);
    } else {
      questions.forEach((q) => {
        initial[q.id] = q.type === 'multiple' ? [] : '';
      });
    }
    return initial;
  });

  const [subjectiveScores, setSubjectiveScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    if (studentSubmission) {
      studentSubmission.answers.forEach((a) => {
        if (a.studentScore !== undefined) {
          initial[a.questionId] = a.studentScore;
        }
      });
    }
    return initial;
  });

  const [gradingComments, setGradingComments] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (studentSubmission) {
      studentSubmission.answers.forEach((a) => {
        if (a.gradingComment) {
          initial[a.questionId] = a.gradingComment;
        }
      });
    }
    return initial;
  });

  const [generalFeedback, setGeneralFeedback] = useState(studentSubmission?.feedback || '');

  const handleSingleChoice = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleMultipleChoice = (questionId: string, option: string) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) || [];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [questionId]: updated };
    });
  };

  const handleJudge = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubjective = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const calculateObjectiveScore = () => {
    let score = 0;
    let maxScore = 0;
    questions.forEach((q) => {
      if (q.type !== 'subjective') {
        maxScore += q.score;
        const userAnswer = answers[q.id];
        if (q.type === 'single' || q.type === 'judge') {
          if (userAnswer === q.answer) score += q.score;
        } else if (q.type === 'multiple') {
          const correct = q.answer as string[];
          const userAns = (userAnswer as string[]) || [];
          if (
            correct.length === userAns.length &&
            correct.every((a) => userAns.includes(a))
          ) {
            score += q.score;
          }
        }
      }
    });
    return { score, maxScore };
  };

  const calculateTotalScore = () => {
    const objective = calculateObjectiveScore();
    let subjectiveScore = 0;
    let subjectiveMax = 0;
    questions.forEach((q) => {
      if (q.type === 'subjective') {
        subjectiveMax += q.score;
        subjectiveScore += subjectiveScores[q.id] || 0;
      }
    });
    return {
      total: objective.score + subjectiveScore,
      max: objective.maxScore + subjectiveMax,
      objective: objective.score,
      objectiveMax: objective.maxScore,
      subjective: subjectiveScore,
      subjectiveMax,
    };
  };

  const getGradingTimeRemaining = () => {
    if (!studentSubmission?.submittedAt) return null;
    const submitted = new Date(studentSubmission.submittedAt);
    const now = new Date();
    const diffMs = now.getTime() - submitted.getTime();
    const hoursLeft = 48 - diffMs / (1000 * 60 * 60);
    return { hours: Math.max(0, hoursLeft), isOverdue: hoursLeft < 0 };
  };

  const gradingTime = getGradingTimeRemaining();
  const scores = calculateTotalScore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-surface-darker dark:via-surface-dark dark:to-surface-darker p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary-900 dark:text-white flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary-600" />
              {assignment.title}
            </h1>
            <p className="text-sm text-primary-600 dark:text-primary-300 mt-1">
              {course?.title || '未关联课程'}
            </p>
          </div>
          {isTeacher && allSubmissions.length > 0 && gradingTime && (
            <div
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border',
                gradingTime.isOverdue
                  ? 'bg-accent-orange/10 border-accent-orange/30 text-accent-orange'
                  : 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/30 dark:border-primary-700 dark:text-primary-200',
              )}
            >
              {gradingTime.isOverdue ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {gradingTime.isOverdue
                  ? '批改超时！已自动升级至讲师'
                  : `剩余批改时间: ${Math.floor(gradingTime.hours)}小时${Math.floor((gradingTime.hours % 1) * 60)}分`}
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">作业信息</CardTitle>
                  <CardDescription className="mt-1">{assignment.description}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-300 mb-1">
                    <Calendar className="h-4 w-4" />
                    截止: {new Date(assignment.deadline || '').toLocaleString('zh-CN')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-300">
                    <Award className="h-4 w-4" />
                    总分: {assignment.totalScore} 分
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {isTeacher && allSubmissions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    学员: {mockUsers.find((u) => u.id === allSubmissions[0].studentId || u.id === allSubmissions[0].userId)?.name || '未知'}
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary-900 dark:text-white">
                        {scores.total}/{scores.max}
                      </p>
                      <p className="text-xs text-primary-500 dark:text-primary-400">总得分</p>
                    </div>
                    <Badge variant={scores.total / scores.max >= 0.6 ? 'success' : 'danger'}>
                      {scores.total / scores.max >= 0.6 ? '已通过' : '未通过'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          <div className="space-y-4">
            {questions.map((q, index) => {
              const isSubjective = q.type === 'subjective';
              const userAnswer = answers[q.id];
              const isCorrect = !isSubjective && checkAnswer(q, userAnswer);
              const studentAns = studentSubmission?.answers.find((a) => a.questionId === q.id);

              return (
                <Card key={q.id}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Badge variant="secondary" className="shrink-0">
                          {index + 1}
                        </Badge>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={isSubjective ? 'warning' : 'default'}>
                              {q.type === 'single'
                                ? '单选题'
                                : q.type === 'multiple'
                                ? '多选题'
                                : q.type === 'judge'
                                ? '判断题'
                                : '主观题'}
                            </Badge>
                            <span className="text-sm text-primary-500 dark:text-primary-400">
                              {q.score} 分
                            </span>
                          </div>
                          <p className="text-base font-medium text-primary-900 dark:text-white">
                            {q.content}
                          </p>
                        </div>
                      </div>
                      {(isTeacher || (studentSubmission && studentSubmission.gradingStatus !== 'pending')) &&
                        !isSubjective && (
                          <Badge variant={isCorrect ? 'success' : 'danger'} className="shrink-0">
                            {isCorrect ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                正确 +{q.score}
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                错误 +0
                              </>
                            )}
                          </Badge>
                        )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {q.type === 'single' && q.options && (
                      <div className="space-y-2">
                        {q.options.map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => !studentSubmission && isStudent && handleSingleChoice(q.id, opt.key)}
                            disabled={!!studentSubmission || isTeacher}
                            className={cn(
                              'w-full text-left p-3 rounded-lg border transition-all',
                              userAnswer === opt.key
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                                : 'border-primary-200 hover:border-primary-300 dark:border-primary-700 dark:hover:border-primary-600',
                              !studentSubmission && isStudent && 'cursor-pointer',
                              (studentSubmission || isTeacher) &&
                                opt.key === q.answer &&
                                'bg-accent-teal/10 border-accent-teal',
                              (studentSubmission || isTeacher) &&
                                userAnswer === opt.key &&
                                opt.key !== q.answer &&
                                'bg-accent-orange/10 border-accent-orange',
                            )}
                          >
                            <span className="font-medium mr-2 text-primary-600 dark:text-primary-300">
                              {opt.key}.
                            </span>
                            <span className="text-primary-800 dark:text-primary-100">{opt.content}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {q.type === 'multiple' && q.options && (
                      <div className="space-y-2">
                        {q.options.map((opt) => {
                          const selected = Array.isArray(userAnswer) && userAnswer.includes(opt.key);
                          const isCorrectOpt = Array.isArray(q.answer) && q.answer.includes(opt.key);
                          return (
                            <button
                              key={opt.key}
                              onClick={() => !studentSubmission && isStudent && handleMultipleChoice(q.id, opt.key)}
                              disabled={!!studentSubmission || isTeacher}
                              className={cn(
                                'w-full text-left p-3 rounded-lg border transition-all',
                                selected
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                                  : 'border-primary-200 hover:border-primary-300 dark:border-primary-700 dark:hover:border-primary-600',
                                !studentSubmission && isStudent && 'cursor-pointer',
                                (studentSubmission || isTeacher) &&
                                  isCorrectOpt &&
                                  'bg-accent-teal/10 border-accent-teal',
                                (studentSubmission || isTeacher) &&
                                  selected &&
                                  !isCorrectOpt &&
                                  'bg-accent-orange/10 border-accent-orange',
                              )}
                            >
                              <span className="font-medium mr-2 text-primary-600 dark:text-primary-300">
                                {opt.key}.
                              </span>
                              <span className="text-primary-800 dark:text-primary-100">{opt.content}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {q.type === 'judge' && (
                      <div className="flex gap-3">
                        {['正确', '错误'].map((val) => (
                          <button
                            key={val}
                            onClick={() => !studentSubmission && isStudent && handleJudge(q.id, val)}
                            disabled={!!studentSubmission || isTeacher}
                            className={cn(
                              'flex-1 p-3 rounded-lg border transition-all text-center font-medium',
                              userAnswer === val
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                                : 'border-primary-200 hover:border-primary-300 dark:border-primary-700 dark:hover:border-primary-600',
                              !studentSubmission && isStudent && 'cursor-pointer',
                              (studentSubmission || isTeacher) &&
                                val === q.answer &&
                                'bg-accent-teal/10 border-accent-teal text-accent-teal',
                              (studentSubmission || isTeacher) &&
                                userAnswer === val &&
                                val !== q.answer &&
                                'bg-accent-orange/10 border-accent-orange text-accent-orange',
                            )}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    )}

                    {isSubjective && (
                      <div className="space-y-3">
                        {isStudent && !studentSubmission ? (
                          <Textarea
                            placeholder="请输入你的答案..."
                            className="min-h-[150px] resize-y"
                            value={(userAnswer as string) || ''}
                            onChange={(e) => handleSubjective(q.id, e.target.value)}
                          />
                        ) : (
                          <div className="rounded-lg border border-primary-200 dark:border-primary-700 p-4 bg-primary-50/50 dark:bg-primary-900/20">
                            <p className="text-sm text-primary-700 dark:text-primary-200 whitespace-pre-wrap leading-relaxed">
                              {(studentAns?.studentAnswer as string) || '未作答'}
                            </p>
                          </div>
                        )}

                        {isTeacher && (
                          <div className="grid sm:grid-cols-2 gap-4 pt-2">
                            <div>
                              <label className="block text-sm font-medium text-primary-700 dark:text-primary-200 mb-2">
                                评分 (满分 {q.score} 分)
                              </label>
                              <Input
                                type="number"
                                min={0}
                                max={q.score}
                                value={subjectiveScores[q.id] || 0}
                                onChange={(e) =>
                                  setSubjectiveScores((prev) => ({
                                    ...prev,
                                    [q.id]: Math.min(q.score, Math.max(0, Number(e.target.value))),
                                  }))
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-primary-700 dark:text-primary-200 mb-2">
                                评语
                              </label>
                              <Input
                                placeholder="本题评语..."
                                value={gradingComments[q.id] || ''}
                                onChange={(e) =>
                                  setGradingComments((prev) => ({ ...prev, [q.id]: e.target.value }))
                                }
                              />
                            </div>
                          </div>
                        )}

                        {(isTeacher || (studentSubmission && studentSubmission.gradingStatus !== 'pending')) &&
                          studentAns?.gradingComment && (
                            <div className="rounded-lg bg-primary-50 dark:bg-primary-900/30 p-3">
                              <p className="text-xs font-medium text-primary-600 dark:text-primary-300 mb-1">
                                教师评语:
                              </p>
                              <p className="text-sm text-primary-800 dark:text-primary-100">
                                {studentAns.gradingComment}
                              </p>
                            </div>
                          )}

                        {isTeacher && q.analysis && (
                          <div className="rounded-lg bg-accent-teal/10 border border-accent-teal/30 p-3">
                            <p className="text-xs font-medium text-accent-teal mb-1">参考答案:</p>
                            <p className="text-sm text-primary-800 dark:text-primary-100 whitespace-pre-wrap">
                              {q.answer as string}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {!isSubjective && q.analysis && (isTeacher || studentSubmission) && (
                      <div className="mt-3 rounded-lg bg-primary-50 dark:bg-primary-900/30 p-3">
                        <p className="text-xs font-medium text-primary-600 dark:text-primary-300 mb-1">
                          答案解析:
                        </p>
                        <p className="text-sm text-primary-700 dark:text-primary-200">{q.analysis}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {isTeacher && allSubmissions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  总体评语
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="请输入对本次作业的总体评价和建议..."
                  className="min-h-[100px]"
                  value={generalFeedback}
                  onChange={(e) => setGeneralFeedback(e.target.value)}
                />
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between pt-4">
            <div>
              {isStudent ? (
                <div className="flex items-center gap-3">
                  <div className="text-sm text-primary-600 dark:text-primary-300">
                    客观题得分:{' '}
                    <span className="font-semibold text-primary-900 dark:text-white">
                      {calculateObjectiveScore().score}/{calculateObjectiveScore().maxScore}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <div className="text-sm text-primary-600 dark:text-primary-300">
                    客观题:{' '}
                    <span className="font-semibold text-primary-900 dark:text-white">
                      {scores.objective}/{scores.objectiveMax}
                    </span>
                  </div>
                  <div className="text-sm text-primary-600 dark:text-primary-300">
                    主观题:{' '}
                    <span className="font-semibold text-primary-900 dark:text-white">
                      {scores.subjective}/{scores.subjectiveMax}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-primary-900 dark:text-white">
                    总分: {scores.total}/{scores.max}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Save className="h-4 w-4" />
                保存草稿
              </Button>
              {isStudent ? (
                <Button variant="default" disabled={!!studentSubmission}>
                  <Send className="h-4 w-4" />
                  {studentSubmission ? '已提交' : '提交作业'}
                </Button>
              ) : (
                <Button variant="default">
                  <CheckCircle2 className="h-4 w-4" />
                  提交批改
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function checkAnswer(question: CourseQuestion, userAnswer: string | string[] | undefined): boolean {
  if (!userAnswer) return false;
  if (question.type === 'single' || question.type === 'judge') {
    return userAnswer === question.answer;
  }
  if (question.type === 'multiple') {
    const correct = question.answer as string[];
    const userAns = userAnswer as string[];
    return (
      correct.length === userAns.length && correct.every((a) => userAns.includes(a))
    );
  }
  return false;
}
