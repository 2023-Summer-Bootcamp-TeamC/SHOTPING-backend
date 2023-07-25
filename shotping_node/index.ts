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

//@ts-ignore
import swaggerUi from "swagger-ui-express";
//@ts-ignore
import YAML from "yamljs";

dotenv.config();

const app: express.Express = express();
const port = 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// 로그 생성용 미들웨어
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl !== '/metrics') { // '/metrics' 경로의 로그를 무시
    res.on('finish', function() {
      const baseURL = req.baseUrl ? req.baseUrl : '';
      const fullPathWithoutQuery = baseURL + req.path;

      if (res.statusCode < 400) {
        logger.info(`API Success: ${req.method} ${fullPathWithoutQuery} Status code: ${res.statusCode}`);
      } else {
        logger.error(`API Error: ${req.method} ${fullPathWithoutQuery} Status code: ${res.statusCode}`);
      }
    });
  }
  next();
});

const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
});

const swaggerDocument = YAML.load("./swagger/swagger.yaml");

app.use(metricsMiddleware);

app.use("/api/v1/predict", predictRouter);

app.use("/api/v1/feedback", feedbackRouter);

app.use("/api/v1/payment", paymentRouter);

app.use("/api/v1/order", orederRouter);

app.use("/api/v1/products", productsRouter);

app.use("/api/v1/search", searchRouter);

app.use("/api/v1/popular", popularRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => console.log(`Server is running at port ${port}`));
