import { Router, type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole, requireMinRole } from '../middleware/permission.js';
import { success, error } from '../utils/response.js';
import { gradeObjective, type ObjectiveQuestionType } from '../utils/grading.js';
import { ROLE_LEVELS } from '../utils/permission.js';
import type { Exam, ExamAttempt, ExamQuestion, PaginatedResult, QuestionType } from '../types/index.js';

interface DbExam {
  id: string;
  courseId: string;
  title: string;
  duration: number;
  totalScore: number;
  passScore: number;
  questionCount: number;
  startTime: string | null;
  endTime: string | null;
  status: string;
}

interface DbExamQuestion {
  id: string;
  examId: string;
  type: string;
  content: string;
  options: string | null;
  answer: string;
  score: number;
}

interface DbExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  startedAt: string;
  submittedAt: string | null;
  score: number;
  passed: number;
  switchCount: number;
  answers: string | null;
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

interface CreateExamRequest {
  courseId: string;
  title: string;
  duration?: number;
  totalScore?: number;
  passScore?: number;
  questionCount?: number;
  startTime?: string | null;
  endTime?: string | null;
  status?: string;
}

interface UpdateExamRequest {
  title?: string;
  duration?: number;
  totalScore?: number;
  passScore?: number;
  questionCount?: number;
  startTime?: string | null;
  endTime?: string | null;
  status?: string;
}

interface StartExamResult {
  attemptId: string;
  questions: ExamQuestion[];
}

interface SubmitExamRequest {
  answers: Array<{
    questionId: string;
    answer: string | string[] | boolean | null;
  }>;
}

const formatExam = (row: DbExam): Exam => ({
  id: row.id,
  courseId: row.courseId,
  title: row.title,
  duration: row.duration,
  totalScore: row.totalScore,
  passScore: row.passScore,
  questionCount: row.questionCount,
  startTime: row.startTime,
  endTime: row.endTime,
  status: row.status as Exam['status'],
});

const formatExamQuestion = (row: DbExamQuestion): ExamQuestion => ({
  id: row.id,
  examId: row.examId,
  type: row.type as ExamQuestion['type'],
  content: row.content,
  options: row.options,
  answer: row.answer,
  score: row.score,
});

const formatExamAttempt = (row: DbExamAttempt): ExamAttempt => ({
  id: row.id,
  examId: row.examId,
  studentId: row.studentId,
  startedAt: row.startedAt,
  submittedAt: row.submittedAt,
  score: row.score,
  passed: row.passed,
  switchCount: row.switchCount,
  answers: row.answers,
});

const OBJECTIVE_TYPES: ObjectiveQuestionType[] = ['single', 'multiple', 'judge'];

const examsRouter = Router();
examsRouter.use(authenticateToken);

examsRouter.get('/', (req: Request, res: Response): void => {
  const { courseId, status, page = '1', pageSize = '20' } = req.query as {
    courseId?: string;
    status?: string;
    page?: string;
    pageSize?: string;
  };

  const pageNum = Math.max(1, parseInt(page, 10));
  const limit = Math.max(1, Math.min(100, parseInt(pageSize, 10)));
  const offset = (pageNum - 1) * limit;

  const whereClauses: string[] = [];
  const params: Array<string | number> = [];

  if (courseId) {
    whereClauses.push('courseId = ?');
    params.push(courseId);
  }
  if (status) {
    whereClauses.push('status = ?');
    params.push(status);
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*) as total FROM exams ${whereClause}`;
  const totalResult = db.prepare(countSql).get(...params) as { total: number };
  const total = totalResult.total;

  const sql = `SELECT * FROM exams ${whereClause} ORDER BY COALESCE(startTime, createdAt) DESC LIMIT ? OFFSET ?`;
  const rows = db.prepare(sql).all(...params, limit, offset) as DbExam[];

  const items = rows.map(formatExam);

  const result: PaginatedResult<Exam> = {
    items,
    total,
    page: pageNum,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  };

  res.json(success(result));
});

examsRouter.get('/:id', (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };

  const exam = db.prepare('SELECT * FROM exams WHERE id = ?').get(id) as DbExam | undefined;
  if (!exam) {
    res.status(404).json(error('考试不存在', 404));
    return;
  }

  const questions = db
    .prepare('SELECT * FROM exam_questions WHERE examId = ? ORDER BY rowid')
    .all(id) as DbExamQuestion[];

  const result = {
    ...formatExam(exam),
    questions: questions.map(formatExamQuestion),
  };

  res.json(success(result));
});

examsRouter.post('/', requireMinRole(ROLE_LEVELS.teacher), (req: Request, res: Response): void => {
  const body = req.body as CreateExamRequest;

  if (!body.courseId || !body.title) {
    res.status(400).json(error('课程ID和标题不能为空', 400));
    return;
  }

  const id = uuidv4();

  db.prepare(`
    INSERT INTO exams (id, courseId, title, duration, totalScore, passScore, questionCount, startTime, endTime, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    body.courseId,
    body.title,
    body.duration || 0,
    body.totalScore || 100,
    body.passScore || 60,
    body.questionCount || 0,
    body.startTime || null,
    body.endTime || null,
    body.status || 'draft',
  );

  const created = db.prepare('SELECT * FROM exams WHERE id = ?').get(id) as DbExam;
  res.status(201).json(success(formatExam(created), '创建成功', 201));
});

