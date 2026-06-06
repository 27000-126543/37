import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit3,
  BookOpen,
  Users,
  TrendingUp,
  ChevronDown,
  Star,
  Layers,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/utils/permission';
import { cn } from '@/lib/utils';
import type { Course, CourseStatus } from '@/types';

const statusMap: Record<CourseStatus, { label: string; className: string }> = {
  draft: { label: '草稿', className: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  published: { label: '已发布', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  archived: { label: '已归档', className: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  online: { label: '上线中', className: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  pending: { label: '待审核', className: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  reviewing: { label: '审核中', className: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30' },
};

export default function CourseList() {
  const navigate = useNavigate();
  const { courses, users } = useAppStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [selectedStatus, setSelectedStatus] = useState<string>('全部');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(courses.map((c) => c.category || c.subject || '未分类'));
    return ['全部', ...Array.from(cats)];
  }, [courses]);

  const statuses = useMemo(() => {
    return ['全部', 'draft', 'published', 'archived', 'online', 'pending', 'reviewing'];
  }, []);

  const canCreateCourse = useMemo(() => {
    if (!user) return false;
    return hasPermission(user, 'create', 'course');
  }, [user]);

  const canEditCourse = useMemo(() => {
    if (!user) return false;
    return hasPermission(user, 'update', 'course');
  }, [user]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === '全部' ||
        (course.category || course.subject || '未分类') === selectedCategory;
      const matchesStatus = selectedStatus === '全部' || course.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [courses, searchQuery, selectedCategory, selectedStatus]);

  const getTeacherName = (teacherId: string) => {
    const teacher = users.find((u) => u.id === teacherId);
    return teacher?.name || '待定';
  };

  const getCompletionRate = (course: Course) => {
    const enrolled = course.enrolledCount || course.studentCount || 0;
    const completed = course.completedCount || 0;
    if (enrolled === 0) return 0;
    return Math.round((completed / enrolled) * 100);
  };

  const totalChapters = (course: Course) => {
    return course.chapters?.length || 0;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">课程管理</h1>
            <p className="text-slate-400 text-sm">管理平台所有课程内容与资源</p>
          </div>
          {canCreateCourse && (
            <button
              onClick={() => {}}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium transition-all duration-300 shadow-glow hover:shadow-glow-lg"
            >
              <Plus className="w-5 h-5" />
              新建课程
            </button>
          )}
        </div>

        <div className="glass-card p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索课程标题、描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-primary-400/50 focus:ring-2 focus:ring-primary-400/20 transition-all"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown);
                  setShowStatusDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all min-w-[160px]"
              >
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm">{selectedCategory}</span>
                <ChevronDown className="w-4 h-4 ml-auto text-slate-400" />
              </button>
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full glass-card-strong py-2 z-50 min-w-[180px]">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowCategoryDropdown(false);
                      }}
                      className={cn(
                        'w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors',
                        selectedCategory === cat ? 'text-primary-300 bg-white/10' : 'text-slate-300'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowCategoryDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all min-w-[160px]"
              >
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm">
                  {selectedStatus === '全部' ? '全部状态' : statusMap[selectedStatus as CourseStatus]?.label || selectedStatus}
                </span>
                <ChevronDown className="w-4 h-4 ml-auto text-slate-400" />
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full glass-card-strong py-2 z-50 min-w-[180px]">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setSelectedStatus(status);
                        setShowStatusDropdown(false);
                      }}
                      className={cn(
                        'w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors',
                        selectedStatus === status ? 'text-primary-300 bg-white/10' : 'text-slate-300'
                      )}
                    >
                      {status === '全部' ? '全部状态' : statusMap[status as CourseStatus]?.label || status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-sm text-slate-400 mb-4">
          共 <span className="text-primary-300 font-medium">{filteredCourses.length}</span> 门课程
        </div>

        {filteredCourses.length === 0 ? (
          <div className="glass-card py-20 text-center">
            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">暂无符合条件的课程</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="glass-card group overflow-hidden transition-all duration-500 hover:shadow-glow-lg hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={course.cover}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                    <span
                      className={cn(
                        'px-2.5 py-1 text-xs font-medium rounded-full border backdrop-blur-sm',
                        statusMap[course.status]?.className || 'bg-slate-500/20 text-slate-300'
                      )}
                    >
                      {statusMap[course.status]?.label || course.status}
                    </span>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-white font-medium">{course.rating || 0}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="inline-block px-2.5 py-1 text-xs rounded-full bg-primary-500/30 text-primary-200 border border-primary-400/30 backdrop-blur-sm">
                      {course.category || course.subject || '未分类'}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/courses/${course.id}`);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm hover:bg-white/20 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      查看
                    </button>
                    {canEditCourse && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-500/80 backdrop-blur-sm border border-primary-400/50 text-white text-sm hover:bg-primary-500 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                        编辑
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-primary-300 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2 h-10">
                    {course.subtitle || course.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Layers className="w-3.5 h-3.5 text-primary-400" />
                      <span>{totalChapters(course)} 章节</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Users className="w-3.5 h-3.5 text-primary-400" />
                      <span>{course.enrolledCount || course.studentCount || 0} 人</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <TrendingUp className="w-3.5 h-3.5 text-primary-400" />
                      <span>{getCompletionRate(course)}% 完课</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-medium text-white">
                        {getTeacherName(course.teacherId || '').charAt(0)}
                      </div>
                      <span className="text-sm text-slate-300">
                        {getTeacherName(course.teacherId || '')}
                      </span>
                    </div>
                    {course.credits !== undefined && course.credits > 0 && (
                      <span className="text-xs px-2 py-1 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/20">
                        {course.credits} 学分
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
