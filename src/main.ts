import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import morgan from 'morgan';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PrismaExceptionFilter } from './common/exception-filters/prisma.exception';
import { ResponseFormatInterceptor } from './common/interceptors/response-format.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({});
    app.use(morgan('dev'));
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );
    app.useGlobalFilters(new PrismaExceptionFilter());
    app.useGlobalInterceptors(new ResponseFormatInterceptor());
    app.setGlobalPrefix('api');
    const configService = new ConfigService();
    const config = new DocumentBuilder()
        .addBearerAuth(undefined, 'default')
        .setTitle('QA Game')
        .setDescription('The QA Game API description')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
        swaggerOptions: {
            authAction: {
                default: {
                    name: 'default',
                    schema: {
                        description: 'Default',
                        type: 'http',
                        in: 'header',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                    value: configService.get('TOKEN'),
                },
            },
        },
    });

    const port = configService.get('PORT') || 4444;

    await app.listen(port);
}
bootstrap();
