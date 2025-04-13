import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { PackageService } from './package.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/core/auth/guard/roles.guard';
import { RoleEnum } from '@prisma/client';
import { Roles } from 'src/core/auth/decorator/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('Package')
@Controller('packages')
export class PackageController {
    constructor(private readonly packageService: PackageService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Create a new package',
        description: 'Create a new package with image, by admin',
    })
    create(@Body() createPackageDto: CreatePackageDto) {
        return this.packageService.create(createPackageDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all packages',
        description: 'Get all packages',
    })
    findAll(@Query() pagination: PaginationDto) {
        return this.packageService.findAll(pagination);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get a package',
        description: 'Get a package by id',
    })
    @ApiParam({
        name: 'id',
        description: 'The id of the package',
        type: Number,
        required: true,
    })
    findOne(@Param('id') id: number) {
        return this.packageService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update a package',
        description: 'Update a package by id',
    })
    @ApiBearerAuth('default')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    update(
        @Param('id') id: number,
        @Body() updatePackageDto: UpdatePackageDto,
    ) {
        return this.packageService.update(+id, updatePackageDto);
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    @ApiOperation({
        summary: 'Delete a package',
        description: 'Delete a package by id',
    })
    @ApiBearerAuth('default')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiParam({
        name: 'id',
        description: 'The id of the package',
        type: Number,
        required: true,
    })
    remove(@Param('id') id: number) {
        return this.packageService.remove(+id);
    }
}
