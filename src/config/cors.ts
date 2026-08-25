import type { CorsOptions } from "cors";

import { AppError } from "../common/http/app-error";
import { env, securityConfig } from "./env";

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (
      env.NODE_ENV !== "production" &&
      securityConfig.allowedOrigins.includes("*")
    ) {
      callback(null, true);
      return;
    }

    if (securityConfig.allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new AppError(403, "Origin is not allowed by CORS policy"));
  },
  credentials: false,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};
