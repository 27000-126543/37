import Database from 'better-sqlite3';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { DB_PATH, DATA_DIR } from '../config/index.js';
import { initDatabase as initSchema } from './schema.js';

let dbInstance: Database.Database | null = null;

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getDb(): Database.Database {
  if (!dbInstance) {
    ensureDataDir();
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
  }
  return dbInstance;
}

export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

export const db = getDb();

export const initDatabase = initSchema;

export function seedDatabase(): void {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) return;

  const hash = (pwd: string): string => bcrypt.hashSync(pwd, 10);

  const insertUser = db.prepare(`
    INSERT INTO users (id, role, username, password, realName, email, phone, avatar, status, createdAt)
    VALUES (@id, @role, @username, @password, @realName, @email, @phone, @avatar, @status, @createdAt)
  `);

  const now = new Date().toISOString();
  const users = [
    { id: uuidv4(), role: 'admin', username: 'admin', password: hash('123456'), realName: '张管理', email: 'admin@vocedu.com', phone: '13800000001', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin001', status: 'active', createdAt: now },
    { id: uuidv4(), role: 'dean', username: 'dean', password: hash('123456'), realName: '李主任', email: 'dean@vocedu.com', phone: '13800000002', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dean002', status: 'active', createdAt: now },
    { id: uuidv4(), role: 'teacher', username: 'teacher1', password: hash('123456'), realName: '王建国', email: 'wangjs@vocedu.com', phone: '13800000003', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher003', status: 'active', createdAt: now },
    { id: uuidv4(), role: 'teacher', username: 'teacher2', password: hash('123456'), realName: '陈思琪', email: 'chensj@vocedu.com', phone: '13800000004', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher004', status: 'active', createdAt: now },
    { id: uuidv4(), role: 'assistant', username: 'assistant1', password: hash('123456'), realName: '赵明宇', email: 'zhaozj@vocedu.com', phone: '13800000005', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=asst005', status: 'active', createdAt: now },
    { id: uuidv4(), role: 'assistant', username: 'assistant2', password: hash('123456'), realName: '孙雨萱', email: 'sunzj@vocedu.com', phone: '13800000006', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=asst006', status: 'active', createdAt: now },
    { id: uuidv4(), role: 'student', username: 'student1', password: hash('123456'), realName: '刘小鹏', email: 'liuxp@vocedu.com', phone: '13900000001', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student007', status: 'active', createdAt: now },
    { id: uuidv4(), role: 'student', username: 'student2', password: hash('123456'), realName: '王小美', email: 'wangxm@vocedu.com', phone: '13900000002', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student008', status: 'active', createdAt: now },
    { id: uuidv4(), role: 'student', username: 'student3', password: hash('123456'), realName: '陈志强', email: 'chenzq@vocedu.com', phone: '13900000003', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student009', status: 'active', createdAt: now },
    { id: uuidv4(), role: 'student', username: 'student4', password: hash('123456'), realName: '李思琪', email: 'lisq@vocedu.com', phone: '13900000004', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student010', status: 'active', createdAt: now },
    { id: uuidv4(), role: 'student', username: 'student5', password: hash('123456'), realName: '周子轩', email: 'zhouzx@vocedu.com', phone: '13900000005', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student011', status: 'active', createdAt: now }
  ];

  const teacherIds = users.filter(u => u.role === 'teacher').map(u => u.id);
  const studentIds = users.filter(u => u.role === 'student').map(u => u.id);

  const insertMany = db.transaction((list: typeof users) => {
    for (const u of list) insertUser.run(u);
  });
  insertMany(users);

  const insertCourse = db.prepare(`
    INSERT INTO courses (id, title, subject, description, cover, credits, teacherId, status, createdAt)
    VALUES (@id, @title, @subject, @description, @cover, @credits, @teacherId, @status, @createdAt)
  `);

  const courses = [
    { id: uuidv4(), title: 'Python从入门到精通', subject: '编程语言', description: '系统学习Python编程语言，从基础语法到高级应用', cover: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400', credits: 4, teacherId: teacherIds[0], status: 'published', createdAt: now },
    { id: uuidv4(), title: '数据分析实战', subject: '数据科学', description: '使用Python进行数据分析的完整教程', cover: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', credits: 3, teacherId: teacherIds[0], status: 'published', createdAt: now },
    { id: uuidv4(), title: 'UI设计基础', subject: '设计创意', description: '学习UI设计的基本原则和工具使用', cover: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400', credits: 3, teacherId: teacherIds[1], status: 'published', createdAt: now },
    { id: uuidv4(), title: '网络安全入门', subject: '网络安全', description: '网络安全基础知识和常见攻击防护', cover: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400', credits: 2, teacherId: teacherIds[0], status: 'published', createdAt: now },
    { id: uuidv4(), title: '机器学习基础', subject: '人工智能', description: '机器学习算法原理与Python实现', cover: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400', credits: 5, teacherId: teacherIds[0], status: 'published', createdAt: now },
    { id: uuidv4(), title: '交互设计原理', subject: '设计创意', description: '用户体验设计的核心原则和方法论', cover: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400', credits: 2, teacherId: teacherIds[1], status: 'published', createdAt: now }
  ];

  const insertCourses = db.transaction((list: typeof courses) => {
    for (const c of list) insertCourse.run(c);
  });
  insertCourses(courses);

  const insertExam = db.prepare(`
    INSERT INTO exams (id, courseId, title, duration, totalScore, passScore, questionCount, startTime, endTime, status)
    VALUES (@id, @courseId, @title, @duration, @totalScore, @passScore, @questionCount, @startTime, @endTime, @status)
  `);

  const exams = [
    { id: uuidv4(), courseId: courses[0].id, title: 'Python基础结业考试', duration: 90, totalScore: 100, passScore: 60, questionCount: 30, startTime: '2025-03-01 09:00:00', endTime: '2025-12-31 18:00:00', status: 'published' },
    { id: uuidv4(), courseId: courses[1].id, title: '数据分析能力测试', duration: 120, totalScore: 100, passScore: 65, questionCount: 25, startTime: '2025-04-01 09:00:00', endTime: '2025-12-31 18:00:00', status: 'published' },
    { id: uuidv4(), courseId: courses[2].id, title: 'UI设计规范考核', duration: 60, totalScore: 100, passScore: 70, questionCount: 20, startTime: '2025-04-15 09:00:00', endTime: '2025-12-31 18:00:00', status: 'published' }
  ];

  const insertExams = db.transaction((list: typeof exams) => {
    for (const e of list) insertExam.run(e);
  });
  insertExams(exams);

  const insertAttempt = db.prepare(`
    INSERT INTO exam_attempts (id, examId, studentId, startedAt, submittedAt, score, passed, switchCount, answers)
    VALUES (@id, @examId, @studentId, @startedAt, @submittedAt, @score, @passed, @switchCount, @answers)
  `);

  const attempts = [
    { id: uuidv4(), examId: exams[0].id, studentId: studentIds[0], startedAt: '2025-05-01 10:00:00', submittedAt: '2025-05-01 11:25:00', score: 90, passed: 1, switchCount: 0, answers: '{}' },
    { id: uuidv4(), examId: exams[0].id, studentId: studentIds[1], startedAt: '2025-05-02 14:00:00', submittedAt: '2025-05-02 15:30:00', score: 63, passed: 1, switchCount: 2, answers: '{}' },
    { id: uuidv4(), examId: exams[0].id, studentId: studentIds[2], startedAt: '2025-05-03 09:00:00', submittedAt: '2025-05-03 10:15:00', score: 52, passed: 0, switchCount: 1, answers: '{}' },
    { id: uuidv4(), examId: exams[1].id, studentId: studentIds[0], startedAt: '2025-05-10 09:00:00', submittedAt: '2025-05-10 10:55:00', score: 87, passed: 1, switchCount: 0, answers: '{}' },
    { id: uuidv4(), examId: exams[2].id, studentId: studentIds[1], startedAt: '2025-05-12 14:00:00', submittedAt: '2025-05-12 14:55:00', score: 86, passed: 1, switchCount: 0, answers: '{}' }
  ];

  const insertAttempts = db.transaction((list: typeof attempts) => {
    for (const a of list) insertAttempt.run(a);
  });
  insertAttempts(attempts);

  const insertBehavior = db.prepare(`
    INSERT INTO learning_behaviors (id, studentId, courseId, lessonId, watchDuration, completed, createdAt)
    VALUES (@id, @studentId, @courseId, @lessonId, @watchDuration, @completed, @createdAt)
  `);

  const behaviors: Array<{
    id: string;
    studentId: string;
    courseId: string | null;
    lessonId: string | null;
    watchDuration: number;
    completed: number;
    createdAt: string;
  }> = [];

  for (let i = 0; i < 60; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    behaviors.push({
      id: uuidv4(),
      studentId: studentIds[i % studentIds.length],
      courseId: courses[i % courses.length].id,
      lessonId: null,
      watchDuration: 10 + Math.floor(Math.random() * 120),
      completed: Math.random() > 0.4 ? 1 : 0,
      createdAt: d.toISOString()
    });
  }

  const insertBehaviors = db.transaction((list: typeof behaviors) => {
    for (const b of list) insertBehavior.run(b);
  });
  insertBehaviors(behaviors);
}

export default db;
