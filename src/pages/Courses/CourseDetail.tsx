import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  BookOpen,
  User,
  Award,
  Layers,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  GripVertical,
  FileVideo,
  FileText,
  FileImage,
  File,
  Upload,
  Eye,
  Download,
  HelpCircle,
  CheckCircle2,
  Circle,
  CircleDot,
  Clock,
  Check,
  X,
  Settings,
  ListChecks,
  FileQuestion,
  Route,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/utils/permission';
import { cn } from '@/lib/utils';
import type {
  Chapter,
  Lesson,
  Courseware,
  Question,
  QuestionType,
  LearningPath,
  PathStep,
} from '@/types';

type TabKey = 'chapters' | 'coursewares' | 'questions' | 'path';

const tabConfig: { key: TabKey; label: string; icon: typeof BookOpen }[] = [
  { key: 'chapters', label: '章节管理', icon: Layers },
  { key: 'coursewares', label: '课件管理', icon: FileText },
  { key: 'questions', label: '试题库', icon: FileQuestion },
  { key: 'path', label: '学习路径', icon: Route },
];

const coursewareIconMap: Record<string, typeof File> = {
  video: FileVideo,
  pdf: FileText,
  ppt: FileImage,
  doc: FileText,
  audio: File,
  image: FileImage,
  document: FileText,
};

