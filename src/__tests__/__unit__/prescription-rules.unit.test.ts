describe('Prescription Rules', () => {
  const hasMedicines = (items: unknown[]) => items.length > 0;
  const validDosage = (text: string) => /\d+\s?(mg|ml|mcg)/i.test(text);
  const validDuration = (days: number) => days > 0 && days <= 365;

  it('requires at least one medicine', () => {
    expect(hasMedicines(['Paracetamol'])).toBe(true);
  });

  it('rejects empty medicine list', () => {
    expect(hasMedicines([])).toBe(false);
  });

  it('accepts standard dosage pattern', () => {
    expect(validDosage('500 mg')).toBe(true);
  });

  it('rejects invalid dosage pattern', () => {
    expect(validDosage('one tablet')).toBe(false);
  });

  it('accepts valid prescription duration', () => {
    expect(validDuration(7)).toBe(true);
  });

  it('rejects invalid prescription duration', () => {
    expect(validDuration(0)).toBe(false);
  });
});
