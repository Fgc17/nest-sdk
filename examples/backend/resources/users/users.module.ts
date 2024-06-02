import { Module } from "../../lib/mock";
import { UserController } from "./controllers/user.controllers";

@Module({
  controllers: [UserController],
})
export class UsersModule {}
