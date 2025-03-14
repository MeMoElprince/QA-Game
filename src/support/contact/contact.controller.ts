import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateContactDto } from './dto/create-contact.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/core/auth/guard/roles.guard';
import { Roles } from 'src/core/auth/decorator/roles.decorator';
import { RoleEnum } from '@prisma/client';

@ApiTags('Contact')
@Controller('contacts')
export class ContactController {
    constructor(private readonly contactService: ContactService) {}

    @ApiOperation({
        summary: 'User send contact',
        description: 'user send contact',
    })
    @Post()
    async sendContact(@Body() createContactDto: CreateContactDto) {
        return this.contactService.create(createContactDto);
    }

    @ApiOperation({
        summary: 'admin get contacts',
        description: 'admin get contacts',
    })
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @Get()
    async getAll(@Query() paginationDto: PaginationDto) {
        return this.contactService.findAll(paginationDto);
    }

    @ApiOperation({
        summary: 'admin get contact',
        description: 'admin get contact',
    })
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @Get(':id')
    async getOne(@Query('id') id: number) {
        return this.contactService.findOne(id);
    }
}
