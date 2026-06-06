export type ObjectiveQuestionType = 'single' | 'multiple' | 'judge';

export interface ObjectiveGradingResult {
  correct: boolean;
  score: number;
}

function normalizeValue(value: string | string[] | boolean | null | undefined): string[] | string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (Array.isArray(value)) return value.map(v => String(v).trim().toLowerCase());
  return String(value).trim().toLowerCase();
}

function gradeSingleChoice(
  userAnswer: string | string[] | boolean | null | undefined,
  correctAnswer: string | string[] | boolean,
): boolean {
  const normUser = normalizeValue(userAnswer);
  const normCorrect = normalizeValue(correctAnswer);
  if (normUser === null) return false;
  if (Array.isArray(normUser)) return false;
  return normUser === normCorrect;
}

function gradeMultipleChoice(
  userAnswer: string | string[] | boolean | null | undefined,
  correctAnswer: string | string[] | boolean,
): boolean {
  const normUser = normalizeValue(userAnswer);
  const normCorrect = normalizeValue(correctAnswer);
  if (normUser === null || normCorrect === null) return false;

  const userArr: string[] = Array.isArray(normUser) ? normUser : [normUser];
  const correctArr: string[] = Array.isArray(normCorrect) ? normCorrect : [normCorrect];

  if (correctArr.length !== userArr.length) return false;

  const correctSet = new Set(correctArr);
  const userSet = new Set(userArr);

  if (correctSet.size !== userSet.size) return false;

  for (const item of correctSet) {
    if (!userSet.has(item)) return false;
  }

  return true;
}

function gradeJudge(
  userAnswer: string | string[] | boolean | null | undefined,
  correctAnswer: string | string[] | boolean,
): boolean {
  const truthyValues = ['正确', 'true', '对', 'yes', 't', 'y', '1'];
  const falsyValues = ['错误', 'false', '错', 'no', 'f', 'n', '0'];

  const normCorrect = String(correctAnswer).trim().toLowerCase();
  const normUser = normalizeValue(userAnswer);

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

export function gradeObjective(
  questionType: ObjectiveQuestionType,
  userAnswer: string | string[] | boolean | null | undefined,
  correctAnswer: string | string[] | boolean,
  fullScore: number = 1,
): ObjectiveGradingResult {
  let isCorrect = false;

  switch (questionType) {
    case 'single':
      isCorrect = gradeSingleChoice(userAnswer, correctAnswer);
      break;
    case 'multiple':
      isCorrect = gradeMultipleChoice(userAnswer, correctAnswer);
      break;
    case 'judge':
      isCorrect = gradeJudge(userAnswer, correctAnswer);
      break;
    default:
      isCorrect = false;
  }

  return {
    correct: isCorrect,
    score: isCorrect ? fullScore : 0,
  };
}
