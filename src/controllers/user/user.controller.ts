import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';
import {UserService} from "./user.service";
import {User_t} from "../../shared/entities/user_t.entity";
import {ApiResponseInterface} from "../../shared/interfaces/api-response.interface";
import {UserDto} from "../../shared/dtos/user-dto";
import {ResponseHelper} from "../../shared/helpers/response-helper";
import {TokenHelper} from "../../shared/helpers/token-helper.service";
import {AuthGuard} from "../../shared/guards/auth.guard";


@Controller({path: 'user', version: '1'})

export class UserController {

    constructor(private readonly userService: UserService,
                private readonly responseHelper: ResponseHelper,private tokenHelper:TokenHelper) {
    }

    @UseGuards(AuthGuard)
    @Post('saveUser')
    async saveUser(@Body() user: UserDto): Promise<ApiResponseInterface<User_t>> {

        try {

            let queryResult = await this.userService.saveUser(user);

            return this.responseHelper.SuccessReturn<User_t>(
                'User saved successfully',
                queryResult
            );


        } catch (e) {
            return this.responseHelper.errorReturn<User_t>(
                'Error saving user',
                e.message,
                User_t
            );
        }
    }

    @UseGuards(AuthGuard)
    @Get('getUsers')
    async getUsers() {

        try {

            let queryResult = await this.userService.getUsers();

            return this.responseHelper.SuccessReturn<typeof queryResult>(
                'user list fetched successfully',
                queryResult
            );

        } catch (e) {
            return this.responseHelper.errorReturn<string>(
                'Error fetching list',
                e.message
            );
        }
    }

    @Post('login')
    async login(@Body() body: Record<string, any>) {
        try {
            const {user_name, user_password} = body;

            let queryResult = await this.userService.getUserByCredentials(user_name,user_password);

            if(queryResult){

                const payload = {
                    id: queryResult.userId,
                    user_name: queryResult.emailAddress
                };

                const token = this.tokenHelper.createToken(payload);

                return this.responseHelper.SuccessReturn<string>(
                    null,
                    queryResult,
                    token
                );
            }
            else
            {
                return this.responseHelper.SuccessReturn<string>(
                    'Invalid Credentials',
                    null
                );

            }
        } catch (e) {
            return this.responseHelper.errorReturn<string>(
                'Error fetching list',
                e.message
            );
        }


    }
}
