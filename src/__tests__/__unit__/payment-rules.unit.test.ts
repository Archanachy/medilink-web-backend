describe('Payment Rules', () => {
  const toCents = (amount: number) => Math.round(amount * 100);
  const isPayable = (amount: number) => amount > 0;
  const applyCoupon = (amount: number, pct: number) => amount - amount * (pct / 100);
  const isSuccessStatus = (status: string) => status === 'paid';

  it('converts decimal amount to cents', () => {
    expect(toCents(199.99)).toBe(19999);
  });

  it('marks positive amount as payable', () => {
    expect(isPayable(1)).toBe(true);
  });

  it('marks zero amount as non-payable', () => {
    expect(isPayable(0)).toBe(false);
  });

  it('applies coupon percentage correctly', () => {
    expect(applyCoupon(1000, 10)).toBe(900);
  });

  it('recognizes paid status as success', () => {
    expect(isSuccessStatus('paid')).toBe(true);
  });

  it('recognizes pending status as not successful', () => {
    expect(isSuccessStatus('pending')).toBe(false);
  });
});
