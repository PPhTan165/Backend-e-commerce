import { Injectable } from "@nestjs/common";
import { UsersService } from "../user/user.service";

@Injectable()
export class refreshTokensService {
    constructor(
        private readonly userService: UsersService
    ){}
}