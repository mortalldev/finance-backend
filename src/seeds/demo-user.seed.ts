import { DataSource } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User } from '../user/entities/user.entity'

export async function seedDemoUser(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User)
  const exists = await userRepo.findOne({ where: { username: 'demo' } })
  if (!exists) {
    const passwordHash = await bcrypt.hash('demo', 12)
    await userRepo.save({
      username: 'demo',
      email: 'demo@example.com',
      fullName: 'Demo User',
      passwordHash,
    })
    console.log('✅ Demo user yaratildi: demo/demo')
  }
}
