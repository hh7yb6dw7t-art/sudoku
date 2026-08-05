// ─── 每日打卡存储 + 连续天数计算 ───

export type CheckinStatus = 'done' | 'makeup';

export interface CheckinEntry {
  date: string;         // 'YYYY-MM-DD'
  status: CheckinStatus;
  gameRecordId: string;
  difficulty: string;
  timeSpent: number;
}

const CHECKIN_KEY = 'sudoku_checkins';

function today(): string {
  return new Date().toLocaleDateString('zh-CN'); // 'YYYY/MM/DD'
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN');
}

function parseDate(str: string): Date {
  const [y, m, d] = str.split('/').map(Number);
  return new Date(y, m - 1, d);
}

/** 获取 YYYY-MM-DD 格式的日期字符串 */
function toISO(dateStr: string): string {
  const [y, m, d] = dateStr.split('/').map(Number);
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** 读取所有打卡记录 */
export function loadCheckins(): CheckinEntry[] {
  try {
    const raw = localStorage.getItem(CHECKIN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCheckins(entries: CheckinEntry[]): void {
  localStorage.setItem(CHECKIN_KEY, JSON.stringify(entries));
}

/** 查询某天是否已打卡/补卡 */
export function getCheckinStatus(dateStr: string): CheckinStatus | null {
  const entries = loadCheckins();
  const key = toISO(dateStr);
  const entry = entries.find(e => e.date === key);
  return entry ? entry.status : null;
}

/** 完成每日挑战或补卡后写入 */
export function saveCheckin(dateStr: string, status: CheckinStatus, gameRecordId: string, difficulty: string, timeSpent: number): void {
  const entries = loadCheckins();
  const key = toISO(dateStr);
  const existing = entries.findIndex(e => e.date === key);
  const entry: CheckinEntry = { date: key, status, gameRecordId, difficulty, timeSpent };

  if (existing >= 0) {
    // 补卡可以覆盖未打卡的日期
    entries[existing] = entry;
  } else {
    entries.push(entry);
  }
  saveCheckins(entries);
}

/** 获取某月的打卡状态映射 */
export function getMonthStatuses(year: number, month: number): Map<string, CheckinStatus> {
  const entries = loadCheckins();
  const map = new Map<string, CheckinStatus>();
  for (const e of entries) {
    const [ey, em] = e.date.split('-').map(Number);
    if (ey === year && em === month) {
      map.set(e.date, e.status);
    }
  }
  return map;
}

/** 计算连续打卡天数（从今天往回数，仅统计按时打卡的） */
export function calculateStreak(): number {
  const entries = loadCheckins();
  const doneDates = entries
    .filter(e => e.status === 'done')
    .map(e => e.date)
    .sort()
    .reverse();

  if (doneDates.length === 0) return 0;

  const todayStr = today();
  const todayDate = parseDate(todayStr);
  const latestDone = doneDates[0]; // 最近一次按时打卡
  const latestDate = parseDate(latestDone.replace(/-/g, '/'));

  // 如果最近一次打卡既不是今天也不是昨天，连续断了
  const diffFromToday = Math.floor((todayDate.getTime() - latestDate.getTime()) / 86400000);
  if (diffFromToday > 1) return 0;

  // 从最近一次往前数连续天数
  let streak = 1;
  for (let i = 1; i < doneDates.length; i++) {
    const curr = parseDate(doneDates[i].replace(/-/g, '/'));
    const prev = parseDate(doneDates[i - 1].replace(/-/g, '/'));
    const diff = Math.floor((prev.getTime() - curr.getTime()) / 86400000);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/** 随机选一个难度 */
export function randomDifficulty(): 'easy' | 'medium' | 'hard' {
  const list: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
  return list[Math.floor(Math.random() * list.length)];
}

export { today, formatDate, parseDate, toISO };
