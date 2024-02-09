
export function getCurrentWeekNumber(): number {
    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    const millisecsInDay = 86400000; // 1000 * 60 * 60 * 24
    const currentDay = (now.getTime() - onejan.getTime()) / millisecsInDay;
    return Math.ceil((currentDay + onejan.getDay() + 1) / 7);
  }