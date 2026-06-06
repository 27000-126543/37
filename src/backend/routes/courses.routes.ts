import { Router, type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { success, error } from '../utils/response.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/permission.js';
import { uploadSingle } from '../middleware/upload.js';
import type {
  Course,
  Chapter,
  Lesson,
  Material,
  Question,
  PaginatedResult,
  QuestionType,
} from '../types/index.js';

const router = Router();

interface DbCourse {
  id: string;
  title: string;
  subject: string | null;
  description: string | null;
  cover: string | null;
  credits: number;
  teacherId: string | null;
  status: string;
  createdAt: string;
}

interface DbChapter {
  id: string;
  courseId: string;
  title: string;
  orderNo: number;
}

interface DbLesson {
  id: string;
  chapterId: string;
  title: string;
  type: string | null;
  duration: number;
  content: string | null;
}

interface DbMaterial {
  id: string;
  courseId: string;
  filename: string;
  url: string;
  size: number;
  type: string | null;
  createdAt: string;
}

interface DbQuestion {
  id: string;
  courseId: string;
  type: string;
  content: string;
  options: string | null;
  answer: string;
  score: number;
  explanation: string | null;
}

interface CreateCourseRequest {
  title: string;
  subject?: string;
  description?: string;
  cover?: string;
  credits?: number;
  teacherId?: string;
  status?: string;
}

interface UpdateCourseRequest {
  title?: string;
  subject?: string;
  description?: string;
  cover?: string;
  credits?: number;
  teacherId?: string;
  status?: string;
}

interface CreateChapterRequest {
  title: string;
  orderNo?: number;
}

interface UpdateChapterRequest {
  title?: string;
  orderNo?: number;
}

interface CreateLessonRequest {
  chapterId: string;
  title: string;
  type?: string;
  duration?: number;
  content?: string;
}

interface UpdateLessonRequest {
  title?: string;
  type?: string;
  duration?: number;
  content?: string;
}

interface CreateQuestionRequest {
  type: QuestionType;
  content: string;
  options?: string;
  answer: string;
  score?: number;
  explanation?: string;
}

interface BatchCreateQuestionsRequest {
  questions: CreateQuestionRequest[];
}

interface UpdateQuestionRequest {
  type?: QuestionType;
  content?: string;
  options?: string;
  answer?: string;
  score?: number;
  explanation?: string;
}

const formatCourse = (row: DbCourse): Course => ({
  id: row.id,
  title: row.title,
  subject: row.subject,
  description: row.description,
  cover: row.cover,
  credits: row.credits,
  teacherId: row.teacherId,
  status: row.status as Course['status'],
  createdAt: row.createdAt,
});

const formatChapter = (row: DbChapter): Chapter => ({
  id: row.id,
  courseId: row.courseId,
  title: row.title,
  orderNo: row.orderNo,
});

const formatLesson = (row: DbLesson): Lesson => ({
  id: row.id,
  chapterId: row.chapterId,
  title: row.title,
  type: row.type,
  duration: row.duration,
  content: row.content,
});

const formatMaterial = (row: DbMaterial): Material => ({
  id: row.id,
  courseId: row.courseId,
  filename: row.filename,
  url: row.url,
  size: row.size,
  type: row.type,
  createdAt: row.createdAt,
});

const formatQuestion = (row: DbQuestion): Question => ({
  id: row.id,
  courseId: row.courseId,
  type: row.type as Question['type'],
  content: row.content,
  options: row.options,
  answer: row.answer,
  score: row.score,
  explanation: row.explanation,
});

const getChaptersWithLessons = (courseId: string): (Chapter & { lessons: Lesson[] })[] => {
  const chapters = db
    .prepare('SELECT * FROM chapters WHERE courseId = ? ORDER BY orderNo ASC, id ASC')
    .all(courseId) as DbChapter[];

  return chapters.map((ch) => {
    const lessons = db
      .prepare('SELECT * FROM lessons WHERE chapterId = ? ORDER BY id ASC')
      .all(ch.id) as DbLesson[];
    return { ...formatChapter(ch), lessons: lessons.map(formatLesson) };
  });
};

router.use(authenticateToken);

router.get('/', (req: Request, res: Response): void => {
  const { subject, keyword, page = '1', pageSize = '20' } = req.query as {
    subject?: string;
    keyword?: string;
    page?: string;
    pageSize?: string;
  };

  const pageNum = Math.max(1, parseInt(page, 10));
  const limit = Math.max(1, Math.min(100, parseInt(pageSize, 10)));
  const offset = (pageNum - 1) * limit;

  const whereClauses: string[] = [];
  const params: Array<string | number> = [];

  if (subject) {
    whereClauses.push('subject = ?');
    params.push(subject);
  }

  if (keyword) {
    whereClauses.push('(title LIKE ? OR description LIKE ?)');
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*) as total FROM courses ${whereClause}`;
  const totalResult = db.prepare(countSql).get(...params) as { total: number };
  const total = totalResult.total;

  const sql = `SELECT * FROM courses ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
  const rows = db.prepare(sql).all(...params, limit, offset) as DbCourse[];

  const courses = rows.map(formatCourse);

  const result: PaginatedResult<Course> = {
    items: courses,
    total,
    page: pageNum,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  };

  res.json(success(result));
});

router.get('/:id', (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };

  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id) as DbCourse | undefined;
  if (!course) {
    res.status(404).json(error('课程不存在', 404));
    return;
  }

  const chapters = getChaptersWithLessons(id);

  const materials = (db.prepare('SELECT * FROM materials WHERE courseId = ? ORDER BY createdAt DESC').all(id) as DbMaterial[]).map(formatMaterial);

  const questions = (db.prepare('SELECT * FROM questions WHERE courseId = ? ORDER BY id ASC').all(id) as DbQuestion[]).map(formatQuestion);

  const courseDetail = {
    ...formatCourse(course),
    chapters,
    lessons: chapters.flatMap((ch) => ch.lessons),
    materials,
    questions,
  };

  res.json(success(courseDetail));
});

