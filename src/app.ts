process.env["NODE_CONFIG_DIR"] = __dirname + "/configs";

import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import compression from "compression";
import config from "config";
import express from "express";
import { express as userAgentExpress } from "express-useragent";
import helmet from "helmet";
import hpp from "hpp";
import { getMetadataArgsStorage, useExpressServer } from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import swaggerUi from "swagger-ui-express";
class App {
  public app: express.Application;
  public port: string | number;
  public env: string;

  constructor(Controllers: Function[]) {
    this.app = express();
    this.port = process.env.PORT || 3002;
    this.env = process.env.NODE_ENV || "production";

    this.initializeSwagger(Controllers);
    this.initializeMiddlewares();
    this.initializeRoutes(Controllers);
    this.app.set("trust proxy", true);
  }

  public listen() {
    this.app.listen(this.port);
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(userAgentExpress());
  }

  private initializeRoutes(controllers: Function[]) {
    useExpressServer(this.app, {
      cors: {
        origin: config.get("cors.origin"),
        credentials: config.get("cors.credentials"),
      },
      controllers: controllers,
      defaultErrorHandler: false,
    });
  }

  private initializeSwagger(controllers: Function[]) {
    const { defaultMetadataStorage } = require("class-transformer/cjs/storage");

    const schemas = validationMetadatasToSchemas({
      classTransformerMetadataStorage: defaultMetadataStorage,
      refPointerPrefix: "#/components/schemas/",
    });

    const routingControllersOptions = {
      controllers: controllers,
    };

    const storage = getMetadataArgsStorage();
    const spec = routingControllersToSpec(storage, routingControllersOptions, {
      components: {
        schemas,
        securitySchemes: {
          BearerAuth: {
            scheme: "bearer",
            type: "http",
          },
        },
      },
      info: {
        description: "Generated with `THL ONE`",
        title: "SAM Server API",
        version: "1.0.0",
      },
    });

    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
  }
}

export default App;
