import type { Database } from 'better-sqlite3';
import { getDb } from './index.js';

export function initDatabase(database?: Database): void {
  const db = database || getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL DEFAULT 'student',
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      realName TEXT,
      email TEXT,
      phone TEXT,
      avatar TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subject TEXT,
      description TEXT,
      cover TEXT,
      credits REAL NOT NULL DEFAULT 0,
      teacherId TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (teacherId) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_courses_teacherId ON courses(teacherId);
    CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
    CREATE INDEX IF NOT EXISTS idx_courses_subject ON courses(subject);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY,
      courseId TEXT NOT NULL,
      title TEXT NOT NULL,
      orderNo INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_chapters_courseId ON chapters(courseId);
    CREATE INDEX IF NOT EXISTS idx_chapters_courseId_orderNo ON chapters(courseId, orderNo);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      chapterId TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT,
      duration INTEGER NOT NULL DEFAULT 0,
      content TEXT,
      FOREIGN KEY (chapterId) REFERENCES chapters(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_lessons_chapterId ON lessons(chapterId);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      courseId TEXT NOT NULL,
      filename TEXT NOT NULL,
      url TEXT NOT NULL,
      size INTEGER NOT NULL DEFAULT 0,
      type TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_materials_courseId ON materials(courseId);
    CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(type);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      courseId TEXT NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      options TEXT,
      answer TEXT NOT NULL,
      score INTEGER NOT NULL DEFAULT 0,
      explanation TEXT,
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_questions_courseId ON questions(courseId);
    CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      courseId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      deadline TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_assignments_courseId ON assignments(courseId);
    CREATE INDEX IF NOT EXISTS idx_assignments_deadline ON assignments(deadline);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS assignment_questions (
      id TEXT PRIMARY KEY,
      assignmentId TEXT NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      options TEXT,
      answer TEXT NOT NULL,
      score INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_assignment_questions_assignmentId ON assignment_questions(assignmentId);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS assignment_submissions (
      id TEXT PRIMARY KEY,
      assignmentId TEXT NOT NULL,
      studentId TEXT NOT NULL,
      submittedAt TEXT NOT NULL DEFAULT (datetime('now')),
      objectiveScore REAL NOT NULL DEFAULT 0,
      subjectiveScore REAL NOT NULL DEFAULT 0,
      totalScore REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'submitted',
      gradedAt TEXT,
      graderId TEXT,
      escalatedAt TEXT,
      FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE CASCADE,
      FOREIGN KEY (studentId) REFERENCES users(id),
      FOREIGN KEY (graderId) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignmentId ON assignment_submissions(assignmentId);
    CREATE INDEX IF NOT EXISTS idx_assignment_submissions_studentId ON assignment_submissions(studentId);
    CREATE INDEX IF NOT EXISTS idx_assignment_submissions_status ON assignment_submissions(status);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS exams (
      id TEXT PRIMARY KEY,
      courseId TEXT NOT NULL,
      title TEXT NOT NULL,
      duration INTEGER NOT NULL DEFAULT 0,
      totalScore INTEGER NOT NULL DEFAULT 0,
      passScore INTEGER NOT NULL DEFAULT 0,
      questionCount INTEGER NOT NULL DEFAULT 0,
      startTime TEXT,
      endTime TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_exams_courseId ON exams(courseId);
    CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
    CREATE INDEX IF NOT EXISTS idx_exams_startTime ON exams(startTime);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_questions (
      id TEXT PRIMARY KEY,
      examId TEXT NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      options TEXT,
      answer TEXT NOT NULL,
      score INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (examId) REFERENCES exams(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_exam_questions_examId ON exam_questions(examId);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_attempts (
      id TEXT PRIMARY KEY,
      examId TEXT NOT NULL,
      studentId TEXT NOT NULL,
      startedAt TEXT NOT NULL DEFAULT (datetime('now')),
      submittedAt TEXT,
      score REAL NOT NULL DEFAULT 0,
      passed INTEGER NOT NULL DEFAULT 0,
      switchCount INTEGER NOT NULL DEFAULT 0,
      answers TEXT,
      FOREIGN KEY (examId) REFERENCES exams(id) ON DELETE CASCADE,
      FOREIGN KEY (studentId) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_exam_attempts_examId ON exam_attempts(examId);
    CREATE INDEX IF NOT EXISTS idx_exam_attempts_studentId ON exam_attempts(studentId);
    CREATE INDEX IF NOT EXISTS idx_exam_attempts_examId_studentId ON exam_attempts(examId, studentId);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      courseId TEXT NOT NULL,
      score REAL NOT NULL DEFAULT 0,
      issuedAt TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      reviewedAt TEXT,
      reviewerId TEXT,
      remark TEXT,
      FOREIGN KEY (studentId) REFERENCES users(id),
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewerId) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_certificates_studentId ON certificates(studentId);
    CREATE INDEX IF NOT EXISTS idx_certificates_courseId ON certificates(courseId);
    CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS learning_behaviors (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      courseId TEXT,
      lessonId TEXT,
      watchDuration INTEGER NOT NULL DEFAULT 0,
      completed INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (studentId) REFERENCES users(id),
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (lessonId) REFERENCES lessons(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_learning_behaviors_studentId ON learning_behaviors(studentId);
    CREATE INDEX IF NOT EXISTS idx_learning_behaviors_courseId ON learning_behaviors(courseId);
    CREATE INDEX IF NOT EXISTS idx_learning_behaviors_studentId_courseId ON learning_behaviors(studentId, courseId);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS course_applications (
      id TEXT PRIMARY KEY,
      teacherId TEXT NOT NULL,
      title TEXT NOT NULL,
      subject TEXT,
      outline TEXT,
      cv TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      submittedAt TEXT NOT NULL DEFAULT (datetime('now')),
      reviewedAt TEXT,
      reviewerId TEXT,
      remark TEXT,
      autoRejectedAt TEXT,
      FOREIGN KEY (teacherId) REFERENCES users(id),
      FOREIGN KEY (reviewerId) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_course_applications_teacherId ON course_applications(teacherId);
    CREATE INDEX IF NOT EXISTS idx_course_applications_status ON course_applications(status);
    CREATE INDEX IF NOT EXISTS idx_course_applications_submittedAt ON course_applications(submittedAt);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS live_sessions (
      id TEXT PRIMARY KEY,
      courseId TEXT NOT NULL,
      title TEXT NOT NULL,
      startTime TEXT,
      endTime TEXT,
      status TEXT NOT NULL DEFAULT 'not_started',
      recordingUrl TEXT,
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_live_sessions_courseId ON live_sessions(courseId);
    CREATE INDEX IF NOT EXISTS idx_live_sessions_status ON live_sessions(status);
    CREATE INDEX IF NOT EXISTS idx_live_sessions_startTime ON live_sessions(startTime);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS danmakus (
      id TEXT PRIMARY KEY,
      liveSessionId TEXT NOT NULL,
      userId TEXT NOT NULL,
      content TEXT NOT NULL,
      isBlocked INTEGER NOT NULL DEFAULT 0,
      blockReason TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (liveSessionId) REFERENCES live_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_danmakus_liveSessionId ON danmakus(liveSessionId);
    CREATE INDEX IF NOT EXISTS idx_danmakus_userId ON danmakus(userId);
    CREATE INDEX IF NOT EXISTS idx_danmakus_isBlocked ON danmakus(isBlocked);
    CREATE INDEX IF NOT EXISTS idx_danmakus_liveSessionId_createdAt ON danmakus(liveSessionId, createdAt);
  `);
}

export default initDatabase;
