process.env["NODE_CONFIG_DIR"] = __dirname + "/configs";

import App from "@/app";
import { UsersController } from "@controllers/users.controller";
import validateEnv from "@utils/validateEnv";
import "dotenv/config";
import "reflect-metadata";

validateEnv();

const app = new App([UsersController]);
app.listen();
