import { Validate } from 'class-validator';
import { PasswordComplexValidator } from './password-complex.validator';

/**
 * @PasswordComplex('[특수문자집합]') 형태로 사용 가능.
 * 인자 생략 시 기본 특수문자 집합을 사용.
 */
export function PasswordComplex(allowedSpecialChars?: string) {
  return Validate(PasswordComplexValidator, [allowedSpecialChars]);
}
