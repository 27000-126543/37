import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDb, initDatabase, closeDb } from './index.js';

const stats: Record<string, number> = {};

function incrementStat(table: string, count = 1): void {
  stats[table] = (stats[table] || 0) + count;
}

console.log('[Seed] 正在初始化数据库...');
initDatabase();
const db = getDb();

console.log('[Seed] 正在生成密码哈希...');
const passwordHash = bcrypt.hashSync('123456', 10);

const now = new Date().toISOString();

console.log('[Seed] 正在插入用户数据...');
interface SeedUser {
  id: string;
  role: string;
  username: string;
  password: string;
  realName: string;
  email: string;
  phone: string;
  avatar: string;
  status: string;
  createdAt: string;
}

const userDefs = [
  { role: 'admin', username: 'admin', realName: '张管理', email: 'admin@vocedu.com', phone: '13800000001', seed: 'admin001' },
  { role: 'dean', username: 'dean', realName: '李主任', email: 'dean@vocedu.com', phone: '13800000002', seed: 'dean002' },
  { role: 'teacher', username: 'teacher1', realName: '王建国', email: 'teacher1@vocedu.com', phone: '13800000003', seed: 'teacher003' },
  { role: 'teacher', username: 'teacher2', realName: '陈思琪', email: 'teacher2@vocedu.com', phone: '13800000004', seed: 'teacher004' },
  { role: 'assistant', username: 'assistant1', realName: '赵明宇', email: 'assistant1@vocedu.com', phone: '13800000005', seed: 'asst005' },
  { role: 'assistant', username: 'assistant2', realName: '孙雨萱', email: 'assistant2@vocedu.com', phone: '13800000006', seed: 'asst006' },
  { role: 'student', username: 'student1', realName: '刘小鹏', email: 'student1@vocedu.com', phone: '13900000001', seed: 'student007' },
  { role: 'student', username: 'student2', realName: '王小美', email: 'student2@vocedu.com', phone: '13900000002', seed: 'student008' },
  { role: 'student', username: 'student3', realName: '陈志强', email: 'student3@vocedu.com', phone: '13900000003', seed: 'student009' },
  { role: 'student', username: 'student4', realName: '李思琪', email: 'student4@vocedu.com', phone: '13900000004', seed: 'student010' },
  { role: 'student', username: 'student5', realName: '周子轩', email: 'student5@vocedu.com', phone: '13900000005', seed: 'student011' }
];

const users: SeedUser[] = userDefs.map(def => ({
  id: uuidv4(),
  role: def.role,
  username: def.username,
  password: passwordHash,
  realName: def.realName,
  email: def.email,
  phone: def.phone,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${def.seed}`,
  status: 'active',
  createdAt: now
}));

const insertUser = db.prepare(`
  INSERT INTO users (id, role, username, password, realName, email, phone, avatar, status, createdAt)
  VALUES (@id, @role, @username, @password, @realName, @email, @phone, @avatar, @status, @createdAt)
`);

const insertUsersTx = db.transaction((list: SeedUser[]) => {
  for (const u of list) insertUser.run(u);
});
insertUsersTx(users);
incrementStat('users', users.length);

const teacherIds = users.filter(u => u.role === 'teacher').map(u => u.id);
const assistantIds = users.filter(u => u.role === 'assistant').map(u => u.id);
const studentIds = users.filter(u => u.role === 'student').map(u => u.id);
const adminIds = users.filter(u => u.role === 'admin' || u.role === 'dean').map(u => u.id);

console.log('[Seed] 正在插入课程数据...');
interface SeedCourse {
  id: string;
  title: string;
  subject: string;
  description: string;
  cover: string;
  credits: number;
  teacherId: string;
  status: string;
  createdAt: string;
}

const courseDefs = [
  { title: 'Python全栈开发', subject: '编程语言', description: '从零开始学习Python，涵盖Web开发、数据处理、自动化运维等全栈技能', credits: 5 },
  { title: '数据分析与可视化', subject: '数据科学', description: '掌握Pandas、NumPy、Matplotlib等数据分析工具，学会用数据讲故事', credits: 4 },
  { title: 'UI/UX设计基础', subject: '设计创意', description: '学习用户界面与用户体验设计原理，掌握Figma设计工具', credits: 3 },
  { title: 'PMP项目管理', subject: '项目管理', description: '系统学习项目管理知识体系，备考PMP认证', credits: 4 },
  { title: '网络安全工程师', subject: '网络安全', description: '学习网络安全基础知识，掌握渗透测试、漏洞挖掘等技能', credits: 5 }
];

const courses: SeedCourse[] = courseDefs.map((def, idx) => ({
  id: uuidv4(),
  title: def.title,
  subject: def.subject,
  description: def.description,
  cover: `https://images.unsplash.com/photo-${1526379095098 + idx * 1000}?w=400`,
  credits: def.credits,
  teacherId: teacherIds[idx % teacherIds.length],
  status: 'published',
  createdAt: now
}));

