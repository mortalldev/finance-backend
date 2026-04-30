import { IsString, IsEmail, MinLength, MaxLength, Matches } from 'class-validator'

export class RegisterDto {
  @IsString()
  @MinLength(2)
  fullName: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Faqat harf, raqam va _ (pastki chiziq) ruxsat etiladi' })
  username: string

  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[A-Z])/, { message: "Kamida 1 ta katta harf bo'lishi kerak" })
  @Matches(/(?=.*[0-9])/, { message: "Kamida 1 ta raqam bo'lishi kerak" })
  password: string
}
