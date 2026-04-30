import { registerAs } from '@nestjs/config'

export default registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key-min-32-chars',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-min-32-chars',
  accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
  refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
}))
