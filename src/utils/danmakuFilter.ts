import type { DanmakuMessage, FilterResult } from '@/types';

const SENSITIVE_WORDS: Array<{ word: string; severity: 'low' | 'medium' | 'high' }> = [
  { word: '脏话', severity: 'medium' },
  { word: '骂人', severity: 'medium' },
  { word: '暴力', severity: 'high' },
  { word: '色情', severity: 'high' },
  { word: '赌博', severity: 'high' },
  { word: '毒品', severity: 'high' },
  { word: '广告', severity: 'low' },
  { word: '推销', severity: 'low' },
  { word: '联系方式', severity: 'low' },
  { word: '微信号', severity: 'medium' },
  { word: 'qq号', severity: 'medium' },
  { word: '违规', severity: 'medium' },
  { word: '反动', severity: 'high' },
  { word: '诈骗', severity: 'high' },
  { word: '盗版', severity: 'medium' },
];

const REPLACEMENT_CHAR = '*';

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function calculateSeverity(matched: Array<{ word: string; severity: 'low' | 'medium' | 'high' }>): 'low' | 'medium' | 'high' {
  if (matched.some(m => m.severity === 'high')) return 'high';
  if (matched.some(m => m.severity === 'medium')) return 'medium';
  return 'low';
}

export function filterContent(content: string): FilterResult {
  const matchedWords: Array<{ word: string; severity: 'low' | 'medium' | 'high' }> = [];
  let filteredContent = content;

  for (const entry of SENSITIVE_WORDS) {
    const pattern = new RegExp(escapeRegExp(entry.word), 'gi');
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      matchedWords.push(entry);
      const replacement = REPLACEMENT_CHAR.repeat(entry.word.length);
      filteredContent = filteredContent.replace(pattern, replacement);
    }
  }

  return {
    isSafe: matchedWords.length === 0,
    originalContent: content,
    filteredContent,
    matchedWords: matchedWords.map(m => m.word),
    severity: matchedWords.length > 0 ? calculateSeverity(matchedWords) : 'low',
  };
}

export function filterDanmaku(message: DanmakuMessage): {
  message: DanmakuMessage;
  filterResult: FilterResult;
} {
  const result = filterContent(message.content);
  return {
    message: {
      ...message,
      content: result.filteredContent,
    },
    filterResult: result,
  };
}

export function batchFilterDanmakus(messages: DanmakuMessage[]): {
  safeMessages: DanmakuMessage[];
  flaggedMessages: Array<{ message: DanmakuMessage; result: FilterResult }>;
} {
  const safeMessages: DanmakuMessage[] = [];
  const flaggedMessages: Array<{ message: DanmakuMessage; result: FilterResult }> = [];

  for (const msg of messages) {
    const { message, filterResult } = filterDanmaku(msg);
    if (filterResult.isSafe || filterResult.severity === 'low') {
      safeMessages.push(message);
    }
    if (!filterResult.isSafe) {
      flaggedMessages.push({ message, result: filterResult });
    }
  }

  return { safeMessages, flaggedMessages };
}

export function addSensitiveWord(word: string, severity: 'low' | 'medium' | 'high' = 'medium'): void {
  if (!word.trim()) return;
  const exists = SENSITIVE_WORDS.some(
    w => w.word.toLowerCase() === word.toLowerCase(),
  );
  if (!exists) {
    SENSITIVE_WORDS.push({ word, severity });
  }
}

export function getSensitiveWords(): Array<{ word: string; severity: 'low' | 'medium' | 'high' }> {
  return [...SENSITIVE_WORDS];
}
