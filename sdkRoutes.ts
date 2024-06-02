
    import { User, UserInfo } from "./examples/backend/sdk/typing/user.entities";
import { AuthTokenRequest } from "./examples/backend/sdk/typing/auth.dtos";
import { UpdateUserDto } from "./examples/backend/sdk/typing/user.dto";

    export interface SdkRoutesTypes {
      
        auth: {
          
            authenticate: {
              body?: AuthTokenRequest;
              
              
              response: never[];
            };
          
        };
      

        users: {
          
            getUsers: {
              
              
              params?: {id:number};
              response: never[];
            };
          

            createUser: {
              
              
              
              response: {};
            };
          
        };
      
    }

    export const SdkRoutesData = {
      
        auth: {
          
            authenticate: {
              url: "auth/token",
              httpOperation: "Post",
            },
          
        },
      

        users: {
          
            getUsers: {
              url: "users/:id",
              httpOperation: "Get",
            },
          

            createUser: {
              url: "users/",
              httpOperation: "Post",
            },
          
        },
      
    }
  