const insertCourse = db.prepare(`
  INSERT INTO courses (id, title, subject, description, cover, credits, teacherId, status, createdAt)
  VALUES (@id, @title, @subject, @description, @cover, @credits, @teacherId, @status, @createdAt)
`);

const insertCoursesTx = db.transaction((list: SeedCourse[]) => {
  for (const c of list) insertCourse.run(c);
});
insertCoursesTx(courses);
incrementStat('courses', courses.length);

console.log('[Seed] 正在插入章节与课时数据...');
interface SeedChapter {
  id: string;
  courseId: string;
  title: string;
  orderNo: number;
}

interface SeedLesson {
  id: string;
  chapterId: string;
  title: string;
  type: string;
  duration: number;
  content: string;
}

const chapters: SeedChapter[] = [];
const lessons: SeedLesson[] = [];

const chapterTitlesPool = [
  ['课程介绍与环境搭建', '基础语法与数据类型', '函数与模块', '面向对象编程', '项目实战'],
  ['数据分析入门', '数据清洗与预处理', '数据可视化基础', '高级数据分析技术', '综合案例'],
  ['设计思维入门', 'UI设计原则', '交互设计基础', '原型设计工具', '设计规范'],
  ['项目管理框架', '项目范围管理', '项目进度管理', '项目风险管理', '项目沟通管理'],
  ['网络安全概述', '网络协议安全', 'Web安全基础', '渗透测试入门', '安全加固']
];

for (let ci = 0; ci < courses.length; ci++) {
  const course = courses[ci];
  const chapterCount = 3 + (ci % 3);
  const titles = chapterTitlesPool[ci] || chapterTitlesPool[0];

  for (let chi = 0; chi < chapterCount; chi++) {
    const chapterId = uuidv4();
    chapters.push({
      id: chapterId,
      courseId: course.id,
      title: titles[chi] || `第${chi + 1}章 核心内容`,
      orderNo: chi + 1
    });

    const lessonCount = 2 + (chi % 2);
    for (let li = 0; li < lessonCount; li++) {
      lessons.push({
        id: uuidv4(),
        chapterId,
        title: `课时${li + 1}：${titles[chi] || '章节内容'} - 部分${li + 1}`,
        type: li % 2 === 0 ? 'video' : 'doc',
        duration: 15 + Math.floor(Math.random() * 45),
        content: `<p>这是${course.title}课程中第${chi + 1}章的第${li + 1}课时内容。</p>`
      });
    }
  }
}

const insertChapter = db.prepare(`
  INSERT INTO chapters (id, courseId, title, orderNo)
  VALUES (@id, @courseId, @title, @orderNo)
`);
const insertLesson = db.prepare(`
  INSERT INTO lessons (id, chapterId, title, type, duration, content)
  VALUES (@id, @chapterId, @title, @type, @duration, @content)
`);

const insertChaptersTx = db.transaction((list: SeedChapter[]) => {
  for (const ch of list) insertChapter.run(ch);
});
insertChaptersTx(chapters);
incrementStat('chapters', chapters.length);

const insertLessonsTx = db.transaction((list: SeedLesson[]) => {
  for (const l of list) insertLesson.run(l);
});
insertLessonsTx(lessons);
incrementStat('lessons', lessons.length);

console.log('[Seed] 正在插入试题数据...');
interface SeedQuestion {
  id: string;
  courseId: string;
  type: string;
  content: string;
  options: string | null;
  answer: string;
  score: number;
  explanation: string | null;
}

const questions: SeedQuestion[] = [];
const questionTypes: Array<'single' | 'multiple' | 'judge' | 'subjective'> = ['single', 'multiple', 'judge', 'subjective'];

