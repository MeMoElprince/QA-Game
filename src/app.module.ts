import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/modules/prisma/prisma.module';
import { EmailModule } from './common/modules/email/email.module';
import { OtpModule } from './common/modules/otp/otp.module';
import { SystemModule } from './system/system.module';
import { UPLOAD_PATH } from './common/constants/path.constant';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { UserRepo } from './core/user/repo/user.repo';
import { CommerceModule } from './commerce/commerce.module';
import { SupportModule } from './support/support.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        ServeStaticModule.forRoot({
            rootPath: UPLOAD_PATH,
            serveRoot: '/static-uploads',
        }),
        PrismaModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),
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
