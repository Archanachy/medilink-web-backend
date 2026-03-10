describe('Support Ticket Rules', () => {
  const validPriority = (p: string) => ['low', 'medium', 'high', 'urgent'].includes(p);
  const closeAllowed = (status: string) => ['resolved', 'closed'].includes(status);
  const slaBreached = (hoursOpen: number, slaHours = 48) => hoursOpen > slaHours;

  it('accepts allowed priority values', () => {
    expect(validPriority('high')).toBe(true);
  });

  it('rejects unsupported priority values', () => {
    expect(validPriority('critical-plus')).toBe(false);
  });

  it('allows close for resolved status', () => {
    expect(closeAllowed('resolved')).toBe(true);
  });

  it('blocks close for open status', () => {
    expect(closeAllowed('open')).toBe(false);
  });

  it('flags SLA breach after threshold', () => {
    expect(slaBreached(72)).toBe(true);
  });

  it('does not flag SLA within threshold', () => {
    expect(slaBreached(24)).toBe(false);
  });
});
