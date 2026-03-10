describe('Appointment Rules', () => {
  const isFutureDate = (iso: string) => new Date(iso).getTime() > Date.now();
  const hasValidDuration = (minutes: number) => [15, 30, 45, 60].includes(minutes);
  const canCancel = (hoursBefore: number) => hoursBefore >= 24;
  const overlap = (aStart: number, aEnd: number, bStart: number, bEnd: number) => aStart < bEnd && bStart < aEnd;

  it('accepts future appointment dates', () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    expect(isFutureDate(tomorrow)).toBe(true);
  });

  it('rejects past appointment dates', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(isFutureDate(yesterday)).toBe(false);
  });

  it('accepts allowed slot duration', () => {
    expect(hasValidDuration(30)).toBe(true);
  });

  it('rejects unsupported slot duration', () => {
    expect(hasValidDuration(20)).toBe(false);
  });

  it('allows cancellation before policy cutoff', () => {
    expect(canCancel(36)).toBe(true);
  });

  it('detects overlapping appointments correctly', () => {
    expect(overlap(10, 11, 10.5, 11.5)).toBe(true);
  });
});
