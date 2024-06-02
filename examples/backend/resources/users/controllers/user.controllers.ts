import { Controller, Get, Param, Post } from "../../../lib/mock";

@Controller('users')
export class UserController {

    @Get(":id")
    getUsers(@Param("id") id: number, ) {
        return [];
    }

    @Post()
    createUser() {
        return {};
    }
}