for (const course of courses) {
  const questionCount = 20 + Math.floor(Math.random() * 11);
  for (let qi = 0; qi < questionCount; qi++) {
    const qType = questionTypes[qi % questionTypes.length];
    let options: string | null = null;
    let answer = '';
    const content = `${course.title} - 题目${qi + 1}：这是一道关于${course.subject}的${qType === 'single' ? '单选题' : qType === 'multiple' ? '多选题' : qType === 'judge' ? '判断题' : '主观题'}。`;

    if (qType === 'single') {
      options = JSON.stringify(['A. 选项一', 'B. 选项二', 'C. 选项三', 'D. 选项四']);
      answer = 'A';
    } else if (qType === 'multiple') {
      options = JSON.stringify(['A. 选项一', 'B. 选项二', 'C. 选项三', 'D. 选项四']);
      answer = JSON.stringify(['A', 'B', 'D']);
    } else if (qType === 'judge') {
      options = JSON.stringify(['正确', '错误']);
      answer = '正确';
    } else {
      answer = '这是主观题的参考答案，需要人工评分。学员应从多个角度分析问题...';
    }

    questions.push({
      id: uuidv4(),
      courseId: course.id,
      type: qType,
      content,
      options,
      answer,
      score: qType === 'subjective' ? 10 : qType === 'multiple' ? 4 : 2,
      explanation: `这是题目${qi + 1}的解析。`
    });
  }
}

const insertQuestion = db.prepare(`
  INSERT INTO questions (id, courseId, type, content, options, answer, score, explanation)
  VALUES (@id, @courseId, @type, @content, @options, @answer, @score, @explanation)
`);

const insertQuestionsTx = db.transaction((list: SeedQuestion[]) => {
  for (const q of list) insertQuestion.run(q);
});
insertQuestionsTx(questions);
incrementStat('questions', questions.length);

console.log('[Seed] 正在插入作业与作业题目数据...');
interface SeedAssignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  deadline: string | null;
  createdAt: string;
}

interface SeedAssignmentQuestion {
  id: string;
  assignmentId: string;
  type: string;
  content: string;
  options: string | null;
  answer: string;
  score: number;
}

const assignments: SeedAssignment[] = [];
const assignmentQuestions: SeedAssignmentQuestion[] = [];

for (const course of courses) {
  const assignmentCount = 1 + (Math.floor(Math.random() * 2));
  for (let ai = 0; ai < assignmentCount; ai++) {
    const assignmentId = uuidv4();
    const deadlineDate = new Date();
    deadlineDate.setMonth(deadlineDate.getMonth() + 1);

    assignments.push({
      id: assignmentId,
      courseId: course.id,
      title: `${course.title} - 作业${ai + 1}`,
      description: `完成${course.title}课程的第${ai + 1}次作业，包含选择题、判断题和主观题。`,
      deadline: deadlineDate.toISOString(),
      createdAt: now
    });

    const aqCount = 3 + Math.floor(Math.random() * 3);
    for (let aqi = 0; aqi < aqCount; aqi++) {
      const aqType = questionTypes[aqi % questionTypes.length];
      let aqOptions: string | null = null;
      let aqAnswer = '';

      if (aqType === 'single') {
        aqOptions = JSON.stringify(['A. 正确答案', 'B. 干扰项1', 'C. 干扰项2', 'D. 干扰项3']);
        aqAnswer = 'A';
      } else if (aqType === 'multiple') {
        aqOptions = JSON.stringify(['A. 正确', 'B. 正确', 'C. 错误', 'D. 正确']);
        aqAnswer = JSON.stringify(['A', 'B', 'D']);
      } else if (aqType === 'judge') {
        aqOptions = JSON.stringify(['正确', '错误']);
        aqAnswer = '正确';
      } else {
        aqAnswer = '请根据课程所学知识，结合实际案例进行分析阐述。';
      }

      assignmentQuestions.push({
        id: uuidv4(),
        assignmentId,
        type: aqType,
        content: `作业题目${aqi + 1}：关于${course.title}的核心知识点考察。`,
        options: aqOptions,
        answer: aqAnswer,
        score: aqType === 'subjective' ? 20 : 10
      });
    }
  }
}

const insertAssignment = db.prepare(`
  INSERT INTO assignments (id, courseId, title, description, deadline, createdAt)
  VALUES (@id, @courseId, @title, @description, @deadline, @createdAt)
`);
const insertAssignmentQuestion = db.prepare(`
  INSERT INTO assignment_questions (id, assignmentId, type, content, options, answer, score)
  VALUES (@id, @assignmentId, @type, @content, @options, @answer, @score)
`);

const insertAssignmentsTx = db.transaction((list: SeedAssignment[]) => {
  for (const a of list) insertAssignment.run(a);
});
insertAssignmentsTx(assignments);
incrementStat('assignments', assignments.length);

