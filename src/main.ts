import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { ConfigService } from '@nestjs/config'
import { DataSource } from 'typeorm'
import { seedDemoUser } from './seeds/demo-user.seed'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  )

  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalInterceptors(new TransformInterceptor())

  app.use(cookieParser())

  const frontendUrl = configService.get<string>('app.frontendUrl')
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })

  app.use(helmet())

  const dataSource = app.get(DataSource)
  await seedDemoUser(dataSource)

  const port = configService.get<number>('app.port')
  await app.listen(port!)
  console.log(`Application is running on: ${await app.getUrl()}`)

  const appUrl = process.env.RENDER_URL
  if (appUrl) {
    setInterval(
      () => {
        fetch(`${appUrl}/health`).catch(() => {})
      },
      10 * 60 * 1000
    )
  }
}
bootstrap()
