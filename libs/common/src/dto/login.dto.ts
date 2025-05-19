import { IsEmail, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { PasswordComplex } from '../validator/password-complex.decorator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @MinLength(10, { message: '비밀번호는 최소 10자 이상이어야 합니다.' }) // nexon 회원가입 기준 영문 / 숫자 / 특수문자 조합
  @MaxLength(16, { message: '비밀번호는 16자를 초과할 수 없습니다.' }) // nexon 회원가입 기준 10~16자
  @PasswordComplex()
  @IsNotEmpty()
  password: string;
}