router.post('/', requireRole('teacher', 'admin', 'dean'), (req: Request, res: Response): void => {
  const body = req.body as CreateCourseRequest;

  if (!body.title) {
    res.status(400).json(error('课程标题不能为空', 400));
    return;
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO courses (id, title, subject, description, cover, credits, teacherId, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    body.title,
    body.subject || null,
    body.description || null,
    body.cover || null,
    body.credits ?? 0,
    body.teacherId || null,
    body.status || 'draft',
    now,
  );

  const created = db.prepare('SELECT * FROM courses WHERE id = ?').get(id) as DbCourse;
  res.status(201).json(success(formatCourse(created), '课程创建成功'));
});

router.put('/:id', requireRole('teacher', 'admin', 'dean'), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };
  const body = req.body as UpdateCourseRequest;

  const existing = db.prepare('SELECT id FROM courses WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json(error('课程不存在', 404));
    return;
  }

  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  if (body.title !== undefined) { fields.push('title = ?'); values.push(body.title); }
  if (body.subject !== undefined) { fields.push('subject = ?'); values.push(body.subject || null); }
  if (body.description !== undefined) { fields.push('description = ?'); values.push(body.description || null); }
  if (body.cover !== undefined) { fields.push('cover = ?'); values.push(body.cover || null); }
  if (body.credits !== undefined) { fields.push('credits = ?'); values.push(body.credits); }
  if (body.teacherId !== undefined) { fields.push('teacherId = ?'); values.push(body.teacherId || null); }
  if (body.status !== undefined) { fields.push('status = ?'); values.push(body.status); }

  if (fields.length === 0) {
    res.status(400).json(error('没有需要更新的字段', 400));
    return;
  }

  values.push(id);
  db.prepare(`UPDATE courses SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  const updated = db.prepare('SELECT * FROM courses WHERE id = ?').get(id) as DbCourse;
  res.json(success(formatCourse(updated), '课程更新成功'));
});

router.delete('/:id', requireRole('admin'), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };

  const existing = db.prepare('SELECT id FROM courses WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json(error('课程不存在', 404));
    return;
  }

  db.prepare('DELETE FROM courses WHERE id = ?').run(id);
  res.json(success(null, '课程删除成功'));
});

router.get('/:id/chapters', (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };

  const existing = db.prepare('SELECT id FROM courses WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json(error('课程不存在', 404));
    return;
  }

  const chapters = getChaptersWithLessons(id);
  res.json(success(chapters));
});

router.post('/:id/chapters', requireRole('teacher', 'admin', 'dean'), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };
  const body = req.body as CreateChapterRequest;

  const courseExists = db.prepare('SELECT id FROM courses WHERE id = ?').get(id);
  if (!courseExists) {
    res.status(404).json(error('课程不存在', 404));
    return;
  }

  if (!body.title) {
    res.status(400).json(error('章节标题不能为空', 400));
    return;
  }

  const chapterId = uuidv4();
  const maxOrder = db.prepare('SELECT COALESCE(MAX(orderNo), -1) as maxOrder FROM chapters WHERE courseId = ?').get(id) as { maxOrder: number };

  db.prepare('INSERT INTO chapters (id, courseId, title, orderNo) VALUES (?, ?, ?, ?)').run(
    chapterId,
    id,
    body.title,
    body.orderNo ?? (maxOrder.maxOrder + 1),
  );

  const created = db.prepare('SELECT * FROM chapters WHERE id = ?').get(chapterId) as DbChapter;
  res.status(201).json(success(formatChapter(created), '章节创建成功'));
});

router.put('/chapters/:id', requireRole('teacher', 'admin', 'dean'), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };
  const body = req.body as UpdateChapterRequest;

  const existing = db.prepare('SELECT id FROM chapters WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json(error('章节不存在', 404));
    return;
  }

  const fields: string[] = [];
  const values: Array<string | number> = [];

  if (body.title !== undefined) { fields.push('title = ?'); values.push(body.title); }
  if (body.orderNo !== undefined) { fields.push('orderNo = ?'); values.push(body.orderNo); }

  if (fields.length === 0) {
    res.status(400).json(error('没有需要更新的字段', 400));
    return;
  }

  values.push(id);
  db.prepare(`UPDATE chapters SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  const updated = db.prepare('SELECT * FROM chapters WHERE id = ?').get(id) as DbChapter;
  res.json(success(formatChapter(updated), '章节更新成功'));
});

