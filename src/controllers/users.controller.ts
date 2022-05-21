import { Controller, Get } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";

@Controller()
export class UsersController {
  @Get("/users")
  @OpenAPI({ summary: "Return find a user" })
  async getUserById() {
    return "ok";
  }
}
