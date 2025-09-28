import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User_t} from "../../shared/entities/user_t.entity";
import {UserService} from "./user.service";
import {UserController} from "./user.controller";
import { SharedModule } from '../../shared/shared.module';

@Module({
    imports: [TypeOrmModule.forFeature([User_t]),SharedModule],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule {
}
