import { User } from "./user.entities";
import { PartialType } from "./additional-code";

export class UpdateUserDto extends PartialType(User) {}
