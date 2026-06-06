import { Router, type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole, requireMinRole } from '../middleware/permission.js';
import { success, error } from '../utils/response.js';
import { gradeObjective, type ObjectiveQuestionType } from '../utils/grading.js';
import { ROLE_LEVELS } from '../utils/permission.js';
import type { Assignment, AssignmentQuestion, AssignmentSubmission, PaginatedResult, QuestionType } from '../types/index.js';

interface DbAssignment {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  deadline: string | null;
  createdAt: string;
}

interface DbAssignmentQuestion {
  id: string;
  assignmentId: string;
  type: string;
  content: string;
  options: string | null;
  answer: string;
  score: number;
}

interface DbAssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string;
  objectiveScore: number;
  subjectiveScore: number;
  totalScore: number;
  status: string;
  gradedAt: string | null;
  graderId: string | null;
  escalatedAt: string | null;
}

interface AssignmentQuestionInput {
  id?: string;
  type: QuestionType;
  content: string;
  options?: string | null;
  answer: string;
  score: number;
}

interface CreateAssignmentRequest {
  courseId: string;
  title: string;
  description?: string | null;
  deadline?: string | null;
  questions: AssignmentQuestionInput[];
}

interface UpdateAssignmentRequest {
  title?: string;
  description?: string | null;
  deadline?: string | null;
  questions?: AssignmentQuestionInput[];
}

interface SubmitAssignmentRequest {
  answers: Array<{
    questionId: string;
    answer: string | string[] | boolean | null;
  }>;
}

interface GradeSubmissionRequest {
  subjectiveScore: number;
}

const formatAssignment = (row: DbAssignment): Assignment => ({
  id: row.id,
  courseId: row.courseId,
  title: row.title,
  description: row.description,
  deadline: row.deadline,
  createdAt: row.createdAt,
});

const formatQuestion = (row: DbAssignmentQuestion): AssignmentQuestion => ({
  id: row.id,
  assignmentId: row.assignmentId,
  type: row.type as AssignmentQuestion['type'],
  content: row.content,
  options: row.options,
  answer: row.answer,
  score: row.score,
});

const formatSubmission = (row: DbAssignmentSubmission): AssignmentSubmission => ({
  id: row.id,
  assignmentId: row.assignmentId,
  studentId: row.studentId,
  submittedAt: row.submittedAt,
  objectiveScore: row.objectiveScore,
  subjectiveScore: row.subjectiveScore,
  totalScore: row.totalScore,
  status: row.status,
  gradedAt: row.gradedAt,
  graderId: row.graderId,
  escalatedAt: row.escalatedAt,
});

const OBJECTIVE_TYPES: ObjectiveQuestionType[] = ['single', 'multiple', 'judge'];

const assignmentsRouter = Router();
assignmentsRouter.use(authenticateToken);

