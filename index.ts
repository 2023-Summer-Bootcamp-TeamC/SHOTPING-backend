import express, { Request, Response } from "express";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import axios ,{ AxiosResponse }from 'axios';
import FormData from "form-data";
import { Sequelize } from "sequelize";
import { Op } from 'sequelize'; // Ensure this import is at the top of your file

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


app.post('/api/v1/predict', upload.single('upload'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).send({ error: 'No file attached' });
    return;
  }

  const file = req.file;
  const key = `photosave/${Date.now().toString()}_${file.originalname}`;
  try{
  const formData = new FormData();
  formData.append('image', file.buffer, {
    contentType: file.mimetype,
    filename: file.originalname,
  });

  const response=await axios.post("http://flask-service:5000/predict", formData, {
    headers: {
      ...formData.getHeaders(),
    },
  });

  const taskId = response.data.task_id;

  // Poll for the task result
  let taskResult = null;
  do {
  // Wait for 5 seconds before checking the result again
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check the task result
    const taskResultResponse: AxiosResponse = await axios.get(`http://flask-service:5000/result/${taskId}`);
    taskResult = taskResultResponse.data;

  // If the task has finished, break the loop
    if (taskResult.status === 'SUCCESS') {
      break;
    }
  } while (true);

  // const productQuantities = taskResult.result;
  // Print the result
  const productQuantities = JSON.parse(taskResult.result);

  console.log('Product quantities:', productQuantities);
  // Parse the product IDs and quantities
  const productIds = Object.keys(productQuantities).map(id => parseInt(id));
  // Fetch products from the database
  console.log(productIds)
  // Fetch the corresponding products from the database
  const products = await Product.findAll({
    where: {
      id: {
        [Op.in]: productIds
      }
    },
    attributes: ['id', 'product_name', 'product_price', 'image_url']
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
  res.status(200).send({ outputProducts });

  //S3연결
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
  ai_predict: taskResult.result
  });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error processing file upload' });
  }
});

app.listen(port, () => console.log("Server is running at port 8080"));

sequelize.sync();