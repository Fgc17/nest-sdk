import { Module } from "../../lib/mock";
import { AuthController } from "./auth.controller";

@Module({
  controllers: [AuthController],
})
export class AuthModule {}