const insertAssignmentQuestionsTx = db.transaction((list: SeedAssignmentQuestion[]) => {
  for (const aq of list) insertAssignmentQuestion.run(aq);
});
insertAssignmentQuestionsTx(assignmentQuestions);
incrementStat('assignment_questions', assignmentQuestions.length);

console.log('[Seed] 正在插入考试与考试题目数据...');
interface SeedExam {
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

interface SeedExamQuestion {
  id: string;
  examId: string;
  type: string;
  content: string;
  options: string | null;
  answer: string;
  score: number;
}

const examCourses = courses.slice(0, 3);
const exams: SeedExam[] = [];
const examQuestions: SeedExamQuestion[] = [];

for (let ei = 0; ei < examCourses.length; ei++) {
  const course = examCourses[ei];
  const examId = uuidv4();
  const startTime = new Date();
  startTime.setDate(startTime.getDate() - 30);
  const endTime = new Date();
  endTime.setMonth(endTime.getMonth() + 3);

  exams.push({
    id: examId,
    courseId: course.id,
    title: `${course.title} - 结业考试`,
    duration: 60 + ei * 30,
    totalScore: 100,
    passScore: 60,
    questionCount: 20,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    status: 'published'
  });

  for (let eqi = 0; eqi < 20; eqi++) {
    const eqType = questionTypes[eqi % questionTypes.length];
    let eqOptions: string | null = null;
    let eqAnswer = '';

    if (eqType === 'single') {
      eqOptions = JSON.stringify(['A. 选项A', 'B. 选项B', 'C. 选项C', 'D. 选项D']);
      eqAnswer = 'A';
    } else if (eqType === 'multiple') {
      eqOptions = JSON.stringify(['A. 对', 'B. 对', 'C. 错', 'D. 对']);
      eqAnswer = JSON.stringify(['A', 'B', 'D']);
    } else if (eqType === 'judge') {
      eqOptions = JSON.stringify(['正确', '错误']);
      eqAnswer = '正确';
    } else {
      eqAnswer = '综合应用题参考答案：需要结合所学知识进行完整的分析和论述。';
    }

    examQuestions.push({
      id: uuidv4(),
      examId,
      type: eqType,
      content: `${course.title}考试 - 题目${eqi + 1}：考察${course.subject}的核心知识点。`,
      options: eqOptions,
      answer: eqAnswer,
      score: eqType === 'subjective' ? 15 : 5
    });
  }
}

const insertExam = db.prepare(`
  INSERT INTO exams (id, courseId, title, duration, totalScore, passScore, questionCount, startTime, endTime, status)
  VALUES (@id, @courseId, @title, @duration, @totalScore, @passScore, @questionCount, @startTime, @endTime, @status)
`);
const insertExamQuestion = db.prepare(`
  INSERT INTO exam_questions (id, examId, type, content, options, answer, score)
  VALUES (@id, @examId, @type, @content, @options, @answer, @score)
`);

const insertExamsTx = db.transaction((list: SeedExam[]) => {
  for (const e of list) insertExam.run(e);
});
insertExamsTx(exams);
incrementStat('exams', exams.length);

const insertExamQuestionsTx = db.transaction((list: SeedExamQuestion[]) => {
  for (const eq of list) insertExamQuestion.run(eq);
});
insertExamQuestionsTx(examQuestions);
incrementStat('exam_questions', examQuestions.length);

console.log('[Seed] 正在插入学员学习行为数据...');
interface SeedLearningBehavior {
  id: string;
  studentId: string;
  courseId: string | null;
  lessonId: string | null;
  watchDuration: number;
  completed: number;
  createdAt: string;
}

const lessonIds = lessons.map(l => l.id);
const behaviors: SeedLearningBehavior[] = [];

for (let bi = 0; bi < 100; bi++) {
  const daysAgo = Math.floor(Math.random() * 60);
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  behaviors.push({
    id: uuidv4(),
    studentId: studentIds[bi % studentIds.length],
    courseId: courses[bi % courses.length].id,
    lessonId: lessonIds[bi % lessonIds.length],
    watchDuration: 5 + Math.floor(Math.random() * 90),
    completed: Math.random() > 0.35 ? 1 : 0,
    createdAt: d.toISOString()
  });
}

const insertBehavior = db.prepare(`
  INSERT INTO learning_behaviors (id, studentId, courseId, lessonId, watchDuration, completed, createdAt)
  VALUES (@id, @studentId, @courseId, @lessonId, @watchDuration, @completed, @createdAt)
`);

const insertBehaviorsTx = db.transaction((list: SeedLearningBehavior[]) => {
  for (const b of list) insertBehavior.run(b);
});
insertBehaviorsTx(behaviors);
incrementStat('learning_behaviors', behaviors.length);

console.log('[Seed] 正在插入作业提交数据...');
interface SeedAssignmentSubmission {
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

const submissions: SeedAssignmentSubmission[] = [];
const submissionStatuses = ['submitted', 'grading', 'graded', 'graded', 'graded'];

for (const assignment of assignments.slice(0, 3)) {
  for (let si = 0; si < 3; si++) {
    const student = studentIds[si % studentIds.length];
    const submittedDate = new Date();
    submittedDate.setDate(submittedDate.getDate() - Math.floor(Math.random() * 30));
    const status = submissionStatuses[si % submissionStatuses.length];
    const objectiveScore = Math.floor(Math.random() * 40) + 40;
    const subjectiveScore = status === 'graded' ? Math.floor(Math.random() * 40) + 30 : 0;
    const totalScore = objectiveScore + subjectiveScore;

    submissions.push({
      id: uuidv4(),
      assignmentId: assignment.id,
      studentId: student,
      submittedAt: submittedDate.toISOString(),
      objectiveScore,
      subjectiveScore,
      totalScore,
      status,
      gradedAt: status === 'graded' || status === 'grading' ? submittedDate.toISOString() : null,
      graderId: status === 'graded' || status === 'grading' ? (si % 2 === 0 ? assistantIds[0] : teacherIds[0]) : null,
      escalatedAt: null
    });
  }
}

const insertSubmission = db.prepare(`
  INSERT INTO assignment_submissions (id, assignmentId, studentId, submittedAt, objectiveScore, subjectiveScore, totalScore, status, gradedAt, graderId, escalatedAt)
  VALUES (@id, @assignmentId, @studentId, @submittedAt, @objectiveScore, @subjectiveScore, @totalScore, @status, @gradedAt, @graderId, @escalatedAt)
`);

const insertSubmissionsTx = db.transaction((list: SeedAssignmentSubmission[]) => {
  for (const s of list) insertSubmission.run(s);
});
insertSubmissionsTx(submissions);
incrementStat('assignment_submissions', submissions.length);

console.log('[Seed] 正在插入考试记录数据...');
interface SeedExamAttempt {
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

const attempts: SeedExamAttempt[] = [];

for (const exam of exams) {
  for (let ai = 0; ai < 3; ai++) {
    const student = studentIds[ai % studentIds.length];
    const startedDate = new Date();
    startedDate.setDate(startedDate.getDate() - Math.floor(Math.random() * 20));
    const submittedDate = new Date(startedDate.getTime() + (60 + Math.floor(Math.random() * 30)) * 60 * 1000);
    const score = Math.floor(Math.random() * 50) + 40;
    const passed = score >= 60 ? 1 : 0;

    attempts.push({
      id: uuidv4(),
      examId: exam.id,
      studentId: student,
      startedAt: startedDate.toISOString(),
      submittedAt: submittedDate.toISOString(),
      score,
      passed,
      switchCount: Math.floor(Math.random() * 3),
      answers: JSON.stringify({ q1: 'A', q2: ['A', 'B'], q3: '正确' })
    });
  }
}

const insertAttempt = db.prepare(`
  INSERT INTO exam_attempts (id, examId, studentId, startedAt, submittedAt, score, passed, switchCount, answers)
  VALUES (@id, @examId, @studentId, @startedAt, @submittedAt, @score, @passed, @switchCount, @answers)
`);

const insertAttemptsTx = db.transaction((list: SeedExamAttempt[]) => {
  for (const a of list) insertAttempt.run(a);
});
insertAttemptsTx(attempts);
incrementStat('exam_attempts', attempts.length);

console.log('[Seed] 正在插入证书数据...');
interface SeedCertificate {
  id: string;
  studentId: string;
  courseId: string;
  score: number;
  issuedAt: string | null;
  status: string;
  reviewedAt: string | null;
  reviewerId: string | null;
  remark: string | null;
}

const certStatuses: Array<'pending' | 'approved' | 'rejected'> = ['pending', 'approved', 'rejected'];
const certificates: SeedCertificate[] = [];

for (let ci = 0; ci < 3; ci++) {
  const status = certStatuses[ci];
  const reviewedDate = status !== 'pending' ? new Date() : null;
  const issuedDate = status === 'approved' ? new Date() : null;

  certificates.push({
    id: uuidv4(),
    studentId: studentIds[ci % studentIds.length],
    courseId: courses[ci % courses.length].id,
    score: 65 + Math.floor(Math.random() * 30),
    issuedAt: issuedDate ? issuedDate.toISOString() : null,
    status,
    reviewedAt: reviewedDate ? reviewedDate.toISOString() : null,
    reviewerId: status !== 'pending' ? adminIds[ci % adminIds.length] : null,
    remark: status === 'approved' ? '恭喜你顺利完成课程学习！' : status === 'rejected' ? '成绩未达到证书授予标准，请继续努力。' : null
  });
}

const insertCertificate = db.prepare(`
  INSERT INTO certificates (id, studentId, courseId, score, issuedAt, status, reviewedAt, reviewerId, remark)
  VALUES (@id, @studentId, @courseId, @score, @issuedAt, @status, @reviewedAt, @reviewerId, @remark)
`);

const insertCertificatesTx = db.transaction((list: SeedCertificate[]) => {
  for (const c of list) insertCertificate.run(c);
});
insertCertificatesTx(certificates);
incrementStat('certificates', certificates.length);

console.log('[Seed] 正在插入课程申请数据...');
interface SeedCourseApplication {
  id: string;
  teacherId: string;
  title: string;
  subject: string | null;
  outline: string | null;
  cv: string | null;
  status: string;
  submittedAt: string;
  reviewedAt: string | null;
  reviewerId: string | null;
  remark: string | null;
  autoRejectedAt: string | null;
}

const applicationStatuses = ['pending', 'pending_first_review', 'first_review_passed', 'approved', 'rejected'];
const applicationTitles = [
  '人工智能高级应用开发',
  'Vue3企业级项目实战',
  '区块链技术与应用',
  '产品经理训练营',
  '新媒体运营与营销'
];
const applications: SeedCourseApplication[] = [];

for (let ai = 0; ai < 5; ai++) {
  const status = applicationStatuses[ai];
  const submittedDate = new Date();
  submittedDate.setDate(submittedDate.getDate() - (5 - ai) * 3);
  const reviewedDate = status !== 'pending' && status !== 'pending_first_review' ? new Date() : null;

  applications.push({
    id: uuidv4(),
    teacherId: teacherIds[ai % teacherIds.length],
    title: applicationTitles[ai],
    subject: ['人工智能', '前端开发', '区块链', '产品运营', '市场营销'][ai],
    outline: `# ${applicationTitles[ai]}\n## 课程大纲\n1. 基础知识\n2. 核心技能\n3. 项目实战`,
    cv: '多年行业从业经验，曾任职于知名互联网企业，具有丰富的教学经验。',
    status,
    submittedAt: submittedDate.toISOString(),
    reviewedAt: reviewedDate ? reviewedDate.toISOString() : null,
    reviewerId: reviewedDate ? adminIds[ai % adminIds.length] : null,
    remark: status === 'approved' ? '课程内容设计合理，已通过审核。' : status === 'rejected' ? '课程内容需要进一步优化，请修改后重新提交。' : null,
    autoRejectedAt: null
  });
}

const insertApplication = db.prepare(`
  INSERT INTO course_applications (id, teacherId, title, subject, outline, cv, status, submittedAt, reviewedAt, reviewerId, remark, autoRejectedAt)
  VALUES (@id, @teacherId, @title, @subject, @outline, @cv, @status, @submittedAt, @reviewedAt, @reviewerId, @remark, @autoRejectedAt)
`);

const insertApplicationsTx = db.transaction((list: SeedCourseApplication[]) => {
  for (const a of list) insertApplication.run(a);
});
insertApplicationsTx(applications);
incrementStat('course_applications', applications.length);

closeDb();

console.log('\n========================================');
console.log('  🎉 种子数据插入统计');
console.log('========================================');
const maxLen = Math.max(...Object.keys(stats).map(k => k.length));
for (const [table, count] of Object.entries(stats)) {
  console.log(`  ${table.padEnd(maxLen, ' ')}  :  ${count} 条`);
}
console.log('========================================');
console.log('  可用账号列表:');
console.log('  - admin / 123456       (管理员)');
console.log('  - dean / 123456        (教务主任)');
console.log('  - teacher1 / 123456    (讲师)');
console.log('  - teacher2 / 123456    (讲师)');
console.log('  - assistant1 / 123456  (助教)');
console.log('  - assistant2 / 123456  (助教)');
console.log('  - student1~5 / 123456  (学员)');
console.log('========================================\n');
