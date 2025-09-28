import {Inject, Injectable, Scope} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {User_t} from "../../shared/entities/user_t.entity";
import {Repository} from "typeorm";
import {Pool} from 'pg';
import {PG_POOL} from "../../shared/config/db-raw-config.module";


@Injectable({scope: Scope.REQUEST})
export class UserService {

    constructor(@InjectRepository(User_t) private readonly userRepo: Repository<User_t>,
                @Inject(PG_POOL) private readonly pool: Pool) {
    }


    async saveUser(user: Partial<User_t>): Promise<User_t> {

        return await this.userRepo.save(user);

    }

    async getUsers() {
        const res = await this.pool.query('SELECT * FROM user_t');
        return res.rows;
    }

    async getUserByCredentials(user_name: string, password: string): Promise<User_t | null> {

        return await this.userRepo.findOneBy({
            emailAddress: user_name,
            userPassword: password
        });
    }


}
