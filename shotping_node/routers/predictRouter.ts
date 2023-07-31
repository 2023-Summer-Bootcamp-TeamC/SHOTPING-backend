import express from "express";
import { Request, Response } from "express";
// @ts-ignore
import { Product, Data } from "../models";
import { Op } from "sequelize";
import FormData from "form-data";
import s3Client from "../config/s3Client";
import multer from "multer";
import axios, { AxiosResponse } from "axios";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const router = express.Router();

const REGION = "ap-northeast-2";
const BUCKET_NAME = "bootcamp-shotping";
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/",
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
        attributes: [
          "id",
          "product_name",
          "product_price",
          "image_url",
          "product_stock",
        ],
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

export default router;
