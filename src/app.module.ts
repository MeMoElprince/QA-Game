// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';

import { CoreModule } from './core/core.module';
import { SystemModule } from './system/system.module';
import { CommerceModule } from './commerce/commerce.module';
import { SupportModule } from './support/support.module';
import { PaymentModule } from './payment/payment.module';

import { PrismaModule } from './common/modules/prisma/prisma.module';
import { EmailModule } from './common/modules/email/email.module';
import { OtpModule } from './common/modules/otp/otp.module';

import { CLIENT_SIDE_PATH, UPLOAD_PATH, ADMIN_SIDE_PATH } from './common/constants/path.constant';

import { UserRepo } from './core/user/repo/user.repo';

@Module({
  imports: [
    PaymentModule,
    ScheduleModule.forRoot(),

    // 1. Highest priority: Static Uploads
    ServeStaticModule.forRoot({
      rootPath: UPLOAD_PATH,
      serveRoot: '/static-uploads',
     
    }),

    // 2. Client-Side App (Catch-All, excluding API and uploads)
    ServeStaticModule.forRoot({
      rootPath: CLIENT_SIDE_PATH,
      exclude: ['/api'],
    
    }),

    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CoreModule,
    EmailModule,
    OtpModule,
    SystemModule,
    CommerceModule,
    SupportModule,
  ],
  controllers: [],
  providers: [UserRepo],
})
export class AppModule {}
