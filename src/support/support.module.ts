import { Module } from '@nestjs/common';
import { ContactModule } from './contact/contact.module';

@Module({
    imports: [ContactModule],
    controllers: [],
    providers: [],
})
export class SupportModule {}
