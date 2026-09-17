import { describe, expect, it } from 'vitest';

import { classifyTitle } from './classify-title';

describe('classifyTitle', () => {
  it('classifies an HR business partner title as non-it', () => {
    expect(classifyTitle('HR Business Partner')).toBe('non-it');
  });

  it('classifies a people partner title as non-it', () => {
    expect(classifyTitle('People Partner')).toBe('non-it');
  });

  it('classifies a technical recruiting title as it-recruiter', () => {
    expect(classifyTitle('Technical Recruiter')).toBe('it-recruiter');
  });

  it('classifies an engineering manager title as decision-maker', () => {
    expect(classifyTitle('Engineering Manager')).toBe('decision-maker');
  });

  it('classifies a director title as decision-maker', () => {
    expect(classifyTitle('Director of Engineering')).toBe('decision-maker');
  });

  it('classifies a founder title as decision-maker', () => {
    expect(classifyTitle('Founder & CEO')).toBe('decision-maker');
  });

  it('classifies an unmatched title as generalist', () => {
    expect(classifyTitle('Software Engineer')).toBe('generalist');
  });

  it('classifies an empty title as generalist', () => {
    expect(classifyTitle('')).toBe('generalist');
  });

  it('does not classify a Headhunter as decision-maker on the "head" substring', () => {
    expect(classifyTitle('Headhunter')).not.toBe('decision-maker');
  });
});
