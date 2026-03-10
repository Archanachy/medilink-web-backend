describe('Analytics Metrics Rules', () => {
  const completionRate = (done: number, total: number) => (total === 0 ? 0 : (done / total) * 100);
  const conversionRate = (paid: number, created: number) => (created === 0 ? 0 : (paid / created) * 100);
  const avg = (nums: number[]) => nums.reduce((a, b) => a + b, 0) / nums.length;

  it('computes completion rate correctly', () => {
    expect(completionRate(45, 60)).toBe(75);
  });

  it('returns zero completion rate for empty denominator', () => {
    expect(completionRate(0, 0)).toBe(0);
  });

  it('computes conversion rate correctly', () => {
    expect(conversionRate(30, 50)).toBe(60);
  });

  it('returns zero conversion rate for no created intents', () => {
    expect(conversionRate(0, 0)).toBe(0);
  });

  it('computes average consultation fee', () => {
    expect(avg([500, 700, 800])).toBe(666.6666666666666);
  });

  it('supports integer average values', () => {
    expect(avg([10, 20, 30])).toBe(20);
  });
});
