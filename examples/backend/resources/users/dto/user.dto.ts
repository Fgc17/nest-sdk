import { PartialType } from "../../../lib/mock";
import { User } from "../user.entities";

export class UpdateUserDto extends PartialType(User) {}
