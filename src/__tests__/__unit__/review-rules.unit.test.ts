describe('Review Rules', () => {
  const isValidRating = (rating: number) => Number.isInteger(rating) && rating >= 1 && rating <= 5;
  const avg = (ratings: number[]) => ratings.reduce((a, b) => a + b, 0) / ratings.length;
  const canPostReview = (completedAppointment: boolean) => completedAppointment;

  it('accepts minimum rating 1', () => {
    expect(isValidRating(1)).toBe(true);
  });

  it('accepts maximum rating 5', () => {
    expect(isValidRating(5)).toBe(true);
  });

  it('rejects decimal rating', () => {
    expect(isValidRating(4.5)).toBe(false);
  });

  it('rejects out-of-range rating', () => {
    expect(isValidRating(6)).toBe(false);
  });

  it('computes average rating correctly', () => {
    expect(avg([5, 4, 3])).toBe(4);
  });

  it('allows review only after completed appointment', () => {
    expect(canPostReview(true)).toBe(true);
  });
});
