import { Entity } from "../../lib/mock";

@Entity()
export class User {
  id: number;
  email: string;
  password: string;
}

@Entity()
export class UserInfo {
  id: number;
  name: string;
  email: string;
  password: string;
  age: number;
}
