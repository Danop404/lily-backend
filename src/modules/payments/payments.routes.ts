import { Router } from "express";

import { validateBody } from "../../common/http/validate.middleware";
import { createQuote, executePayment, getQuote } from "./payments.controller";
import { createQuoteSchema, executePaymentSchema } from "./payments.schema";

export const paymentsRouter = Router();

paymentsRouter.post("/", validateBody(createQuoteSchema), createQuote);
paymentsRouter.get("/quotes/:id", getQuote);
paymentsRouter.post("/execute", validateBody(executePaymentSchema), executePayment);