assignmentsRouter.get('/', (req: Request, res: Response): void => {
  const { courseId, studentId, status, page = '1', pageSize = '20' } = req.query as {
    courseId?: string;
    studentId?: string;
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
    whereClauses.push('a.courseId = ?');
    params.push(courseId);
  }

  if (studentId && status) {
    whereClauses.push(`a.id IN (SELECT assignmentId FROM assignment_submissions WHERE studentId = ? AND status = ?)`);
    params.push(studentId, status);
  } else if (studentId) {
    whereClauses.push(`a.id IN (SELECT assignmentId FROM assignment_submissions WHERE studentId = ?)`);
    params.push(studentId);
  } else if (status) {
    whereClauses.push(`a.id IN (SELECT assignmentId FROM assignment_submissions WHERE status = ?)`);
    params.push(status);
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*) as total FROM assignments a ${whereClause}`;
  const totalResult = db.prepare(countSql).get(...params) as { total: number };
  const total = totalResult.total;

  const sql = `SELECT a.id, a.courseId, a.title, a.description, a.deadline, a.createdAt FROM assignments a ${whereClause} ORDER BY a.createdAt DESC LIMIT ? OFFSET ?`;
  const rows = db.prepare(sql).all(...params, limit, offset) as DbAssignment[];

  const items = rows.map(formatAssignment);

  const result: PaginatedResult<Assignment> = {
    items,
    total,
    page: pageNum,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  };

  res.json(success(result));
});

assignmentsRouter.get('/:id', (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };

  const assignment = db
    .prepare('SELECT id, courseId, title, description, deadline, createdAt FROM assignments WHERE id = ?')
    .get(id) as DbAssignment | undefined;

  if (!assignment) {
    res.status(404).json(error('作业不存在', 404));
    return;
  }

  const questions = db
    .prepare('SELECT id, assignmentId, type, content, options, answer, score FROM assignment_questions WHERE assignmentId = ? ORDER BY rowid')
    .all(id) as DbAssignmentQuestion[];

  const result = {
    ...formatAssignment(assignment),
    questions: questions.map(formatQuestion),
  };

  res.json(success(result));
});

assignmentsRouter.post('/', requireMinRole(ROLE_LEVELS.teacher), (req: Request, res: Response): void => {
  const body = req.body as CreateAssignmentRequest;

  if (!body.courseId || !body.title) {
    res.status(400).json(error('课程ID和标题不能为空', 400));
    return;
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  const insertAssignment = db.prepare(`
    INSERT INTO assignments (id, courseId, title, description, deadline, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertQuestion = db.prepare(`
    INSERT INTO assignment_questions (id, assignmentId, type, content, options, answer, score)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    insertAssignment.run(id, body.courseId, body.title, body.description || null, body.deadline || null, now);

    if (body.questions && body.questions.length > 0) {
      for (const q of body.questions) {
        const qid = q.id || uuidv4();
        insertQuestion.run(qid, id, q.type, q.content, q.options || null, q.answer, q.score || 0);
      }
    }
  });

  transaction();

  const created = db
    .prepare('SELECT id, courseId, title, description, deadline, createdAt FROM assignments WHERE id = ?')
    .get(id) as DbAssignment;

  const questions = db
    .prepare('SELECT id, assignmentId, type, content, options, answer, score FROM assignment_questions WHERE assignmentId = ? ORDER BY rowid')
    .all(id) as DbAssignmentQuestion[];

  const result = {
    ...formatAssignment(created),
    questions: questions.map(formatQuestion),
  };

  res.status(201).json(success(result, '创建成功', 201));
});

assignmentsRouter.put('/:id', requireMinRole(ROLE_LEVELS.teacher), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };
  const body = req.body as UpdateAssignmentRequest;

  const existing = db.prepare('SELECT id FROM assignments WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json(error('作业不存在', 404));
    return;
  }

  const fields: string[] = [];
  const values: Array<string | null> = [];

  if (body.title !== undefined) { fields.push('title = ?'); values.push(body.title); }
  if (body.description !== undefined) { fields.push('description = ?'); values.push(body.description || null); }
  if (body.deadline !== undefined) { fields.push('deadline = ?'); values.push(body.deadline || null); }

  const transaction = db.transaction(() => {
    if (fields.length > 0) {
      values.push(id);
      const sql = `UPDATE assignments SET ${fields.join(', ')} WHERE id = ?`;
      db.prepare(sql).run(...values);
    }

    if (body.questions) {
      db.prepare('DELETE FROM assignment_questions WHERE assignmentId = ?').run(id);

      const insertQuestion = db.prepare(`
        INSERT INTO assignment_questions (id, assignmentId, type, content, options, answer, score)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const q of body.questions) {
        const qid = q.id || uuidv4();
        insertQuestion.run(qid, id, q.type, q.content, q.options || null, q.answer, q.score || 0);
      }
    }
  });

  transaction();

  const updated = db
    .prepare('SELECT id, courseId, title, description, deadline, createdAt FROM assignments WHERE id = ?')
    .get(id) as DbAssignment;

  const questions = db
    .prepare('SELECT id, assignmentId, type, content, options, answer, score FROM assignment_questions WHERE assignmentId = ? ORDER BY rowid')
    .all(id) as DbAssignmentQuestion[];

  const result = {
    ...formatAssignment(updated),
    questions: questions.map(formatQuestion),
  };

  res.json(success(result, '更新成功'));
});

assignmentsRouter.delete('/:id', requireMinRole(ROLE_LEVELS.teacher), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };

  const existing = db.prepare('SELECT id FROM assignments WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json(error('作业不存在', 404));
    return;
  }

  db.prepare('DELETE FROM assignments WHERE id = ?').run(id);

  res.json(success({ message: '删除成功' }));
});

assignmentsRouter.get('/:id/submissions', requireMinRole(ROLE_LEVELS.assistant), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };
  const { status } = req.query as { status?: string };

  const assignment = db.prepare('SELECT id FROM assignments WHERE id = ?').get(id);
  if (!assignment) {
    res.status(404).json(error('作业不存在', 404));
    return;
  }

  let whereClause = 'WHERE assignmentId = ?';
  const params: Array<string> = [id];

  if (status) {
    whereClause += ' AND status = ?';
    params.push(status);
  }

  const sql = `SELECT * FROM assignment_submissions ${whereClause} ORDER BY submittedAt DESC`;
  const rows = db.prepare(sql).all(...params) as DbAssignmentSubmission[];

  const submissions = rows.map(formatSubmission);
  res.json(success(submissions));
});

