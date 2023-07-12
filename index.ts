import express, { Request, Response } from "express";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import axios from "axios";
import FormData from "form-data";
import { Sequelize } from "sequelize";

// @ts-ignore
import { Product, Data } from "./models"; //모듈에 대한 타압검사를 받지 않도록 함

dotenv.config();

const REGION = "ap-northeast-2";
const BUCKET_NAME = "bootcamp-shotping";
// 환경변수에서 정보 불러오기
const MYSQL_HOST = process.env.MYSQL_HOST as string;
const MYSQL_USER = process.env.MYSQL_USER as string;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD as string;
const MYSQL_DATABASE = process.env.MYSQL_DATABASE as string;
const ACCESS_KEY = process.env.ACCESS_KEY as string;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY as string;

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const sequelize = new Sequelize(MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, {
  host: MYSQL_HOST,
  dialect: "mysql",
  logging: false,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const app: express.Express = express();
const port = 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const connection = mysql.createConnection({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
});

app.post(
  "/recognition",
  upload.single("upload"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).send({ error: "No file attached" });
      return;
    }

    const file = req.file;
    const key = `photosave/${Date.now().toString()}_${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await s3Client.send(command);
      const imageUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;

      // Insert the image URL into the database and get the inserted id
      // const [insertResults] = await (await connection).query(`INSERT INTO recogimg (imgurl) VALUES (?)`, [imageUrl]);
      const [insertResults] = await (
        await connection
      ).query(
        `INSERT INTO Data (image_url, ai_predict, iscorrect, feedback_text, createdAt, updatedAt) 
        VALUES (?, 'default_value', 0, 'default_text', NOW(), NOW())`,
        [imageUrl]
      );
      const imgId = (insertResults as mysql.OkPacket).insertId;

      const formData = new FormData();
      formData.append("image", file.buffer, {
        contentType: file.mimetype,
        filename: file.originalname,
      });

      formData.append("id", imgId.toString());

      const predictResult = await axios.post(
        "http://flask-service:5000/test_predict",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );
      // Assume the predictResult.data contains the product names
      //  const productNames = predictResult.data;

      // Insert the image URL into the database
      // (await connection).query(`INSERT INTO recogimg (imgurl) VALUES (?)`, [imageUrl]);

      res.status(200).send({ imageUrl: imageUrl, imgId: imgId });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Error processing file upload" });
    }
  }
);

app.get("/api/v1/products", async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1; // 디폴트 값: 1
  const limit = 5;
  const offset = (page - 1) * limit;

  try {
    const { count, rows: products } = await Product.findAndCountAll({
      limit: limit,
      offset: offset,
      attributes: ['id', 'product_name', 'product_price', 'product_stock', 'image_url']
    });

    const totalPages = Math.ceil(count / limit);
    const prevPage = page - 1 > 0 ? page - 1 : null;
    const nextPage = page + 1 <= totalPages ? page + 1 : null;

    const hasPrev = page - 1 > 0 ? true : false;
    const hasNext = page + 1 <= totalPages ? true : false;

    res.status(200).json({
      meta: {
        page: page,
        pages: totalPages,
        prev_page: prevPage,
        next_page: nextPage,
        total_count: count,
        has_prev: hasPrev,
        has_next: hasNext
      },
      data: products
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error retrieving product data" });
  }
});

app.get("/api/v1/search", async (req: Request, res: Response) => {
  const keyword = req.query.kw as string;

  if (!keyword || keyword.trim() === '') {
    res.status(400).send({ error: "Invalid keyword" });
    return;
  }

  try {
    const lowerKeyword = keyword.toLowerCase();
    const products = await Product.findAll({
      where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('product_name')), 'LIKE', `%${lowerKeyword}%`),
      attributes: ['product_name', 'product_price', 'product_stock', 'image_url'],
    });

    if (!products) {
      res.status(404).send({ error: "No products found" });
      return;
    }

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error retrieving product data" });
  }
});

app.listen(port, () => console.log("Server is running at port 8080"));

sequelize.sync();

/* 기존 테이블을 삭제하는 코드
connection
  .then(async (conn) => {
    await conn.query(`DROP TABLE IF EXISTS product;`);
    await conn.query(`DROP TABLE IF EXISTS recogimgs;`);
  })
  .catch((error) => {
    console.error(error);
  });
*/
