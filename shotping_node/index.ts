import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import promBundle from "express-prom-bundle";
import "winston-daily-rotate-file";
import logger from "./config/logger";
import feedbackRouter from "./routers/feedbackRouter";
import paymentRouter from "./routers/paymentRouter";
import orederRouter from "./routers/orderRouter";
import productsRouter from "./routers/productsRouter";
import searchRouter from "./routers/searchRouter";
import popularRouter from "./routers/popularRouter";
import predictRouter from "./routers/predictRouter";

dotenv.config();

const app: express.Express = express();
const port = 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// // Request 로그 저장
// app.use((req: Request, res: Response, next: NextFunction) => {
//   const start = new Date().getTime();

//   res.on('finish', () => { 
//     const duration = new Date().getTime() - start;
//     logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
//   });

//   next();
// });
// 에러 로그 저장
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).send("Something broke!");
});

const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
});

app.use(metricsMiddleware);

app.use("/api/v1/predict", predictRouter);

app.use("/api/v1/feedback", feedbackRouter);

app.use("/api/v1/payment", paymentRouter);

app.use("/api/v1/order", orederRouter);

app.use("/api/v1/products", productsRouter);

app.use("/api/v1/search", searchRouter);

app.use("/api/v1/popular", popularRouter);

app.listen(port, () => console.log(`Server is running at port ${port}`));
