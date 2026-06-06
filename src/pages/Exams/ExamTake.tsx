import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  XCircle,
  Clock,
  MonitorX,
  Send,
  Trophy,
  Award,
  AlertCircle,
  FileText,
  Target,
  X,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Textarea,
} from '@/components/ui';
import { mockExams, mockCourses, mockExamAttempts } from '@/data';
import { useAuthStore } from '@/store';
import { gradeQuiz } from '@/utils/grading';
import type { Question, UserAnswer } from '@/types';
import type { Question as CourseQuestion } from '@/data/mockCourses';
import { cn } from '@/lib/utils';

export default function ExamTake() {
  const { user } = useAuthStore();
  const exam = mockExams[0];
  const course = mockCourses.find((c) => c.id === exam.courseId);

  const questions: Question[] = useMemo(() => {
    if (!course) return [];
    return course.questions.slice(0, 10).map((q) => ({
      id: q.id,
      type: q.type as Question['type'],
      content: q.content,
      options: q.options?.map((o) => o.content),
      answer: q.answer,
      correctAnswer: q.answer,
      score: q.score,
      analysis: q.analysis,
    }));
  }, [course]);

  const questionsWithKeys: (Question & { optionsWithKeys?: { key: string; content: string }[] })[] = useMemo(() => {
    if (!course) return [];
    return course.questions.slice(0, 10).map((q: CourseQuestion) => ({
      id: q.id,
      type: q.type as Question['type'],
      content: q.content,
      options: q.options?.map((o) => o.content),
      optionsWithKeys: q.options,
      answer: q.answer,
      correctAnswer: q.answer,
      score: q.score,
      analysis: q.analysis,
    }));
  }, [course]);

  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(exam.duration * 60);
  const [screenSwitchCount, setScreenSwitchCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cheatingWarning, setCheatingWarning] = useState(false);

  const previousAttempt = useMemo(() => {
    return mockExamAttempts.find((a) => a.examId === exam.id && a.userId === user?.id);
  }, [exam.id, user?.id]);

  const gradingResult = useMemo(() => {
    if (!isSubmitted) return null;
    const userAnswers: UserAnswer[] = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));
    return gradeQuiz(questions, userAnswers);
  }, [isSubmitted, answers, questions]);

  const answeredCount = Object.keys(answers).filter((k) => {
    const v = answers[k];
    return Array.isArray(v) ? v.length > 0 : v && v.toString().trim() !== '';
  }).length;

  const totalScore = questions.reduce((sum, q) => sum + q.score, 0);

  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && !isSubmitted) {
      setScreenSwitchCount((prev) => {
        const newCount = prev + 1;
        if (newCount >= (exam.maxScreenSwitches || 3)) {
          setCheatingWarning(true);
          setTimeout(() => handleSubmit(), 2000);
        } else {
          setShowWarningModal(true);
        }
        return newCount;
      });
    }
  }, [isSubmitted, exam.maxScreenSwitches]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [handleVisibilityChange]);

  const handleSingleChoice = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleMultipleChoice = (questionId: string, value: string) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) || [];
      const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [questionId]: updated };
    });
  };

  const handleJudge = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubjective = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const toggleMark = (questionId: string) => {
    setMarkedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    setShowConfirmModal(false);
    setIsSubmitted(true);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (index: number) => {
    const q = questions[index];
    const answer = answers[q.id];
    const isAnswered = Array.isArray(answer) ? answer.length > 0 : answer && answer.toString().trim() !== '';
    const isMarked = markedQuestions.has(q.id);
    const isCurrent = currentIndex === index;
    return { isAnswered, isMarked, isCurrent };
  };

  const currentQuestion = questionsWithKeys[currentIndex];

  if (isSubmitted && gradingResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-surface-darker dark:via-surface-dark dark:to-surface-darker p-6">
        <div className="mx-auto max-w-4xl">
          <Card className="overflow-hidden">
            <div className="bg-gradient-primary p-8 text-white text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-accent-yellow" />
              <h1 className="text-3xl font-bold mb-2">考试完成！</h1>
              <p className="text-primary-100">你的答卷已成功提交</p>
            </div>
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 rounded-xl bg-primary-50 dark:bg-primary-900/30">
                  <p className="text-3xl font-bold text-primary-700 dark:text-white">
                    {gradingResult.totalScore}
                  </p>
                  <p className="text-sm text-primary-500 dark:text-primary-400">总得分</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-primary-50 dark:bg-primary-900/30">
                  <p className="text-3xl font-bold text-primary-700 dark:text-white">
                    {gradingResult.maxScore}
                  </p>
                  <p className="text-sm text-primary-500 dark:text-primary-400">满分</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-accent-teal/10">
                  <p className="text-3xl font-bold text-accent-teal">
                    {Math.round(gradingResult.accuracy * 100)}%
                  </p>
                  <p className="text-sm text-primary-500 dark:text-primary-400">正确率</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-accent-teal/10">
                  <div className="flex items-center justify-center gap-2">
                    <Award className={cn("h-8 w-8", gradingResult.totalScore >= exam.passScore ? "text-accent-teal" : "text-accent-orange")} />
                    <p className={cn("text-2xl font-bold", gradingResult.totalScore >= exam.passScore ? "text-accent-teal" : "text-accent-orange")}>
                      {gradingResult.totalScore >= exam.passScore ? "通过" : "未通过"}
                    </p>
                  </div>
                  <p className="text-sm text-primary-500 dark:text-primary-400 mt-1">及格线 {exam.passScore} 分</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/30 mb-6">
                <Target className="h-5 w-5 text-primary-600" />
                <span className="text-sm text-primary-700 dark:text-primary-200">
                  客观题自动批改完成 · 共 {gradingResult.correctCount}/{gradingResult.totalCount} 题正确
                </span>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-primary-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  答题详情
                </h2>
                {gradingResult.results.map((result, index) => {
                  const q = questions[index];
                  return (
                    <Card key={result.questionId}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <Badge variant={result.isCorrect ? 'success' : 'danger'} className="shrink-0">
                              {index + 1}
                            </Badge>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary">
                                  {q.type === 'single' ? '单选题' : q.type === 'multiple' ? '多选题' : q.type === 'judge' ? '判断题' : '主观题'}
                                </Badge>
                                <span className="text-sm text-primary-500">{result.score}/{result.maxScore} 分</span>
                              </div>
                              <p className="text-base font-medium text-primary-900 dark:text-white">{q.content}</p>
                            </div>
                          </div>
                          <Badge variant={result.isCorrect ? 'success' : 'danger'} className="shrink-0">
                            {result.isCorrect ? (
                              <><CheckCircle2 className="h-3 w-3 mr-1" />正确</>
                            ) : (
                              <><XCircle className="h-3 w-3 mr-1" />错误</>
                            )}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="rounded-lg border border-primary-200 dark:border-primary-700 p-3">
                            <p className="text-xs font-medium text-primary-500 dark:text-primary-400 mb-1">你的答案</p>
                            <p className="text-sm text-primary-800 dark:text-primary-100">
                              {Array.isArray(result.userAnswer)
                                ? result.userAnswer.join(', ')
                                : result.userAnswer || '未作答'}
                            </p>
                          </div>
                          <div className="rounded-lg border border-accent-teal/30 bg-accent-teal/5 p-3">
                            <p className="text-xs font-medium text-accent-teal mb-1">正确答案</p>
                            <p className="text-sm text-primary-800 dark:text-primary-100">
                              {Array.isArray(result.correctAnswer)
                                ? result.correctAnswer.join(', ')
                                : result.correctAnswer || '-'}
                            </p>
                          </div>
                        </div>
                        {q.analysis && (
                          <div className="rounded-lg bg-primary-50 dark:bg-primary-900/30 p-3">
                            <p className="text-xs font-medium text-primary-600 dark:text-primary-300 mb-1">答案解析</p>
                            <p className="text-sm text-primary-700 dark:text-primary-200">{q.analysis}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-darker text-white">
      <div className="h-14 bg-accent-orange/90 border-b border-accent-orange flex items-center px-6 justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">{exam.title}</h1>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {course?.title}
          </Badge>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <MonitorX className="h-4 w-4" />
            <span className="text-sm font-medium">
              切屏: <span className={cn(screenSwitchCount >= 2 ? 'text-yellow-200' : 'text-white')}>{screenSwitchCount}</span>
              /{exam.maxScreenSwitches || 3}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-black/20 rounded-lg px-4 py-1.5">
            <Clock className="h-5 w-5 animate-pulse" />
            <span className="font-mono text-xl font-bold tracking-wider">
              {formatTime(timeRemaining)}
            </span>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setShowConfirmModal(true)}>
            <Send className="h-4 w-4 mr-1" />
            交卷
          </Button>
        </div>
      </div>

      {cheatingWarning && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-accent-orange">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-full bg-accent-orange/20 mx-auto flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-accent-orange animate-pulse" />
              </div>
              <CardTitle className="text-xl">检测到作弊行为</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-primary-600 dark:text-primary-300 mb-4">
                切屏次数已超过 {exam.maxScreenSwitches || 3} 次，系统判定为作弊，正在自动交卷...
              </p>
              <div className="flex items-center justify-center gap-2 text-accent-orange">
                <div className="h-2 w-2 rounded-full bg-accent-orange animate-ping" />
                <span className="font-medium">请勿刷新页面</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showWarningModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-accent-yellow">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-full bg-accent-yellow/20 mx-auto flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-accent-yellow" />
              </div>
              <CardTitle className="text-xl">离开考试页面警告</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-primary-600 dark:text-primary-300 mb-4">
                检测到你已离开考试页面 <span className="font-bold text-accent-orange">{screenSwitchCount}</span> 次。
                超过 <span className="font-bold">{exam.maxScreenSwitches || 3}</span> 次将自动交卷并判定为作弊！
              </p>
              <Button variant="default" size="lg" onClick={() => setShowWarningModal(false)}>
                我知道了，继续考试
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">确认交卷</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowConfirmModal(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-primary-600 dark:text-primary-300">
                你确定要提交答卷吗？提交后将无法修改答案。
              </p>
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/30">
                <div>
                  <p className="text-xs text-primary-500 dark:text-primary-400">已答题</p>
                  <p className="text-xl font-bold text-accent-teal">{answeredCount}/{questions.length}</p>
                </div>
                <div>
                  <p className="text-xs text-primary-500 dark:text-primary-400">未答题</p>
                  <p className="text-xl font-bold text-accent-orange">{questions.length - answeredCount}</p>
                </div>
              </div>
              {questions.length - answeredCount > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-accent-yellow/10 border border-accent-yellow/30">
                  <AlertTriangle className="h-5 w-5 text-accent-yellow shrink-0 mt-0.5" />
                  <p className="text-sm text-primary-700 dark:text-primary-200">
                    还有 <span className="font-bold">{questions.length - answeredCount}</span> 道题未作答，确定要交卷吗？
                  </p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowConfirmModal(false)}>
                  继续答题
                </Button>
                <Button variant="default" className="flex-1" onClick={handleSubmit}>
                  确认交卷
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex h-[calc(100vh-3.5rem)]">
        <div className="w-64 bg-surface-dark border-r border-primary-800 overflow-y-auto p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary-300">答题卡</span>
              <Badge variant="secondary" className="text-xs">
                {answeredCount}/{questions.length}
              </Badge>
            </div>
            <div className="h-2 bg-primary-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-primary transition-all duration-500"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-xs text-primary-400">
              <span className="w-4 h-4 rounded bg-accent-teal" />
              已答
            </div>
            <div className="flex items-center gap-2 text-xs text-primary-400">
              <span className="w-4 h-4 rounded bg-primary-700 border border-primary-600" />
              未答
            </div>
            <div className="flex items-center gap-2 text-xs text-primary-400">
              <span className="w-4 h-4 rounded bg-primary-500 ring-2 ring-accent-yellow" />
              当前
            </div>
            <div className="flex items-center gap-2 text-xs text-primary-400">
              <span className="w-4 h-4 rounded bg-primary-700 relative">
                <Flag className="h-3 w-3 text-accent-yellow absolute -top-1 -right-1" />
              </span>
              标记
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, index) => {
              const { isAnswered, isMarked, isCurrent } = getQuestionStatus(index);
              return (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    'relative aspect-square rounded-lg text-sm font-medium transition-all',
                    isCurrent
                      ? 'bg-primary-500 text-white ring-2 ring-accent-yellow ring-offset-2 ring-offset-surface-dark'
                      : isAnswered
                      ? 'bg-accent-teal text-white hover:bg-accent-teal/80'
                      : 'bg-primary-800 text-primary-200 hover:bg-primary-700 border border-primary-700',
                  )}
                >
                  {index + 1}
                  {isMarked && (
                    <Flag className="h-3 w-3 text-accent-yellow absolute -top-1 -right-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {currentQuestion && (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Badge variant="default" className="text-base px-4 py-1">
                    第 {currentIndex + 1} 题 / 共 {questions.length} 题
                  </Badge>
                  <Badge variant="secondary">
                    {currentQuestion.type === 'single'
                      ? '单选题'
                      : currentQuestion.type === 'multiple'
                      ? '多选题'
                      : currentQuestion.type === 'judge'
                      ? '判断题'
                      : '主观题'}
                  </Badge>
                  <Badge variant="warning">{currentQuestion.score} 分</Badge>
                </div>
                <Button
                  variant={markedQuestions.has(currentQuestion.id) ? 'warning' : 'outline'}
                  size="sm"
                  onClick={() => toggleMark(currentQuestion.id)}
                >
                  <Flag className="h-4 w-4 mr-1" />
                  {markedQuestions.has(currentQuestion.id) ? '取消标记' : '标记此题'}
                </Button>
              </div>

              <Card className="mb-6">
                <CardContent className="p-6">
                  <p className="text-lg text-primary-900 dark:text-white leading-relaxed">
                    {currentQuestion.content}
                  </p>
                </CardContent>
              </Card>

              {currentQuestion.type === 'single' && currentQuestion.optionsWithKeys && (
                <div className="space-y-3">
                  {currentQuestion.optionsWithKeys.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handleSingleChoice(currentQuestion.id, opt.key)}
                      className={cn(
                        'w-full text-left p-4 rounded-xl border-2 transition-all text-lg',
                        answers[currentQuestion.id] === opt.key
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/40'
                          : 'border-primary-200 dark:border-primary-700 hover:border-primary-400 dark:hover:border-primary-600 bg-white dark:bg-surface-dark',
                      )}
                    >
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200 font-semibold mr-3">
                        {opt.key}
                      </span>
                      <span className="text-primary-800 dark:text-primary-100">{opt.content}</span>
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'multiple' && currentQuestion.optionsWithKeys && (
                <div className="space-y-3">
                  {currentQuestion.optionsWithKeys.map((opt) => {
                    const selected = (answers[currentQuestion.id] as string[] || []).includes(opt.key);
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleMultipleChoice(currentQuestion.id, opt.key)}
                        className={cn(
                          'w-full text-left p-4 rounded-xl border-2 transition-all text-lg',
                          selected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/40'
                            : 'border-primary-200 dark:border-primary-700 hover:border-primary-400 dark:hover:border-primary-600 bg-white dark:bg-surface-dark',
                        )}
                      >
                        <span
                          className={cn(
                            'inline-flex items-center justify-center w-8 h-8 rounded-lg border-2 mr-3 font-semibold',
                            selected
                              ? 'bg-primary-500 border-primary-500 text-white'
                              : 'border-primary-300 dark:border-primary-600 text-primary-500 dark:text-primary-400',
                          )}
                        >
                          {selected && <CheckCircle2 className="h-5 w-5" />}
                        </span>
                        <span className="text-primary-800 dark:text-primary-100">{opt.content}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQuestion.type === 'judge' && (
                <div className="grid grid-cols-2 gap-4">
                  {['正确', '错误'].map((val) => (
                    <button
                      key={val}
                      onClick={() => handleJudge(currentQuestion.id, val)}
                      className={cn(
                        'p-6 rounded-xl border-2 transition-all text-xl font-medium',
                        answers[currentQuestion.id] === val
                          ? val === '正确'
                            ? 'border-accent-teal bg-accent-teal/10 text-accent-teal'
                            : 'border-accent-orange bg-accent-orange/10 text-accent-orange'
                          : 'border-primary-200 dark:border-primary-700 hover:border-primary-400 dark:hover:border-primary-600 bg-white dark:bg-surface-dark text-primary-700 dark:text-primary-200',
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'subjective' && (
                <Textarea
                  placeholder="请输入你的答案..."
                  className="min-h-[200px] resize-y text-base p-4"
                  value={(answers[currentQuestion.id] as string) || ''}
                  onChange={(e) => handleSubjective(currentQuestion.id, e.target.value)}
                />
              )}

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-primary-200 dark:border-primary-800">
                <Button
                  variant="outline"
                  size="lg"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  上一题
                </Button>
                <div className="text-sm text-primary-500 dark:text-primary-400">
                  {currentIndex + 1} / {questions.length}
                </div>
                {currentIndex < questions.length - 1 ? (
                  <Button
                    variant="default"
                    size="lg"
                    onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                  >
                    下一题
                    <ChevronRight className="h-5 w-5 ml-1" />
                  </Button>
                ) : (
                  <Button variant="destructive" size="lg" onClick={() => setShowConfirmModal(true)}>
                    <Send className="h-5 w-5 mr-1" />
                    交卷
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
