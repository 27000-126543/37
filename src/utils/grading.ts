import type {
  Question,
  UserAnswer,
  GradingResult,
  GradingSummary,
  QuestionType,
} from '@/types';

function normalizeAnswer(value: string | string[] | boolean | null): string | string[] | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (Array.isArray(value)) return value.map(v => String(v).trim().toLowerCase());
  return String(value).trim().toLowerCase();
}

function compareSingleChoice(correct: string, userAnswer: string | string[] | boolean | null): boolean {
  const normCorrect = normalizeAnswer(correct);
  const normUser = normalizeAnswer(userAnswer);
  if (normUser === null) return false;
  if (Array.isArray(normUser)) return false;
  return normCorrect === normUser;
}

function compareMultipleChoice(correct: string[], userAnswer: string | string[] | boolean | null): boolean {
  const normCorrect = normalizeAnswer(correct);
  const normUser = normalizeAnswer(userAnswer);
  if (normUser === null) return false;
  const userArr = Array.isArray(normUser) ? normUser : [normUser];
  const correctArr = Array.isArray(normCorrect) ? normCorrect : [normCorrect];
  if (correctArr.length !== userArr.length) return false;
  const correctSet = new Set(correctArr);
  const userSet = new Set(userArr);
  if (correctSet.size !== userSet.size) return false;
  for (const item of correctSet) {
    if (!userSet.has(item)) return false;
  }
  return true;
}

function compareJudge(correct: string, userAnswer: string | string[] | boolean | null): boolean {
  const truthyValues = ['正确', 'true', '对', 'yes', 't', 'y', '1'];
  const falsyValues = ['错误', 'false', '错', 'no', 'f', 'n', '0'];
  const normCorrect = String(correct).trim().toLowerCase();
  const normUser = normalizeAnswer(userAnswer);
  if (normUser === null) return false;
  const userStr = Array.isArray(normUser) ? normUser[0] : normUser;
  let correctBool: boolean;
  if (truthyValues.includes(normCorrect)) correctBool = true;
  else if (falsyValues.includes(normCorrect)) correctBool = false;
  else correctBool = normCorrect === 'true';
  let userBool: boolean;
  if (truthyValues.includes(userStr)) userBool = true;
  else if (falsyValues.includes(userStr)) userBool = false;
  else userBool = userStr === 'true';
  return correctBool === userBool;
}

function gradeQuestion(question: Question, userAnswer: UserAnswer): GradingResult {
  const answer = userAnswer.answer;
  let isCorrect = false;
  const qType = question.type as QuestionType;

  if (qType === 'single') {
    isCorrect = compareSingleChoice(question.answer as string, answer);
  } else if (qType === 'multiple') {
    isCorrect = compareMultipleChoice(question.answer as string[], answer);
  } else if (qType === 'judge') {
    isCorrect = compareJudge(question.answer as string, answer);
  }

  return {
    questionId: question.id,
    isCorrect,
    score: isCorrect ? question.score : 0,
    maxScore: question.score,
    correctAnswer: question.answer,
    userAnswer: answer,
  };
}

export function gradeQuiz(questions: Question[], userAnswers: UserAnswer[]): GradingSummary {
  const answerMap = new Map<string, UserAnswer>();
  for (const ans of userAnswers) {
    answerMap.set(ans.questionId, ans);
  }

  const results: GradingResult[] = [];
  let totalScore = 0;
  let maxScore = 0;
  let correctCount = 0;

  for (const question of questions) {
    const userAnswer = answerMap.get(question.id) ?? {
      questionId: question.id,
      answer: null,
    };
    const result = gradeQuestion(question, userAnswer);
    results.push(result);
    totalScore += result.score;
    maxScore += result.maxScore;
    if (result.isCorrect) correctCount += 1;
  }

  const accuracy = maxScore > 0 ? totalScore / maxScore : 0;

  return {
    totalScore,
    maxScore,
    correctCount,
    totalCount: questions.length,
    accuracy,
    results,
  };
}

export function getQuestionAccuracy(results: GradingResult[]): Record<string, number> {
  const stats: Record<string, { correct: number; total: number }> = {};
  for (const r of results) {
    if (!stats[r.questionId]) {
      stats[r.questionId] = { correct: 0, total: 0 };
    }
    stats[r.questionId].total += 1;
    if (r.isCorrect) stats[r.questionId].correct += 1;
  }
  const accuracy: Record<string, number> = {};
  for (const [id, s] of Object.entries(stats)) {
    accuracy[id] = s.total > 0 ? s.correct / s.total : 0;
  }
  return accuracy;
}
