describe('Schedule Rules', () => {
  const minutesBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 60000);
  const isWorkingHour = (hour: number) => hour >= 9 && hour < 18;
  const nextSlot = (hour: number, step = 30) => hour * 60 + step;

  it('calculates minutes between timestamps', () => {
    const start = new Date('2026-03-01T10:00:00Z');
    const end = new Date('2026-03-01T10:30:00Z');
    expect(minutesBetween(start, end)).toBe(30);
  });

  it('accepts opening hour', () => {
    expect(isWorkingHour(9)).toBe(true);
  });

  it('rejects closing boundary', () => {
    expect(isWorkingHour(18)).toBe(false);
  });

  it('rejects early morning slots', () => {
    expect(isWorkingHour(7)).toBe(false);
  });

  it('computes next slot in minutes', () => {
    expect(nextSlot(10, 30)).toBe(630);
  });

  it('supports custom slot steps', () => {
    expect(nextSlot(10, 15)).toBe(615);
  });
});
