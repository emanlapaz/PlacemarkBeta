import Hapi from "@hapi/hapi";
import Vision from "@hapi/vision";
import Cookie from "@hapi/cookie";
import Bell from "@hapi/bell";
import Handlebars from "handlebars";
import path from "path";
import dotenv from "dotenv";
import Joi from "joi";
import HapiSwagger from "hapi-swagger";
import jwt from "hapi-auth-jwt2";

import Inert from "@hapi/inert";
import { fileURLToPath } from "url";
import { webRoutes } from "./web-routes.js";
import { db } from "./models/db.js";
import { accountsController } from "./controllers/accounts-controller.js";
import { apiRoutes } from "./api-routes.js";
import { validate } from "./api/jwt-utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const result = dotenv.config();
if (result.error) {
  console.log(result.error.message);
  process.exit(1);
}

const swaggerOptions = {
  info: {
    title: "Placemark API",
    version: "0.1",
  },
  securityDefinitions: {
    jwt: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
    },
  },
  security: [{ jwt: [] }],
};

async function init() {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
  });
  
  await server.register(Inert);
  await server.register(Vision);
  await server.register(Cookie);
  await server.register(Bell);
  await server.register(jwt);
  
  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  ]);

  server.validator(Joi);
  
  server.views({
    engines: {
      hbs: Handlebars,
    },
    relativeTo: __dirname,
    path: "./views",
    layoutPath: "./views/layouts",
    partialsPath: "./views/partials",
    layout: true,
    isCached: false,
  }); 

  server.auth.strategy("session", "cookie", {
    cookie: {
      name: process.env.cookie_name,
      password: process.env.cookie_password,
      isSecure: false,
    },
    redirectTo: "/",
    validate: accountsController.validate,
  });
  
  server.auth.strategy("jwt", "jwt", {
    key: process.env.cookie_password,
    validate: validate,
    verifyOptions: { algorithms: ["HS256"] }
  });

  server.auth.strategy("github", "bell", {
    provider: "github",
    password: process.env.cookie_password, 
    clientId: "0e14c8811ac566b86e7a", 
    clientSecret: "Ye0aceb951c7c3e1b5c3985c987bde2aa80a1d700", 
    isSecure: false 
  });

  server.route({
    method: ["GET", "POST"],
    path: "/github/login",
    options: {
        auth: "github",
        handler: async function (request, h) {
            try {
                if (!request.auth.isAuthenticated) {
                    return `Authentication failed due to: ${request.auth.error.message}`;
                }
                const { credentials } = request.auth;
                console.log(credentials);
                return h.redirect("/");
            } catch (error) {
                console.error(error);
                return h.response("An error occurred during authentication").code(500);
            }
        }
    }
});



  server.auth.default("session");  

  db.init("mongo");
  server.route(webRoutes);
  server.route(apiRoutes);
  await server.start();
  console.log("Server running on %s", server.info.uri);
}

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();