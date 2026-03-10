describe('Doctor Availability Rules', () => {
  const hasGap = (minutesBetweenAppointments: number, minGap = 10) => minutesBetweenAppointments >= minGap;
  const withinDailyLimit = (appointments: number, max = 20) => appointments <= max;
  const canTakeEmergency = (currentLoad: number) => currentLoad < 5;

  it('allows appointment when required gap exists', () => {
    expect(hasGap(15)).toBe(true);
  });

  it('blocks appointment when gap is too short', () => {
    expect(hasGap(5)).toBe(false);
  });

  it('accepts schedule within daily limit', () => {
    expect(withinDailyLimit(18)).toBe(true);
  });

  it('rejects schedule beyond daily limit', () => {
    expect(withinDailyLimit(21)).toBe(false);
  });

  it('allows emergency slot for low load', () => {
    expect(canTakeEmergency(2)).toBe(true);
  });

  it('denies emergency slot for overloaded queue', () => {
    expect(canTakeEmergency(8)).toBe(false);
  });
});
