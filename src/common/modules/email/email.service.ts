import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import { join } from 'path';
import * as pug from 'pug';
import { Injectable } from '@nestjs/common';
import { Environment } from 'src/common/enums/environment.enum';
import { VIEW_PATH } from 'src/common/constants/path.constant';

@Injectable()
export class EmailService {
    private from: string;

    constructor(private readonly configService: ConfigService) {
        this.from = `QA Game <${configService.get('EMAIL')}>`;
        console.log(this.from)
        console.log(this.configService.get('EMAIL_PASSWORD'))
    }

    newTransport() {
        if (this.configService.get('NODE_ENV') === Environment.PRODUCTION) {
            return nodemailer.createTransport({
                host: this.configService.get('EMAIL_HOST'),
                // secure: true,
                port: this.configService.get('EMAIL_PORT'),
                auth: {
                    user: this.configService.get('EMAIL'),
                    pass: this.configService.get('EMAIL_PASSWORD'),
                },
            });
        }
        return null;
    }

    async send(template: string, subject: string, user: User, url?: string) {
        // 1) render html based on a pug template
        const fullPath = join(VIEW_PATH, 'email', `${template}.pug`);
        const html = pug.renderFile(fullPath, {
            name: user.name.split(' ')[0],
            url,
            subject: subject,
            email: user.email,
        });
        // 2) email options
        const mailOptions = {
            from: this.from,
            to: user.email,
            subject,
            html,
        };
        // 3) create a transporter and send email
        const transporter = this.newTransport();
        if (transporter) {
            await transporter.sendMail(mailOptions);
        } else {
            console.log('Dev mode no email sent');
            console.log({ url, subject, email: user.email });
        }
    }

    async sendCustom(
        template: string,
        subject: string,
        to: string,
        name: string,
        object: object,
    ) {
        // 1) render html based on a pug template
        const fullPath = join(VIEW_PATH, 'email', `${template}.pug`);
        const html = pug.renderFile(fullPath, {
            name,
            object,
            subject: subject,
            email: to,
        });
        // 2) email options
        const mailOptions = {
            from: this.from,
            to,
            subject,
            html,
        };
        // 3) create a transporter and send email
        const transporter = this.newTransport();
        if (transporter) {
            await transporter.sendMail(mailOptions);
        } else {
            console.log('Dev mode no email sent');
            console.log({ object, subject, email: to });
        }
    }

    async sendWelcome(user: User, url: string) {
        await this.send('welcome', 'Welcome To our website', user, url);
    }

    async verifyAccount(user: User, url: string) {
        console.log('verifyAccount',user,url)

        await this.send(
            'verifyAccount',
            'Please Verify Your Account',
            user,
            url,
        );
    }

    async verifyAccountProvider(user: User, url: string) {
        console.log('verifyAccountProvider',user,url)
        await this.send(
            'verifyAccountProvider',
            'Your Application is under reviewd, Please Verify Your Account',
            user,
            url,
        );
    }

    async forgetPassword(user: User, url: string) {
        console.log('Forget Pass',user,url)

        await this.send('forgetPassword', 'Reset Your Password', user, url);
    }
}
