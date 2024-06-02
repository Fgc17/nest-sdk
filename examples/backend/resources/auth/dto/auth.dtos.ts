import { IsEmail } from "../../../lib/mock";

export class AuthTokenRequest {
  @IsEmail()
  email: string;

  password: number;
}
