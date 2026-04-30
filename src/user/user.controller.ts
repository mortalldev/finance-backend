import { Controller, Patch, Body, UseGuards } from '@nestjs/common'
import { UserService } from './user.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { User } from './entities/user.entity'

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateData: { fullName?: string; email?: string }
  ) {
    return this.userService.update(user.id, updateData)
  }
}