assignmentsRouter.post('/:id/submit', requireRole('student'), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };
  const body = req.body as SubmitAssignmentRequest;

  if (!req.user) {
    res.status(401).json(error('用户未认证', 401));
    return;
  }

  const assignment = db.prepare('SELECT id, courseId FROM assignments WHERE id = ?').get(id) as DbAssignment | undefined;
  if (!assignment) {
    res.status(404).json(error('作业不存在', 404));
    return;
  }

  const existingSubmission = db
    .prepare('SELECT id FROM assignment_submissions WHERE assignmentId = ? AND studentId = ?')
    .get(id, req.user.id);
  if (existingSubmission) {
    res.status(400).json(error('已提交过该作业', 400));
    return;
  }

  const questions = db
    .prepare('SELECT id, assignmentId, type, content, options, answer, score FROM assignment_questions WHERE assignmentId = ?')
    .all(id) as DbAssignmentQuestion[];

  if (questions.length === 0) {
    res.status(400).json(error('作业暂无题目', 400));
    return;
  }

  let objectiveScore = 0;
  let hasSubjective = false;
  const answersMap = new Map<string, string | string[] | boolean | null>();
  if (body.answers) {
    for (const ans of body.answers) {
      answersMap.set(ans.questionId, ans.answer);
    }
  }

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
      objectiveScore += result.score;
    } else {
      hasSubjective = true;
    }
  }

  const assistants = db
    .prepare("SELECT id FROM users WHERE role = 'assistant' AND status = 'active' ORDER BY RANDOM() LIMIT 1")
    .all() as Array<{ id: string }>;

  const graderId = assistants.length > 0 ? assistants[0].id : null;

  const submissionId = uuidv4();
  const now = new Date().toISOString();
  const status = hasSubjective ? 'pending_grader' : 'graded';
  const totalScore = objectiveScore;
  const gradedAt = hasSubjective ? null : now;

  db.prepare(`
    INSERT INTO assignment_submissions (id, assignmentId, studentId, submittedAt, objectiveScore, subjectiveScore, totalScore, status, gradedAt, graderId, escalatedAt)
    VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, NULL)
  `).run(submissionId, id, req.user.id, now, objectiveScore, totalScore, status, gradedAt, graderId);

  const submission = db
    .prepare('SELECT * FROM assignment_submissions WHERE id = ?')
    .get(submissionId) as DbAssignmentSubmission;

  res.status(201).json(success(formatSubmission(submission), '提交成功', 201));
});

const submissionsRouter = Router();
submissionsRouter.use(authenticateToken);

submissionsRouter.put('/:id/grade', requireMinRole(ROLE_LEVELS.assistant), (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };
  const body = req.body as GradeSubmissionRequest;

  if (!req.user) {
    res.status(401).json(error('用户未认证', 401));
    return;
  }

  const submission = db
    .prepare('SELECT * FROM assignment_submissions WHERE id = ?')
    .get(id) as DbAssignmentSubmission | undefined;

  if (!submission) {
    res.status(404).json(error('提交记录不存在', 404));
    return;
  }

  const now = new Date().toISOString();
  const totalScore = submission.objectiveScore + (body.subjectiveScore || 0);
  const submittedAt = new Date(submission.submittedAt).getTime();
  const currentTime = new Date(now).getTime();
  const hoursDiff = (currentTime - submittedAt) / (1000 * 60 * 60);

  const isAssistant = req.user.role === 'assistant';
  const shouldEscalate = isAssistant && hoursDiff > 48;

  db.prepare(`
    UPDATE assignment_submissions
    SET subjectiveScore = ?, totalScore = ?, gradedAt = ?, graderId = ?, status = 'graded', escalatedAt = ?
    WHERE id = ?
  `).run(body.subjectiveScore || 0, totalScore, now, req.user.id, shouldEscalate ? now : null, id);

  const updated = db
    .prepare('SELECT * FROM assignment_submissions WHERE id = ?')
    .get(id) as DbAssignmentSubmission;

  res.json(success(formatSubmission(updated), '批改成功'));
});

submissionsRouter.get('/pending-escalation', requireMinRole(ROLE_LEVELS.dean), (_req: Request, res: Response): void => {
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const rows = db
    .prepare(`
      SELECT * FROM assignment_submissions
      WHERE status = 'pending_grader'
        AND submittedAt < ?
        AND escalatedAt IS NULL
      ORDER BY submittedAt ASC
    `)
    .all(fortyEightHoursAgo) as DbAssignmentSubmission[];

  const submissions = rows.map(formatSubmission);
  res.json(success(submissions));
});

export { assignmentsRouter, submissionsRouter };
export default assignmentsRouter;