router.delete('/chapters/:id', requireRole('teacher', 'admin', 'dean'), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };

  const existing = db.prepare('SELECT id FROM chapters WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json(error('章节不存在', 404));
    return;
  }

  db.prepare('DELETE FROM chapters WHERE id = ?').run(id);
  res.json(success(null, '章节删除成功'));
});

router.post('/:id/lessons', requireRole('teacher', 'admin', 'dean'), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };
  const body = req.body as CreateLessonRequest;

  const courseExists = db.prepare('SELECT id FROM courses WHERE id = ?').get(id);
  if (!courseExists) {
    res.status(404).json(error('课程不存在', 404));
    return;
  }

  if (!body.chapterId) {
    res.status(400).json(error('章节ID不能为空', 400));
    return;
  }

  if (!body.title) {
    res.status(400).json(error('课时标题不能为空', 400));
    return;
  }

  const chapterExists = db.prepare('SELECT id FROM chapters WHERE id = ? AND courseId = ?').get(body.chapterId, id);
  if (!chapterExists) {
    res.status(404).json(error('章节不存在或不属于该课程', 404));
    return;
  }

  const lessonId = uuidv4();

  db.prepare('INSERT INTO lessons (id, chapterId, title, type, duration, content) VALUES (?, ?, ?, ?, ?, ?)').run(
    lessonId,
    body.chapterId,
    body.title,
    body.type || null,
    body.duration ?? 0,
    body.content || null,
  );

  const created = db.prepare('SELECT * FROM lessons WHERE id = ?').get(lessonId) as DbLesson;
  res.status(201).json(success(formatLesson(created), '课时创建成功'));
});

