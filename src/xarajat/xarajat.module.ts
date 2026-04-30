import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { XarajatService } from './xarajat.service'
import { XarajatController } from './xarajat.controller'
import { Xarajat } from './entities/xarajat.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Xarajat])],
  controllers: [XarajatController],
  providers: [XarajatService],
})
export class XarajatModule {}
