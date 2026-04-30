import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { Response } from 'express'
import { UserService } from '../user/user.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(registerDto: RegisterDto) {
    const existUser = await this.userService.findByUsernameOrEmail(
      registerDto.username,
      registerDto.email
    )
    if (existUser) {
      if (existUser.username === registerDto.username) {
        throw new ConflictException('Bu username allaqachon band')
      }
      if (existUser.email === registerDto.email) {
        throw new ConflictException('Bu email allaqachon band')
      }
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 12)

    const user = await this.userService.create({
      username: registerDto.username,
      email: registerDto.email,
      fullName: registerDto.fullName,
      passwordHash,
    })

    return {
      message: "Ro'yxatdan o'tdingiz",
    }
  }

  async login(loginDto: LoginDto, response: Response) {
    const user = await this.userService.findByUsername(loginDto.username)
    if (!user) {
      throw new UnauthorizedException('Username yoki parol xato')
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Username yoki parol xato')
    }

    return this.generateTokensAndSetCookies(user, response)
  }

  async refresh(userId: string, response: Response) {
    const user = await this.userService.findById(userId)
    if (!user) {
      throw new UnauthorizedException()
    }
    return this.generateTokensAndSetCookies(user, response)
  }

  async logout(userId: string, response: Response) {
    await this.userService.removeRefreshToken(userId)
    response.clearCookie('access_token')
    response.clearCookie('refresh_token')
    return { message: 'Tizimdan chiqildi' }
  }

  private async generateTokensAndSetCookies(user: any, response: Response) {
    const payload = { sub: user.id, username: user.username }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpires') as any,
      }),
    ])

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)
    await this.userService.updateRefreshToken(user.id, hashedRefreshToken)

    const isProd =
      process.env.NODE_ENV === 'production' || !!process.env.RENDER || process.env.VERCEL === '1'
    const sameSite = isProd ? 'none' : 'lax'
    const secure = isProd

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: secure,
      sameSite: sameSite,
      maxAge: 15 * 60 * 1000, // 15 min
      path: '/',
    })

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: secure,
      sameSite: sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    })

    const { passwordHash, refreshTokenHash, ...userResponse } = user
    return {
      user: userResponse,
      accessToken: accessToken,
      refreshToken: refreshToken, // Refresh tokenni ham qaytaramiz
    }
  }
}