examsRouter.put('/:id', requireMinRole(ROLE_LEVELS.teacher), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };
  const body = req.body as UpdateExamRequest;

  const existing = db.prepare('SELECT id FROM exams WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json(error('考试不存在', 404));
    return;
  }

  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  if (body.title !== undefined) { fields.push('title = ?'); values.push(body.title); }
  if (body.duration !== undefined) { fields.push('duration = ?'); values.push(body.duration); }
  if (body.totalScore !== undefined) { fields.push('totalScore = ?'); values.push(body.totalScore); }
  if (body.passScore !== undefined) { fields.push('passScore = ?'); values.push(body.passScore); }
  if (body.questionCount !== undefined) { fields.push('questionCount = ?'); values.push(body.questionCount); }
  if (body.startTime !== undefined) { fields.push('startTime = ?'); values.push(body.startTime || null); }
  if (body.endTime !== undefined) { fields.push('endTime = ?'); values.push(body.endTime || null); }
  if (body.status !== undefined) { fields.push('status = ?'); values.push(body.status); }

  if (fields.length === 0) {
    res.status(400).json(error('没有需要更新的字段', 400));
    return;
  }

  values.push(id);
  const sql = `UPDATE exams SET ${fields.join(', ')} WHERE id = ?`;
  db.prepare(sql).run(...values);

  const updated = db.prepare('SELECT * FROM exams WHERE id = ?').get(id) as DbExam;
  res.json(success(formatExam(updated), '更新成功'));
});

examsRouter.delete('/:id', requireMinRole(ROLE_LEVELS.teacher), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };

  const existing = db.prepare('SELECT id FROM exams WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json(error('考试不存在', 404));
    return;
  }

  db.prepare('DELETE FROM exams WHERE id = ?').run(id);
  res.json(success({ message: '删除成功' }));
});

examsRouter.post('/:id/start', requireRole('student'), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };

  if (!req.user) {
    res.status(401).json(error('用户未认证', 401));
    return;
  }

  const exam = db.prepare('SELECT * FROM exams WHERE id = ?').get(id) as DbExam | undefined;
  if (!exam) {
    res.status(404).json(error('考试不存在', 404));
    return;
  }

  const existingAttempt = db
    .prepare('SELECT id FROM exam_attempts WHERE examId = ? AND studentId = ? AND submittedAt IS NULL')
    .get(id, req.user.id);
  if (existingAttempt) {
    res.status(400).json(error('已有进行中的考试', 400));
    return;
  }

  let examQuestions = db
    .prepare('SELECT * FROM exam_questions WHERE examId = ? ORDER BY RANDOM()')
    .all(id) as DbExamQuestion[];

  const needed = exam.questionCount - examQuestions.length;
  if (needed > 0) {
    const poolQuestions = db
      .prepare('SELECT * FROM questions WHERE courseId = ? ORDER BY RANDOM() LIMIT ?')
      .all(exam.courseId, needed) as DbQuestion[];

    for (const pq of poolQuestions) {
      const eqId = uuidv4();
      db.prepare(`
        INSERT INTO exam_questions (id, examId, type, content, options, answer, score)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(eqId, id, pq.type, pq.content, pq.options || null, pq.answer, pq.score || 0);
    }

    examQuestions = db
      .prepare('SELECT * FROM exam_questions WHERE examId = ? ORDER BY RANDOM()')
      .all(id) as DbExamQuestion[];
  }

  const selectedQuestions = exam.questionCount > 0
    ? examQuestions.slice(0, exam.questionCount)
    : examQuestions;

  const attemptId = uuidv4();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO exam_attempts (id, examId, studentId, startedAt, submittedAt, score, passed, switchCount, answers)
    VALUES (?, ?, ?, ?, NULL, 0, 0, 0, '[]')
  `).run(attemptId, id, req.user.id, now);

  const result: StartExamResult = {
    attemptId,
    questions: selectedQuestions.map(formatExamQuestion),
  };

  res.status(201).json(success(result, '考试开始', 201));
});

const examAttemptsRouter = Router();
examAttemptsRouter.use(authenticateToken);

