import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common'
import { XarajatService } from './xarajat.service'
import { CreateXarajatDto } from './dto/create-xarajat.dto'
import { QueryXarajatDto } from './dto/query-xarajat.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { User } from '../user/entities/user.entity'

@UseGuards(JwtAuthGuard)
@Controller('xarajat')
export class XarajatController {
  constructor(private readonly xarajatService: XarajatService) {}

  @Post()
  create(@Body() createXarajatDto: CreateXarajatDto, @CurrentUser() user: User) {
    return this.xarajatService.create(createXarajatDto, user.id)
  }

  @Get('stats')
  getStats(@CurrentUser() user: User) {
    return this.xarajatService.getStats(user.id)
  }

  @Get('kategoriyalar')
  getTopCategories(@CurrentUser() user: User) {
    return this.xarajatService.getTopCategories(user.id)
  }

  @Get('chart')
  getChartData(@Query('period') period: string, @CurrentUser() user: User) {
    return this.xarajatService.getChartData(user.id, period || 'weekly')
  }

  @Get()
  findAll(@Query() query: QueryXarajatDto, @CurrentUser() user: User) {
    return this.xarajatService.findAll(query, user.id)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.xarajatService.findOne(id, user.id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateXarajatDto: Partial<CreateXarajatDto>,
    @CurrentUser() user: User
  ) {
    return this.xarajatService.update(id, updateXarajatDto, user.id)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.xarajatService.remove(id, user.id)
  }
}
