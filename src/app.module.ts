import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/modules/prisma/prisma.module';
import { EmailModule } from './common/modules/email/email.module';
import { OtpModule } from './common/modules/otp/otp.module';
import { SystemModule } from './system/system.module';
import {
    CLIENT_SIDE_PATH,
    UPLOAD_PATH,
    ADMIN_SIDE_PATH
} from './common/constants/path.constant';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { UserRepo } from './core/user/repo/user.repo';
import { CommerceModule } from './commerce/commerce.module';
import { SupportModule } from './support/support.module';
import { PaymentModule } from './payment/payment.module';
console.log(CLIENT_SIDE_PATH)

@Module({
    imports: [
        PaymentModule,
        ScheduleModule.forRoot(),
        
        // 1. Highest priority: Uploads
        ServeStaticModule.forRoot({
            rootPath: UPLOAD_PATH,
            serveRoot: '/static-uploads',
              serveStaticOptions: {
                fallthrough: false, // Allow client-side routing
            }
        }),
        
        
        // 3. Client-side app (catch-all)
        ServeStaticModule.forRoot({
            rootPath: CLIENT_SIDE_PATH,
            exclude: ['/api*', '/dashboard*', '/static-uploads*'],
            serveStaticOptions: {
                fallthrough: true, // Allow client-side routing
            },
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