import { Body, Controller, Get, Param, Post } from "../../lib/mock";
import { AuthTokenRequest } from "./dto/auth.dtos";

@Controller("auth")
export class AuthController {
  @Post("www")
  authenticate(@Body() body: AuthTokenRequest) {
    return [];
  }
}
