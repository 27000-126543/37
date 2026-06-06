import type {
  LearningData,
  Course,
  RecommendedPath,
} from '@/types';

function getCourseEstimatedMinutes(course: Course): number {
  if (course.estimatedHours) return course.estimatedHours * 60;
  let total = 0;
  for (const ch of course.chapters) {
    for (const lesson of ch.lessons) {
      total += lesson.duration || 0;
    }
  }
  return total > 0 ? total : 60;
}

function calculateDifficultyScore(
  course: Course,
  learningData: LearningData,
): number {
  const weakSet = new Set(learningData.weakPoints);
  const strongSet = new Set(learningData.strongPoints);

  let score = 0;
  const tags = course.tags ?? [];
  for (const tag of tags) {
    if (weakSet.has(tag)) score += 3;
    else if (strongSet.has(tag)) score -= 1;
  }

  const progressValues = Object.values(learningData.courseProgress);
  const avgProgress = progressValues.length > 0
    ? progressValues.reduce((acc, p) => acc + p, 0) / progressValues.length
    : 0;

  const difficulty = course.difficulty ?? 'beginner';
  if (difficulty === 'beginner') {
    score += avgProgress < 0.4 ? 2 : 0;
  } else if (difficulty === 'intermediate') {
    score += avgProgress >= 0.4 && avgProgress < 0.7 ? 2 : 0;
  } else {
    score += avgProgress >= 0.7 ? 2 : 0;
  }

  return score;
}

function calculateSubjectScore(
  course: Course,
  learningData: LearningData,
): number {
  const subject = course.subject ?? course.category ?? '';
  const studyTime = learningData.studyTimePerSubject[subject] ?? 0;
  const allTimes = Object.values(learningData.studyTimePerSubject);
  if (allTimes.length === 0) return 0;
  const maxTime = Math.max(...allTimes.map(Number), 1);
  const ratio = studyTime / maxTime;
  return ratio > 0.5 ? -1 : 1;
}

function calculatePrerequisiteScore(
  course: Course,
  learningData: LearningData,
): { score: number; met: boolean } {
  const completed = new Set(learningData.completedCourses);
  let metCount = 0;
  const prereqs = course.prerequisites ?? [];
  for (const prereq of prereqs) {
    if (completed.has(prereq)) metCount += 1;
  }
  const met = prereqs.length === 0 || metCount === prereqs.length;
  const score = prereqs.length === 0
    ? 0.5
    : metCount / prereqs.length;
  return { score: score * 5, met };
}

function calculateStyleScore(course: Course, learningData: LearningData): number {
  const styleMap: Record<string, string[]> = {
    visual: ['图表', '视频', '图像', '动画', '可视化', 'video'],
    auditory: ['音频', '听力', '讲解', '口语', '对话', 'audio'],
    reading: ['文档', '阅读', '文字', '书籍', '笔记', 'pdf', 'doc'],
    kinesthetic: ['实操', '练习', '实验', '项目', '动手', 'ppt'],
  };
  const keywords = styleMap[learningData.learningStyle] ?? [];
  let score = 0;
  const materials = course.materials ?? [];
  const haystack = (
    course.title + ' ' +
    (course.description ?? '') + ' ' +
    (course.tags ?? []).join(' ') + ' ' +
    materials.map(m => m.type).join(' ')
  ).toLowerCase();
  for (const kw of keywords) {
    if (haystack.includes(kw.toLowerCase())) score += 2;
  }
  return score;
}

export function recommendLearningPath(
  learningData: LearningData,
  availableCourses: Course[],
  limit: number = 5,
): RecommendedPath[] {
  const scored: Array<{ course: Course; score: number; reasons: string[] }> = [];

  for (const course of availableCourses) {
    if (learningData.completedCourses.includes(course.id)) continue;

    const reasons: string[] = [];
    let totalScore = 0;

    const difficultyScore = calculateDifficultyScore(course, learningData);
    totalScore += difficultyScore;
    if (difficultyScore > 0) reasons.push('针对薄弱知识点推荐');

    const subjectScore = calculateSubjectScore(course, learningData);
    totalScore += subjectScore;
    if (subjectScore > 0) reasons.push('平衡学习科目');

    const prereq = calculatePrerequisiteScore(course, learningData);
    if (!prereq.met) continue;
    totalScore += prereq.score;
    if ((course.prerequisites ?? []).length > 0) reasons.push('先修课程已完成');

    const styleScore = calculateStyleScore(course, learningData);
    totalScore += styleScore;
    if (styleScore > 0) reasons.push('符合学习风格偏好');

    const subject = course.subject ?? course.category ?? '';
    if (subject && learningData.quizScores[subject] !== undefined) {
      const quizScore = learningData.quizScores[subject];
      if (quizScore < 0.6) {
        totalScore += 2;
        reasons.push('该科目测验成绩有提升空间');
      }
    }

    scored.push({ course, score: totalScore, reasons });
  }

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((item, idx) => ({
    courseId: item.course.id,
    courseTitle: item.course.title,
    priority: idx + 1,
    reason: item.reasons.length > 0 ? item.reasons.join('、') : '系统综合推荐',
    estimatedTime: getCourseEstimatedMinutes(item.course),
  }));
}

export function generateStudyPlan(
  learningData: LearningData,
  recommendedPaths: RecommendedPath[],
  dailyAvailableMinutes: number = 60,
): { day: number; courseId: string; courseTitle: string; minutes: number }[] {
  const plan: { day: number; courseId: string; courseTitle: string; minutes: number }[] = [];
  let currentDay = 1;
  let remainingToday = dailyAvailableMinutes;

  for (const path of recommendedPaths) {
    let totalMinutes = path.estimatedTime;
    while (totalMinutes > 0) {
      const allocate = Math.min(remainingToday, totalMinutes, dailyAvailableMinutes);
      plan.push({
        day: currentDay,
        courseId: path.courseId,
        courseTitle: path.courseTitle,
        minutes: allocate,
      });
      totalMinutes -= allocate;
      remainingToday -= allocate;
      if (remainingToday <= 0) {
        currentDay += 1;
        remainingToday = dailyAvailableMinutes;
      }
    }
  }

  return plan;
}