examAttemptsRouter.post('/:id/switch', requireRole('student'), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };

  if (!req.user) {
    res.status(401).json(error('用户未认证', 401));
    return;
  }

  const attempt = db.prepare('SELECT * FROM exam_attempts WHERE id = ?').get(id) as DbExamAttempt | undefined;
  if (!attempt) {
    res.status(404).json(error('考试记录不存在', 404));
    return;
  }

  if (attempt.studentId !== req.user.id) {
    res.status(403).json(error('无权限操作此考试记录', 403));
    return;
  }

  if (attempt.submittedAt) {
    res.status(400).json(error('考试已交卷', 400));
    return;
  }

  const newSwitchCount = attempt.switchCount + 1;

  if (newSwitchCount >= 3) {
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE exam_attempts
      SET switchCount = ?, submittedAt = ?
      WHERE id = ?
    `).run(newSwitchCount, now, id);

    const updated = db.prepare('SELECT * FROM exam_attempts WHERE id = ?').get(id) as DbExamAttempt;
    res.json(success(formatExamAttempt(updated), '切屏次数超过限制，已自动交卷'));
    return;
  }

  db.prepare('UPDATE exam_attempts SET switchCount = ? WHERE id = ?').run(newSwitchCount, id);
  const updated = db.prepare('SELECT * FROM exam_attempts WHERE id = ?').get(id) as DbExamAttempt;
  res.json(success(formatExamAttempt(updated), '已记录切屏'));
});

examAttemptsRouter.post('/:id/submit', requireRole('student'), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };
  const body = req.body as SubmitExamRequest;

  if (!req.user) {
    res.status(401).json(error('用户未认证', 401));
    return;
  }

  const attempt = db.prepare('SELECT * FROM exam_attempts WHERE id = ?').get(id) as DbExamAttempt | undefined;
  if (!attempt) {
    res.status(404).json(error('考试记录不存在', 404));
    return;
  }

  if (attempt.studentId !== req.user.id) {
    res.status(403).json(error('无权限操作此考试记录', 403));
    return;
  }

  if (attempt.submittedAt) {
    res.status(400).json(error('考试已交卷', 400));
    return;
  }

  const exam = db.prepare('SELECT * FROM exams WHERE id = ?').get(attempt.examId) as DbExam | undefined;
  if (!exam) {
    res.status(404).json(error('关联考试不存在', 404));
    return;
  }

  const questions = db
    .prepare('SELECT * FROM exam_questions WHERE examId = ?')
    .all(attempt.examId) as DbExamQuestion[];

  const answersMap = new Map<string, string | string[] | boolean | null>();
  if (body.answers) {
    for (const ans of body.answers) {
      answersMap.set(ans.questionId, ans.answer);
    }
  }

  let totalScore = 0;
  for (const q of questions) {
    const qType = q.type as QuestionType;
    if (OBJECTIVE_TYPES.includes(qType as ObjectiveQuestionType)) {
      const userAnswer = answersMap.get(q.id);
      const correctAnswer = (() => {
        try {
          const parsed = JSON.parse(q.answer);
          return parsed;
        } catch {
          return q.answer;
        }
      })();
      const result = gradeObjective(qType as ObjectiveQuestionType, userAnswer, correctAnswer, q.score);
      totalScore += result.score;
    }
  }

  const passed = totalScore >= exam.passScore ? 1 : 0;
  const now = new Date().toISOString();
  const answersJson = JSON.stringify(body.answers || []);

  const transaction = db.transaction(() => {
    db.prepare(`
      UPDATE exam_attempts
      SET score = ?, passed = ?, submittedAt = ?, answers = ?
      WHERE id = ?
    `).run(totalScore, passed, now, answersJson, id);

    if (passed) {
      const certId = uuidv4();
      const userId = req.user!.id;
      db.prepare(`
        INSERT INTO certificates (id, studentId, courseId, score, issuedAt, status, reviewedAt, reviewerId, remark)
        VALUES (?, ?, ?, ?, ?, 'pending_review', NULL, NULL, NULL)
      `).run(certId, userId, exam.courseId, totalScore, now);
    }
  });

  transaction();

  const updated = db.prepare('SELECT * FROM exam_attempts WHERE id = ?').get(id) as DbExamAttempt;
  res.json(success(formatExamAttempt(updated), '交卷成功'));
});

examAttemptsRouter.get('/', (req: Request, res: Response): void => {
  const { studentId, examId } = req.query as {
    studentId?: string;
    examId?: string;
  };

  const whereClauses: string[] = [];
  const params: Array<string> = [];

  if (studentId) {
    whereClauses.push('studentId = ?');
    params.push(studentId);
  }
  if (examId) {
    whereClauses.push('examId = ?');
    params.push(examId);
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const sql = `SELECT * FROM exam_attempts ${whereClause} ORDER BY startedAt DESC`;
  const rows = db.prepare(sql).all(...params) as DbExamAttempt[];

  const attempts = rows.map(formatExamAttempt);
  res.json(success(attempts));
});

examAttemptsRouter.get('/:id', (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };

  const attempt = db.prepare('SELECT * FROM exam_attempts WHERE id = ?').get(id) as DbExamAttempt | undefined;
  if (!attempt) {
    res.status(404).json(error('考试记录不存在', 404));
    return;
  }

  res.json(success(formatExamAttempt(attempt)));
});

export { examsRouter, examAttemptsRouter };
export default examsRouter;
