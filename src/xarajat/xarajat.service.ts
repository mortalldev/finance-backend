import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between, ILike } from 'typeorm'
import { Xarajat } from './entities/xarajat.entity'
import { CreateXarajatDto } from './dto/create-xarajat.dto'
import { QueryXarajatDto } from './dto/query-xarajat.dto'

@Injectable()
export class XarajatService {
  constructor(
    @InjectRepository(Xarajat)
    private readonly xarajatRepo: Repository<Xarajat>
  ) {}

  async create(createXarajatDto: CreateXarajatDto, userId: string) {
    const xarajat = this.xarajatRepo.create({
      ...createXarajatDto,
      userId,
      sana: createXarajatDto.sana ? new Date(createXarajatDto.sana) : new Date(),
    })
    return await this.xarajatRepo.save(xarajat)
  }

  async findAll(query: QueryXarajatDto, userId: string) {
    const page = query.page || 1
    const limit = query.limit || 10
    const skip = (page - 1) * limit

    const qb = this.xarajatRepo
      .createQueryBuilder('xarajat')
      .where('xarajat.userId = :userId', { userId })

    if (query.kategoriya) {
      qb.andWhere('xarajat.kategoriya = :kategoriya', { kategoriya: query.kategoriya })
    }
    if (query.fromDate && query.toDate) {
      qb.andWhere('xarajat.sana BETWEEN :fromDate AND :toDate', {
        fromDate: new Date(query.fromDate),
        toDate: new Date(query.toDate),
      })
    }
    if (query.search) {
      qb.andWhere(
        '(xarajat.nom ILIKE :search OR xarajat.manzil ILIKE :search OR CAST(xarajat.miqdor AS TEXT) ILIKE :search)',
        { search: `%${query.search}%` }
      )
    }

    qb.orderBy('xarajat.sana', 'DESC')
    qb.skip(skip).take(limit)

    const [data, total] = await qb.getManyAndCount()

    return {
      data,
      meta: {
        total,
        page,
        limit,
        hasMore: total > page * limit,
      },
    }
  }

  async findOne(id: string, userId: string) {
    const xarajat = await this.xarajatRepo.findOne({ where: { id, userId } })
    if (!xarajat) throw new NotFoundException('Xarajat topilmadi')
    return xarajat
  }

  async update(id: string, updateXarajatDto: Partial<CreateXarajatDto>, userId: string) {
    const xarajat = await this.findOne(id, userId)
    Object.assign(xarajat, updateXarajatDto)
    if (updateXarajatDto.sana) {
      xarajat.sana = new Date(updateXarajatDto.sana)
    }
    return await this.xarajatRepo.save(xarajat)
  }

  async remove(id: string, userId: string) {
    const xarajat = await this.findOne(id, userId)
    await this.xarajatRepo.remove(xarajat)
    return { message: "O'chirildi" }
  }

  async getStats(userId: string) {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const day = now.getDay() || 7
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1)

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const qb = this.xarajatRepo
      .createQueryBuilder('xarajat')
      .where('xarajat.userId = :userId', { userId })

    const [todaySum, weekSum, monthSum, topKategoriyaRow] = await Promise.all([
      qb
        .clone()
        .andWhere('xarajat.sana >= :todayStart', { todayStart })
        .select('SUM(xarajat.miqdor)', 'sum')
        .getRawOne(),
      qb
        .clone()
        .andWhere('xarajat.sana >= :weekStart', { weekStart })
        .select('SUM(xarajat.miqdor)', 'sum')
        .getRawOne(),
      qb
        .clone()
        .andWhere('xarajat.sana >= :monthStart', { monthStart })
        .select('SUM(xarajat.miqdor)', 'sum')
        .getRawOne(),
      qb
        .clone()
        .select('xarajat.kategoriya', 'kategoriya')
        .addSelect('SUM(xarajat.miqdor)', 'sum')
        .groupBy('xarajat.kategoriya')
        .orderBy('sum', 'DESC')
        .limit(1)
        .getRawOne(),
    ])

    return {
      today: parseFloat(todaySum?.sum || '0'),
      thisWeek: parseFloat(weekSum?.sum || '0'),
      thisMonth: parseFloat(monthSum?.sum || '0'),
      topKategoriya: topKategoriyaRow?.kategoriya || null,
    }
  }

  async getTopCategories(userId: string) {
    return await this.xarajatRepo
      .createQueryBuilder('xarajat')
      .where('xarajat.userId = :userId', { userId })
      .select('xarajat.kategoriya', 'kategoriya')
      .addSelect('SUM(xarajat.miqdor)', 'summa')
      .groupBy('xarajat.kategoriya')
      .orderBy('summa', 'DESC')
      .limit(10)
      .getRawMany()
  }

  async getChartData(userId: string, period: string) {
    const qb = this.xarajatRepo
      .createQueryBuilder('xarajat')
      .where('xarajat.userId = :userId', { userId })

    if (period === '7d' || period === 'weekly') {
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - 7)
      return await qb
        .andWhere('xarajat.sana >= :daysAgo', { daysAgo })
        .select("TO_CHAR(xarajat.sana, 'DD.MM')", 'label')
        .addSelect('SUM(xarajat.miqdor)', 'summa')
        .groupBy("TO_CHAR(xarajat.sana, 'DD.MM')")
        .addSelect('MIN(xarajat.sana)', 'min_sana')
        .orderBy('min_sana', 'ASC')
        .getRawMany()
    } else if (period === '30d' || period === 'monthly') {
      const daysAgo = new Date()
      daysAgo.setMonth(daysAgo.getMonth() - 1)
      return await qb
        .andWhere('xarajat.sana >= :daysAgo', { daysAgo })
        .select("TO_CHAR(xarajat.sana, 'DD.MM')", 'label')
        .addSelect('SUM(xarajat.miqdor)', 'summa')
        .groupBy("TO_CHAR(xarajat.sana, 'DD.MM')")
        .addSelect('MIN(xarajat.sana)', 'min_sana')
        .orderBy('min_sana', 'ASC')
        .getRawMany()
    } else if (period === 'year') {
      const yearAgo = new Date()
      yearAgo.setFullYear(yearAgo.getFullYear() - 1)
      return await qb
        .andWhere('xarajat.sana >= :yearAgo', { yearAgo })
        .select("TO_CHAR(xarajat.sana, 'YYYY-MM')", 'label')
        .addSelect('SUM(xarajat.miqdor)', 'summa')
        .groupBy("TO_CHAR(xarajat.sana, 'YYYY-MM')")
        .addSelect('MIN(xarajat.sana)', 'min_sana')
        .orderBy('min_sana', 'ASC')
        .getRawMany()
    }

    return []
  }
}