const difficultyMap = {
  easy: { label: '简单', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  medium: { label: '中等', className: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  hard: { label: '困难', className: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
};

const questionTypeMap: Record<QuestionType, string> = {
  single: '单选题',
  multiple: '多选题',
  judge: '判断题',
  fill: '填空题',
  short: '简答题',
  essay: '论述题',
  boolean: '判断题',
  subjective: '主观题',
};

const stepStatusMap = {
  pending: { label: '未开始', icon: Circle, className: 'text-slate-500' },
  in_progress: { label: '进行中', icon: CircleDot, className: 'text-sky-400' },
  completed: { label: '已完成', icon: CheckCircle2, className: 'text-emerald-400' },
};

export default function CourseDetail() {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { getCourseById, users } = useAppStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabKey>('chapters');

  const course = useMemo(() => getCourseById(id), [id, getCourseById]);

  const canEdit = useMemo(() => {
    if (!user) return false;
    return hasPermission(user, 'update', 'course');
  }, [user]);

  const teacher = useMemo(() => {
    if (!course) return null;
    return users.find((u) => u.id === course.teacherId) || null;
  }, [course, users]);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-12 text-center">
          <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">课程不存在</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-5 py-2 rounded-lg bg-primary-500/80 text-white hover:bg-primary-500 transition-all"
          >
            返回课程列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回课程列表
        </button>

        <div className="glass-card overflow-hidden mb-6">
          <div className="relative h-56 md:h-72">
            <img
              src={course.cover}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--deep-sea-950)] via-[var(--deep-sea-950)]/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 text-xs rounded-full bg-primary-500/30 text-primary-200 border border-primary-400/30 backdrop-blur-sm">
                      {course.category || course.subject || '未分类'}
                    </span>
                    {Array.isArray(course.tags) && course.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 text-xs rounded-full bg-white/10 text-slate-300 border border-white/10 backdrop-blur-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{course.title}</h1>
                  <p className="text-sm text-slate-300 max-w-3xl line-clamp-2">
                    {course.subtitle || course.description}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {teacher && (
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium">
                        {teacher.name?.charAt(0) || 'T'}
                      </div>
                      <div>
                        <div className="text-sm text-white font-medium">{teacher.name}</div>
                        <div className="text-xs text-slate-400">{teacher.title || '讲师'}</div>
                      </div>
                    </div>
                  )}
                  {course.credits !== undefined && course.credits > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/25">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-medium text-amber-300">{course.credits} 学分</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card mb-6">
          <div className="flex overflow-x-auto border-b border-white/10">
            {tabConfig.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2',
                    activeTab === tab.key
                      ? 'text-primary-300 border-primary-400 bg-primary-500/5'
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === 'chapters' && <ChaptersTab chapters={course.chapters || []} canEdit={canEdit} />}
            {activeTab === 'coursewares' && (
              <CoursewaresTab
                coursewares={
                  (course.chapters || []).flatMap((ch) =>
                    (ch.lessons || []).flatMap((l) => l.coursewares || l.materials || [])
                  )
                }
                canEdit={canEdit}
              />
            )}
            {activeTab === 'questions' && <QuestionsTab questions={course.questions || []} canEdit={canEdit} />}
            {activeTab === 'path' && <LearningPathTab courseId={course.id} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChaptersTab({ chapters, canEdit }: { chapters: Chapter[]; canEdit: boolean }) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(chapters.slice(0, 2).map((c) => c.id))
  );

  const toggleChapter = (id: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalLessons = chapters.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0);
  const totalDuration = chapters.reduce(
    (sum, ch) => sum + (ch.lessons || []).reduce((s, l) => s + (l.duration || 0), 0),
    0
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary-400" />
            <span className="text-slate-400">
              共 <span className="text-white font-medium">{chapters.length}</span> 章节
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-primary-400" />
            <span className="text-slate-400">
              <span className="text-white font-medium">{totalLessons}</span> 课时
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-400" />
            <span className="text-slate-400">
              <span className="text-white font-medium">{Math.round(totalDuration / 60)}</span> 小时
            </span>
          </div>
        </div>
        {canEdit && (
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500/80 hover:bg-primary-500 text-white text-sm transition-all">
            <Plus className="w-4 h-4" />
            新增章节
          </button>
        )}
      </div>

      <div className="space-y-3">
        {chapters.map((chapter, chIdx) => {
          const isExpanded = expandedChapters.has(chapter.id);
          return (
            <div key={chapter.id} className="glass-card-sm overflow-hidden">
              <div
                className={cn(
                  'flex items-center gap-3 p-4 cursor-pointer transition-all',
                  isExpanded && 'bg-white/5'
                )}
                onClick={() => toggleChapter(chapter.id)}
              >
                {canEdit && (
                  <GripVertical className="w-4 h-4 text-slate-500 cursor-grab hover:text-slate-300 flex-shrink-0" />
                )}
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0',
                    isExpanded
                      ? 'bg-primary-500/30 text-primary-300'
                      : 'bg-white/10 text-slate-400'
                  )}
                >
                  {chIdx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">{chapter.title}</h4>
                  {chapter.description && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{chapter.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{chapter.lessons?.length || 0} 课时</span>
                  <span>
                    {Math.round(
                      (chapter.lessons || []).reduce((s, l) => s + (l.duration || 0), 0) / 60
                    )}{' '}
                    分钟
                  </span>
                </div>
                {canEdit && (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-primary-300 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-amber-300 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-rose-300 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
              </div>

              {isExpanded && (
                <div className="border-t border-white/10">
                  {(chapter.lessons || []).map((lesson, lIdx) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 p-3 pl-12 md:pl-20 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                    >
                      {canEdit && (
                        <GripVertical className="w-3.5 h-3.5 text-slate-600 cursor-grab hover:text-slate-400 flex-shrink-0" />
                      )}
                      <div className="w-2 h-2 rounded-full bg-primary-400/60 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-200 truncate">{lesson.title}</div>
                        {lesson.description && (
                          <div className="text-xs text-slate-500 mt-0.5 truncate">{lesson.description}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {lesson.isFree && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                            免费
                          </span>
                        )}
                        <span className="text-xs text-slate-400">{lesson.duration || 0} 分钟</span>
                        <span className="text-xs text-slate-500">
                          {(lesson.coursewares || lesson.materials || []).length} 课件
                        </span>
                        {canEdit && (
                          <div className="flex items-center gap-0.5">
                            <button className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-amber-300 transition-colors">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-rose-300 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {chapters.length === 0 && (
        <div className="py-16 text-center">
          <Layers className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">暂无章节内容</p>
          {canEdit && (
            <button className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500/80 hover:bg-primary-500 text-white text-sm transition-all mx-auto">
              <Plus className="w-4 h-4" />
              添加第一章
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function formatFileSize(size: string | number | undefined): string {
  if (!size) return '0B';
  if (typeof size === 'string') return size;
  if (size < 1024) return `${size}B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
  return `${(size / 1024 / 1024).toFixed(1)}MB`;
}

function CoursewaresTab({
  coursewares,
  canEdit,
}: {
  coursewares: Courseware[];
  canEdit: boolean;
}) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="text-sm text-slate-400">
          共 <span className="text-white font-medium">{coursewares.length}</span> 个课件文件
        </div>
        {canEdit && (
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500/80 hover:bg-primary-500 text-white text-sm transition-all">
            <Upload className="w-4 h-4" />
            上传课件
          </button>
        )}
      </div>

      {coursewares.length === 0 ? (
        <div className="py-16 text-center">
          <FileText className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">暂无课件文件</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-white/10">
                <th className="pb-3 pl-4 pr-2 font-medium">文件名</th>
                <th className="pb-3 px-2 font-medium">类型</th>
                <th className="pb-3 px-2 font-medium">大小</th>
                <th className="pb-3 px-2 font-medium">上传时间</th>
                <th className="pb-3 pr-4 pl-2 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {coursewares.map((cw) => {
                const Icon = coursewareIconMap[cw.type] || File;
                return (
                  <tr
                    key={cw.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 pl-4 pr-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-500/15 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary-300" />
                        </div>
                        <span className="text-sm text-white">{cw.title || cw.name || '未命名'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-xs px-2 py-1 rounded-md bg-white/10 text-slate-300 uppercase">
                        {cw.type}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm text-slate-300">
                      {formatFileSize(cw.fileSize || cw.size)}
                    </td>
                    <td className="py-3 px-2 text-sm text-slate-400">{cw.uploadedAt || '-'}</td>
                    <td className="py-3 pr-4 pl-2">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-primary-300 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-emerald-300 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        {canEdit && (
                          <button className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-rose-300 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function QuestionsTab({ questions, canEdit }: { questions: Question[]; canEdit: boolean }) {
  const [showForm, setShowForm] = useState(false);
  const [questionType, setQuestionType] = useState<QuestionType>('single');

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="text-sm text-slate-400">
          共 <span className="text-white font-medium">{questions.length}</span> 道题目
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg glass-button text-white text-sm">
              <Upload className="w-4 h-4" />
              批量导入
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500/80 hover:bg-primary-500 text-white text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              新增题目
            </button>
          </div>
        )}
      </div>

      {showForm && canEdit && (
        <div className="glass-card-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-medium">新增题目</h4>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {(['single', 'multiple', 'judge', 'subjective'] as QuestionType[]).map((type) => (
              <button
                key={type}
                onClick={() => setQuestionType(type)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm transition-all border',
                  questionType === type
                    ? 'bg-primary-500/30 text-primary-200 border-primary-400/40'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200'
                )}
              >
                {questionTypeMap[type]}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">题目内容</label>
              <textarea
                rows={3}
                placeholder="请输入题目内容..."
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-primary-400/50 transition-all resize-none"
              />
            </div>

            {questionType !== 'judge' && questionType !== 'subjective' && (
              <div className="space-y-2">
                <label className="block text-xs text-slate-400">选项</label>
                {['A', 'B', 'C', 'D'].map((opt, idx) => (
                  <div key={opt} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-primary-500/20 flex items-center justify-center text-sm font-bold text-primary-300">
                      {opt}
                    </div>
                    <input
                      type="text"
                      placeholder={`选项 ${opt} 内容`}
                      className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-primary-400/50 text-sm"
                    />
                    {questionType === 'multiple' ? (
                      <input type="checkbox" className="w-4 h-4 accent-primary-500" />
                    ) : (
                      <input type="radio" name="correct" className="w-4 h-4 accent-primary-500" />
                    )}
                    {idx >= 2 && (
                      <button className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-rose-300">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 mt-1">
                  <Plus className="w-3 h-3" /> 添加选项
                </button>
              </div>
            )}

            {questionType === 'judge' && (
              <div className="flex gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input type="radio" name="judge" className="w-4 h-4 accent-primary-500" />
                  <Check className="w-4 h-4 text-emerald-400" /> 正确
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input type="radio" name="judge" className="w-4 h-4 accent-primary-500" />
                  <X className="w-4 h-4 text-rose-400" /> 错误
                </label>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">分值</label>
                <input
                  type="number"
                  defaultValue={5}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary-400/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">难度</label>
                <select className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary-400/50 text-sm">
                  <option value="easy">简单</option>
                  <option value="medium">中等</option>
                  <option value="hard">困难</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">知识点</label>
                <input
                  type="text"
                  placeholder="知识点标签"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-primary-400/50 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg glass-button text-slate-300 text-sm"
              >
                取消
              </button>
              <button className="px-4 py-2 rounded-lg bg-primary-500/80 hover:bg-primary-500 text-white text-sm transition-all">
                保存题目
              </button>
            </div>
          </div>
        </div>
      )}

      {questions.length === 0 ? (
        <div className="py-16 text-center">
          <HelpCircle className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">暂无题目</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div key={q.id} className="glass-card-sm p-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-sm font-bold text-primary-300 flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                      {questionTypeMap[q.type] || q.type}
                    </span>
                    {q.difficulty && (
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-md border',
                          difficultyMap[q.difficulty]?.className
                        )}
                      >
                        {difficultyMap[q.difficulty]?.label}
                      </span>
                    )}
                    {q.knowledgePoint && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/25">
                        {q.knowledgePoint}
                      </span>
                    )}
                    <span className="text-xs text-amber-300 ml-auto">{q.score} 分</span>
                  </div>
                  <p className="text-sm text-white mb-2">{q.content}</p>
                  {q.options && Array.isArray(q.options) && q.options.length > 0 && (
                    <div className="space-y-1.5 pl-2">
                      {q.options.map((opt: any) => (
                        <div key={opt.key || opt} className="flex items-start gap-2 text-xs text-slate-400">
                          <span className="font-medium text-slate-300">{opt.key || '•'}.</span>
                          <span>{opt.content || opt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {canEdit && (
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-amber-300 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-rose-300 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LearningPathTab({ courseId }: { courseId: string }) {
  const { learningPaths } = useAppStore();

  const path = learningPaths.find((p) => p.courseIds?.includes(courseId));

  const mockSteps: PathStep[] = [
    {
      id: 's1',
      learningPathId: 'lp1',
      order: 1,
      title: '学习课程基础概念',
      type: 'course',
      resourceId: courseId,
      status: 'completed',
      progress: 100,
    },
    {
      id: 's2',
      learningPathId: 'lp1',
      order: 2,
      title: '完成章节配套练习',
      type: 'practice',
      resourceId: 'ex1',
      status: 'completed',
      progress: 100,
    },
    {
      id: 's3',
      learningPathId: 'lp1',
      order: 3,
      title: '提交课程作业',
      type: 'assignment',
      resourceId: 'a1',
      status: 'in_progress',
      progress: 60,
    },
    {
      id: 's4',
      learningPathId: 'lp1',
      order: 4,
      title: '参加课程结业考试',
      type: 'exam',
      resourceId: 'e1',
      status: 'pending',
      progress: 0,
    },
    {
      id: 's5',
      learningPathId: 'lp1',
      order: 5,
      title: '获得课程证书',
      type: 'course',
      resourceId: 'cert1',
      status: 'pending',
      progress: 0,
    },
  ];

  const steps = path?.steps || mockSteps;
  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const overallProgress = Math.round(
    steps.reduce((sum, s) => sum + s.progress, 0) / steps.length
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <div className="text-sm text-slate-400 mb-1">系统推荐学习路径</div>
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold gradient-text">{overallProgress}%</div>
            <div className="text-sm text-slate-400">
              已完成 {completedCount}/{steps.length} 个步骤
            </div>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg glass-button text-white text-sm">
          <Settings className="w-4 h-4" />
          手动调整
        </button>
      </div>

      <div className="glass-card-sm p-6 mb-6">
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/50 via-primary-500/30 to-slate-700/30" />

        <div className="space-y-4">
          {steps.map((step, idx) => {
            const StatusIcon = stepStatusMap[step.status].icon;
            const isLast = idx === steps.length - 1;

            return (
              <div key={step.id} className="relative flex gap-4">
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center border-2',
                      step.status === 'completed' &&
                        'bg-emerald-500/20 border-emerald-500/50',
                      step.status === 'in_progress' &&
                        'bg-sky-500/20 border-sky-500/50',
                      step.status === 'pending' && 'bg-white/5 border-white/15'
                    )}
                  >
                    <StatusIcon
                      className={cn(
                        'w-5 h-5',
                        step.status === 'completed' && 'text-emerald-400',
                        step.status === 'in_progress' && 'text-sky-400 animate-pulse',
                        step.status === 'pending' && 'text-slate-500'
                      )}
                    />
                  </div>
                </div>

                <div
                  className={cn(
                    'flex-1 glass-card-sm p-4 transition-all',
                    step.status === 'in_progress' && 'ring-1 ring-sky-500/30'
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={cn(
                            'font-medium',
                            step.status === 'pending' ? 'text-slate-400' : 'text-white'
                          )}
                        >
                          步骤 {step.order}：{step.title}
                        </h4>
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-md border',
                            step.status === 'completed' &&
                              'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
                            step.status === 'in_progress' &&
                              'bg-sky-500/15 text-sky-300 border-sky-500/25',
                            step.status === 'pending' &&
                              'bg-white/5 text-slate-400 border-white/10'
                          )}
                        >
                          {stepStatusMap[step.status].label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="capitalize">{step.type}</span>
                        <span>预计 {15 + idx * 10} 分钟</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {step.status !== 'pending' && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>完成进度</span>
                        <span>{step.progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            step.status === 'completed'
                              ? 'bg-emerald-500'
                              : 'bg-gradient-to-r from-sky-600 to-sky-400'
                          )}
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
