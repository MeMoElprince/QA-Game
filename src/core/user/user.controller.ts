import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
    ApiBearerAuth,
    ApiConsumes,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UPLOAD_PATH } from 'src/common/constants/path.constant';
import { extname } from 'path';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { RoleEnum, User } from '@prisma/client';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import {
    UpdateUserDataDto,
    UserQueryDto,
    AdminCreateUserDto,
    UpdateUserDto,
} from './dto/user.dto';

@ApiTags('User')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Get my data',
        description:
            'Get my profile, userType: [NEW_TRAINEE, PRE_TRAINEE, TRAINEE, COACH, ADMIN, MANAGER, EMPLOYEE]',
    })
    @Get('me')
    async getMe(@GetUser() user: User) {
        return await this.userService.getUserById(user.id);
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('picture', {
            storage: diskStorage({
                destination: `${UPLOAD_PATH}/users/tmp`, // Specify the folder to store files
                filename: (req, file, callback) => {
                    const uniqueSuffix =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, callback) => {
                if (!file.mimetype.startsWith('image')) {
                    return callback(
                        new Error('Only image files are allowed!'),
                        false,
                    );
                }
                callback(null, true);
            },
        }),
    )
    @ApiOperation({
        summary: 'Update my data',
        description: 'Each user updates his profile',
    })
    @Patch('me')
    async updateMe(
        @GetUser('id') id: number,
        @Body() updateMyDateDto: UpdateUserDataDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        updateMyDateDto.picture = file;
        return await this.userService.updateMyData(+id, updateMyDateDto);
    }

    @ApiBearerAuth('default')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('picture', {
            storage: diskStorage({
                destination: `${UPLOAD_PATH}/users/tmp`, // Specify the folder to store files
                filename: (req, file, callback) => {
                    const uniqueSuffix =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, callback) => {
                if (!file.mimetype.startsWith('image')) {
                    return callback(
                        new Error('Only image files are allowed!'),
                        false,
                    );
                }
                callback(null, true);
            },
        }),
    )
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiOperation({
        summary: 'Update user data for admin only',
        description: 'update user profile',
    })
    @Patch(':id')
    async update(
        @Param('id') id: number,
        @Body() updateUserDto: UpdateUserDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        updateUserDto.picture = file;
        return await this.userService.update(+id, updateUserDto);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Create a new user',
        description: 'Create a new user by admin',
    })
    @Post()
    createUser(@Body() createUserDto: AdminCreateUserDto) {
        return this.userService.createUser(createUserDto);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Delete user',
        description: 'Delete user by admin',
    })
    @Delete(':id')
    deleteUser(@Param('id') userId: number) {
        return this.userService.deleteUser(userId);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({
        description: 'get users for any one',
        summary: 'get Users',
    })
    async getUsers(@Query() userQueryDto: UserQueryDto, @GetUser() user: User) {
        return this.userService.getUsers(userQueryDto, user);
    }
}
