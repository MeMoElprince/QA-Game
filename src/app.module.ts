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

@Module({
    imports: [
        PaymentModule,
        ScheduleModule.forRoot(),
        
        // 1. Static uploads (highest priority)
        ServeStaticModule.forRoot({
            rootPath: UPLOAD_PATH,
            serveRoot: '/static-uploads',
            serveStaticOptions: {
                fallthrough: false,
            },
        }),
        
        // 2. Admin dashboard (medium priority)
        ServeStaticModule.forRoot({
            rootPath: ADMIN_SIDE_PATH,
            serveRoot: '/dashboard',
            serveStaticOptions: {
                index: 'index.html', // Explicit admin entry point
                fallthrough: false,
            },
        }),
        
        // 3. Client-side app (lowest priority)
        ServeStaticModule.forRoot({
            rootPath: CLIENT_SIDE_PATH,
            exclude: ['/api*', '/dashboard*', '/static-uploads*'],
            serveStaticOptions: {
                index: 'index.html', // Explicit admin entry point
                fallthrough: true, // Allows client-side routing
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