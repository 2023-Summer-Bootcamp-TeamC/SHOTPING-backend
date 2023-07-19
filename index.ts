import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import axios, { AxiosResponse } from "axios";
import FormData from "form-data";
import { Sequelize, Op } from "sequelize"; // Ensure this import is at the top of your file
import promBundle from "express-prom-bundle";
// @ts-ignore
import { Product, Data } from "./models"; //모듈에 대한 타압검사를 받지 않도록 함
import winston from "winston";
import "winston-daily-rotate-file";
import sequelize from "./config/database";
import s3Client from "./config/s3Client";
import logger from "./config/logger";
import feedbackRouter from "./routers/feedbackRouter";
import paymentRouter from "./routers/paymentRouter";
import orederRouter from "./routers/orderRouter";
import productsRouter from "./routers/productsRouter";
import searchRouter from "./routers/searchRouter";
import popularRouter from "./routers/popularRouter";

dotenv.config();

const REGION = "ap-northeast-2";
const BUCKET_NAME = "bootcamp-shotping";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const app: express.Express = express();
const port = 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging with Winston
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).send("Something broke!");
});

const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
});

app.use(metricsMiddleware);

app.post(
  "/api/v1/predict",
  upload.single("upload"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).send({ error: "No file attached" });
      return;
    }

    const file = req.file;

    // 서버로 데이터를 전송할 때 사용하는 Formdata를 사용
    // 파일과 같은 바이너리 데이터를 전송할 때 유용하다.
    try {
      const formData = new FormData();
      formData.append("image", file.buffer, {
        contentType: file.mimetype,
        filename: file.originalname,
      });

      const response = await axios.post(
        "http://flask-service:5000/predict",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );

      const taskId = response.data.task_id;

      // Poll for the task result
      let taskResult = null;
      do {
        // Wait for 5 seconds before checking the result again
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Check the task result
        const taskResultResponse: AxiosResponse = await axios.get(
          `http://flask-service:5000/result/${taskId}`
        );
        taskResult = taskResultResponse.data;

        // If the task has finished, break the loop
        if (taskResult.status === "SUCCESS") {
          break;
        }
      } while (true);

      // const productQuantities = taskResult.result;
      // Print the result
      const productQuantities = JSON.parse(taskResult.result);

      // Parse the product IDs and quantities
      const productIds = Object.keys(productQuantities).map((id) =>
        parseInt(id)
      );

      // Fetch the corresponding products from the database
      const products = await Product.findAll({
        where: {
          id: {
            [Op.in]: productIds,
          },
        },
        attributes: ["id", "product_name", "product_price", "image_url"],
      });

      //interface 생성
      interface IProduct {
        id: number;
        product_name: string;
        product_price: number;
        img_url: string;
      }

      // Construct the output products array
      let outputProducts: IProduct[] = [];

      products.forEach((product: Product) => {
        const productData: IProduct = product.get({ plain: true });
        const quantity = productQuantities[product.id.toString()];
        for (let i = 0; i < quantity; i++) {
          outputProducts.push(productData);
        }
      });
      //S3연결
      const key = `photosave/${Date.now().toString()}_${file.originalname}`;

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3Client.send(command);
      const imageUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;

      // 이미지 URL과 ai_predict를 데이터베이스에 저장하고
      const data = await Data.create({
        image_url: imageUrl,
        ai_predict: taskResult.result,
      });

      res.status(200).send({ outputProducts, data_id: data.id });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Error processing file upload" });
    }
  }
);

app.use("/api/v1/feedback", feedbackRouter);

app.use("/api/v1/payment", paymentRouter);

app.use("/api/v1/order", orederRouter);

app.use("/api/v1/products", productsRouter);

app.use("/api/v1/search", searchRouter);

app.use("/api/v1/popular", popularRouter);

app.listen(port, () => console.log(`Server is running at port ${port}`));

sequelize.sync();
