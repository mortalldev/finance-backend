import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(userData: Partial<User>) {
    const user = this.userRepository.create(userData)
    return await this.userRepository.save(user)
  }

  async findByUsername(username: string) {
    return await this.userRepository.findOne({ where: { username } })
  }

  async findByUsernameOrEmail(username: string, email: string) {
    return await this.userRepository.findOne({
      where: [{ username }, { email }],
    })
  }

  async findById(id: string) {
    return await this.userRepository.findOne({ where: { id } })
  }

  async update(id: string, updateData: Partial<User>) {
    await this.userRepository.update(id, updateData)
    const updatedUser = await this.findById(id)
    if (!updatedUser) return null
    const { passwordHash, refreshTokenHash, ...result } = updatedUser
    return result
  }

  async updateRefreshToken(id: string, refreshTokenHash: string) {
    await this.userRepository.update(id, { refreshTokenHash })
  }

  async removeRefreshToken(id: string) {
    await this.userRepository.update(id, { refreshTokenHash: null })
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, id: string) {
    const user = await this.findById(id)
    if (!user || !user.refreshTokenHash) {
      return null
    }
    const bcrypt = await import('bcrypt')
    const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.refreshTokenHash)
    if (isRefreshTokenMatching) {
      return user
    }
    return null
  }
}
