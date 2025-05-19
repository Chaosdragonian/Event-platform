import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

const DEFAULT_SPECIAL = '!@#$%^&*()_+\\-={}\\[\\]|\\\\:;"\'<>,.?/~`';

/**
 * 비밀번호 복잡도 검사:
 *   - 영문 1+
 *   - 숫자 1+
 *   - 특수문자 1+
 */
@ValidatorConstraint({ name: 'PasswordComplex', async: false })
export class PasswordComplexValidator implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (typeof value !== 'string') return false;

    // 필요하면 특수문자 세트를 옵션으로 받도록 확장할 수 있음
    const special = (args.constraints[0] as string) || DEFAULT_SPECIAL;
    const regex = new RegExp(`^(?=.*[A-Za-z])(?=.*\\d)(?=.*[${special}]).+$`);
    return regex.test(value);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(args: ValidationArguments): string {
    return '비밀번호에는 영문자, 숫자, 특수문자가 각각 최소 1개 이상 포함되어야 합니다.';
  }
}
