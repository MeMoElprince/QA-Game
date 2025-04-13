import { Module } from '@nestjs/common';
import { PackageModule } from './package/package.module';
import { PromoModule } from './promo/promo.module';

@Module({
    imports: [PackageModule, PromoModule],
    controllers: [],
    providers: [],
})
export class CommerceModule {}
