import type { ReportRow, ExportOptions } from '@/types';

function escapeCSVValue(value: string | number | boolean | null): string {
  if (value === null || value === undefined) return '';
  let str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export function generateCSV(
  rows: ReportRow[],
  columns?: string[],
): string {
  if (rows.length === 0) return '';

  const cols = columns && columns.length > 0 ? columns : Object.keys(rows[0]);

  const lines: string[] = [];
  lines.push(cols.map(c => escapeCSVValue(c)).join(','));

  for (const row of rows) {
    const line = cols.map(col => escapeCSVValue(row[col] ?? '')).join(',');
    lines.push(line);
  }

  return lines.join('\r\n');
}

export function exportToCSV(
  rows: ReportRow[],
  options: ExportOptions = {},
): { filename: string; content: string; blob: Blob } {
  const {
    filename = `report_${Date.now()}.csv`,
    delimiter = ',',
    includeHeader = true,
    encoding = 'utf-8',
  } = options;

  const columns = options && 'columns' in (options as object)
    ? ((options as { columns?: string[] }).columns ?? undefined)
    : undefined;

  let content = generateCSV(rows, columns);

  if (!includeHeader) {
    const firstNewline = content.indexOf('\r\n');
    if (firstNewline !== -1) {
      content = content.slice(firstNewline + 2);
    }
  }

  if (delimiter !== ',') {
    content = content.split(',').join(delimiter);
  }

  const blob = new Blob(['\uFEFF' + content], {
    type: `text/csv;charset=${encoding};`,
  });

  return { filename, content, blob };
}

export function downloadCSV(
  rows: ReportRow[],
  options: ExportOptions = {},
): void {
  if (typeof document === 'undefined') return;

  const { blob, filename } = exportToCSV(rows, options);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

export function parseCSV(content: string): ReportRow[] {
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (inQuotes) {
        if (char === '"') {
          if (line[i + 1] === '"') {
            current += '"';
            i += 1;
          } else {
            inQuotes = false;
          }
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          result.push(current);
          current = '';
        } else {
          current += char;
        }
      }
    }
    result.push(current);
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows: ReportRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = parseLine(lines[i]);
    const row: ReportRow = {};
    for (let j = 0; j < headers.length; j += 1) {
      row[headers[j]] = values[j] ?? '';
    }
    rows.push(row);
  }

  return rows;
}

export function mockExportReport(
  type: 'quiz' | 'student' | 'course' | 'danmaku' = 'quiz',
  count: number = 20,
): ReportRow[] {
  const rows: ReportRow[] = [];
  const subjects = ['数学', '语文', '英语', '物理', '化学', '编程'];
  const teachers = ['张老师', '李老师', '王老师', '赵老师'];

  for (let i = 0; i < count; i += 1) {
    const id = i + 1;
    if (type === 'quiz') {
      rows.push({
        id,
        学生姓名: `学生${id}`,
        科目: subjects[i % subjects.length],
        分数: Math.floor(Math.random() * 40) + 60,
        正确率: `${Math.floor(Math.random() * 40) + 60}%`,
        用时: `${Math.floor(Math.random() * 30) + 10}分钟`,
        提交时间: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
      });
    } else if (type === 'student') {
      rows.push({
        id,
        学号: `S${String(id).padStart(6, '0')}`,
        姓名: `学生${id}`,
        班级: `${Math.floor(i / 5) + 1}班`,
        学习时长: `${Math.floor(Math.random() * 100) + 20}小时`,
        完成课程数: Math.floor(Math.random() * 10) + 1,
        平均分: Math.floor(Math.random() * 40) + 60,
      });
    } else if (type === 'course') {
      rows.push({
        id,
        课程名称: `${subjects[i % subjects.length]}${Math.floor(i / 6) + 1}`,
        授课老师: teachers[i % teachers.length],
        选课人数: Math.floor(Math.random() * 200) + 50,
        完成率: `${Math.floor(Math.random() * 50) + 40}%`,
        平均评分: (Math.random() * 2 + 3).toFixed(1),
      });
    } else {
      rows.push({
        id,
        用户ID: `U${String(id).padStart(6, '0')}`,
        弹幕内容: `这是第${id}条弹幕内容`,
        视频ID: `V${String((i % 10) + 1).padStart(4, '0')}`,
        发送时间: new Date(Date.now() - i * 60000).toISOString().replace('T', ' ').slice(0, 19),
        是否违规: Math.random() > 0.9 ? '是' : '否',
      });
    }
  }

  return rows;
}
