import { PartialType } from '@nestjs/mapped-types'
import { CreateXarajatDto } from './create-xarajat.dto'

export class UpdateXarajatDto extends PartialType(CreateXarajatDto) {}
