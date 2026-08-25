import { Router } from "express";

import { validateBody } from "../../common/http/validate.middleware";
import { getQuote } from "./payments.controller";
import { quoteRequestSchema } from "./payments.schema";

export const paymentsRouter = Router();

paymentsRouter.post("/quote", validateBody(quoteRequestSchema), getQuote);
