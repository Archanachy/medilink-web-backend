describe('Patient Profile Rules', () => {
  const validName = (name: string) => name.trim().length >= 2;
  const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validAge = (age: number) => age >= 0 && age <= 120;

  it('accepts valid patient name', () => {
    expect(validName('Arun')).toBe(true);
  });

  it('rejects one-character name', () => {
    expect(validName('A')).toBe(false);
  });

  it('accepts valid email format', () => {
    expect(validEmail('patient@medilink.com')).toBe(true);
  });

  it('rejects malformed email format', () => {
    expect(validEmail('patient@medilink')).toBe(false);
  });

  it('accepts realistic patient age', () => {
    expect(validAge(34)).toBe(true);
  });

  it('rejects invalid patient age range', () => {
    expect(validAge(130)).toBe(false);
  });
});