router.put('/lessons/:id', requireRole('teacher', 'admin', 'dean'), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };
  const body = req.body as UpdateLessonRequest;

  const existing = db.prepare('SELECT id FROM lessons WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json(error('课时不存在', 404));
    return;
  }

  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  if (body.title !== undefined) { fields.push('title = ?'); values.push(body.title); }
  if (body.type !== undefined) { fields.push('type = ?'); values.push(body.type || null); }
  if (body.duration !== undefined) { fields.push('duration = ?'); values.push(body.duration); }
  if (body.content !== undefined) { fields.push('content = ?'); values.push(body.content || null); }

  if (fields.length === 0) {
    res.status(400).json(error('没有需要更新的字段', 400));
    return;
  }

  values.push(id);
  db.prepare(`UPDATE lessons SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  const updated = db.prepare('SELECT * FROM lessons WHERE id = ?').get(id) as DbLesson;
  res.json(success(formatLesson(updated), '课时更新成功'));
});

router.delete('/lessons/:id', requireRole('teacher', 'admin', 'dean'), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };

  const existing = db.prepare('SELECT id FROM lessons WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json(error('课时不存在', 404));
    return;
  }

  db.prepare('DELETE FROM lessons WHERE id = ?').run(id);
  res.json(success(null, '课时删除成功'));
});

router.post('/:id/materials', requireRole('teacher', 'admin', 'dean'), uploadSingle, (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };

  const courseExists = db.prepare('SELECT id FROM courses WHERE id = ?').get(id);
  if (!courseExists) {
    res.status(404).json(error('课程不存在', 404));
    return;
  }

  if (!req.file) {
    res.status(400).json(error('未上传文件', 400));
    return;
  }

  const materialId = uuidv4();
  const now = new Date().toISOString();

  db.prepare('INSERT INTO materials (id, courseId, filename, url, size, type, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    materialId,
    id,
    req.file.originalname,
    `/uploads/${req.file.filename}`,
    req.file.size,
    req.file.mimetype || null,
    now,
  );

  const created = db.prepare('SELECT * FROM materials WHERE id = ?').get(materialId) as DbMaterial;
  res.status(201).json(success(formatMaterial(created), '课件上传成功'));
});

router.get('/:id/materials', (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };

  const courseExists = db.prepare('SELECT id FROM courses WHERE id = ?').get(id);
  if (!courseExists) {
    res.status(404).json(error('课程不存在', 404));
    return;
  }

  const materials = (db.prepare('SELECT * FROM materials WHERE courseId = ? ORDER BY createdAt DESC').all(id) as DbMaterial[]).map(formatMaterial);
  res.json(success(materials));
});

router.delete('/materials/:id', requireRole('teacher', 'admin', 'dean'), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };

  const existing = db.prepare('SELECT id FROM materials WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json(error('课件不存在', 404));
    return;
  }

  db.prepare('DELETE FROM materials WHERE id = ?').run(id);
  res.json(success(null, '课件删除成功'));
});

router.get('/:id/questions', (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };

  const courseExists = db.prepare('SELECT id FROM courses WHERE id = ?').get(id);
  if (!courseExists) {
    res.status(404).json(error('课程不存在', 404));
    return;
  }

  const questions = (db.prepare('SELECT * FROM questions WHERE courseId = ? ORDER BY id ASC').all(id) as DbQuestion[]).map(formatQuestion);
  res.json(success(questions));
});

router.post('/:id/questions', requireRole('teacher', 'admin', 'dean'), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };
  const body = req.body as BatchCreateQuestionsRequest;

  const courseExists = db.prepare('SELECT id FROM courses WHERE id = ?').get(id);
  if (!courseExists) {
    res.status(404).json(error('课程不存在', 404));
    return;
  }

  if (!body.questions || !Array.isArray(body.questions) || body.questions.length === 0) {
    res.status(400).json(error('试题列表不能为空', 400));
    return;
  }

  const invalidIndex = body.questions.findIndex((q) => !q.type || !q.content || !q.answer);
  if (invalidIndex !== -1) {
    res.status(400).json(error(`第${invalidIndex + 1}道试题缺少必填字段`, 400));
    return;
  }

  const insertQuestion = db.prepare('INSERT INTO questions (id, courseId, type, content, options, answer, score, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

  const createdQuestions: Question[] = [];

  const insertMany = db.transaction(() => {
    for (const q of body.questions) {
      const questionId = uuidv4();
      insertQuestion.run(
        questionId,
        id,
        q.type,
        q.content,
        q.options || null,
        q.answer,
        q.score ?? 0,
        q.explanation || null,
      );
      const created = db.prepare('SELECT * FROM questions WHERE id = ?').get(questionId) as DbQuestion;
      createdQuestions.push(formatQuestion(created));
    }
  });

  insertMany();

  res.status(201).json(success(createdQuestions, '试题批量创建成功'));
});

router.put('/questions/:id', requireRole('teacher', 'admin', 'dean'), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };
  const body = req.body as UpdateQuestionRequest;

  const existing = db.prepare('SELECT id FROM questions WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json(error('试题不存在', 404));
    return;
  }

  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  if (body.type !== undefined) { fields.push('type = ?'); values.push(body.type); }
  if (body.content !== undefined) { fields.push('content = ?'); values.push(body.content); }
  if (body.options !== undefined) { fields.push('options = ?'); values.push(body.options || null); }
  if (body.answer !== undefined) { fields.push('answer = ?'); values.push(body.answer); }
  if (body.score !== undefined) { fields.push('score = ?'); values.push(body.score); }
  if (body.explanation !== undefined) { fields.push('explanation = ?'); values.push(body.explanation || null); }

  if (fields.length === 0) {
    res.status(400).json(error('没有需要更新的字段', 400));
    return;
  }

  values.push(id);
  db.prepare(`UPDATE questions SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  const updated = db.prepare('SELECT * FROM questions WHERE id = ?').get(id) as DbQuestion;
  res.json(success(formatQuestion(updated), '试题更新成功'));
});

router.delete('/questions/:id', requireRole('teacher', 'admin', 'dean'), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };

  const existing = db.prepare('SELECT id FROM questions WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json(error('试题不存在', 404));
    return;
  }

  db.prepare('DELETE FROM questions WHERE id = ?').run(id);
  res.json(success(null, '试题删除成功'));
});

router.get('/:id/recommend/:studentId', (req: Request, res: Response): void => {
  const { id, studentId } = req.params as { id: string; studentId: string };

  const courseExists = db.prepare('SELECT id FROM courses WHERE id = ?').get(id);
  if (!courseExists) {
    res.status(404).json(error('课程不存在', 404));
    return;
  }

  const studentExists = db.prepare('SELECT id FROM users WHERE id = ? AND role = ?').get(studentId, 'student');
  if (!studentExists) {
    res.status(404).json(error('学员不存在', 404));
    return;
  }

  const behaviors = db.prepare('SELECT * FROM learning_behaviors WHERE studentId = ?').all(studentId) as Array<{
    id: string;
    studentId: string;
    courseId: string | null;
    lessonId: string | null;
    watchDuration: number;
    completed: number;
    createdAt: string;
  }>;

  const courseIds = [...new Set(behaviors.filter(b => b.courseId).map(b => b.courseId as string))];

  const completedCourses: string[] = [];
  const courseProgress: Record<string, number> = {};
  const studyTimePerSubject: Record<string, number> = {};

  for (const cid of courseIds) {
    const courseBehaviors = behaviors.filter(b => b.courseId === cid);
    const totalWatch = courseBehaviors.reduce((sum, b) => sum + b.watchDuration, 0);
    if (totalWatch > 0) {
      const course = db.prepare('SELECT subject FROM courses WHERE id = ?').get(cid) as { subject: string | null } | undefined;
      if (course) {
        const subject = course.subject ?? '未分类';
        studyTimePerSubject[subject] = (studyTimePerSubject[subject] || 0) + totalWatch;
      }
    }

    const completedCount = courseBehaviors.filter(b => b.completed === 1).length;
    const progress = courseBehaviors.length > 0 ? completedCount / courseBehaviors.length : 0;
    courseProgress[cid] = progress;

    if (progress >= 0.8) {
      completedCourses.push(cid);
    }
  }

  const weakPoints: string[] = [];
  const strongPoints: string[] = [];

  for (const subject of Object.keys(studyTimePerSubject)) {
    if (studyTimePerSubject[subject] < 60) {
      weakPoints.push(subject);
    } else if (studyTimePerSubject[subject] > 300) {
      strongPoints.push(subject);
    }
  }

  const chapters = db.prepare('SELECT * FROM chapters WHERE courseId = ? ORDER BY orderNo ASC').all(id) as DbChapter[];
  const placeholders = chapters.map(() => '?').join(',');
  const lessons = db.prepare(`SELECT * FROM lessons WHERE chapterId IN (${placeholders}) ORDER BY id ASC`).all(...chapters.map(c => c.id)) as DbLesson[];

  const completedLessonIds = new Set(
    behaviors
      .filter(b => b.lessonId && b.completed === 1)
      .map(b => b.lessonId as string)
  );

  const recommendedPath = [];

  for (const chapter of chapters) {
    const chapterLessons = lessons.filter(l => l.chapterId === chapter.id);
    const chapterData = {
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      orderNo: chapter.orderNo,
      lessons: [] as Array<{
        lessonId: string;
        lessonTitle: string;
        duration: number;
        completed: boolean;
        priority: number;
      }>,
    };

    for (const lesson of chapterLessons) {
      const isCompleted = completedLessonIds.has(lesson.id);
      chapterData.lessons.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        duration: lesson.duration,
        completed: isCompleted,
        priority: isCompleted ? 999 : chapter.orderNo * 100 + chapterData.lessons.length,
      });
    }

    recommendedPath.push(chapterData);
  }

  const totalLessons = recommendedPath.flatMap(c => c.lessons);
  const pendingLessons = totalLessons.filter(l => !l.completed).sort((a, b) => a.priority - b.priority);

  const estimatedTotalDuration = pendingLessons.reduce((sum, l) => sum + l.duration, 0);

  const result = {
    courseId: id,
    studentId,
    chapters: recommendedPath,
    pendingLessons: pendingLessons.map(({ priority, ...rest }) => rest),
    totalLessons: totalLessons.length,
    completedLessons: totalLessons.filter(l => l.completed).length,
    progressPercent: totalLessons.length > 0
      ? Math.round((totalLessons.filter(l => l.completed).length / totalLessons.length) * 100)
      : 0,
    estimatedRemainingMinutes: estimatedTotalDuration,
    learningStyle: weakPoints.length > strongPoints.length ? '需要加强基础巩固' : '学习表现良好',
    weakPoints,
    strongPoints,
  };

  res.json(success(result, '学习路径推荐生成成功'));
});

export default router;
