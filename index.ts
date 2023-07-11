import express, { Request, Response } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise'
import axios from 'axios';
import FormData from 'form-data';

dotenv.config();

const REGION = "ap-northeast-2";
const BUCKET_NAME = "summer-bootcamp-shotping";
const ACCESS_KEY = process.env.ACCESS_KEY as string;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY as string;

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const app: express.Express = express();
const port=8080
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const connection = mysql.createConnection({
  host: "db",
  user: "admin",
  password: "1234",
  database: "shotping"
});

// Table creation
connection.then(async (conn) => {
  await conn.query(`CREATE TABLE IF NOT EXISTS recogimg (id INT AUTO_INCREMENT PRIMARY KEY, imgurl VARCHAR(255), imgresult VARCHAR(255))`);
}).catch((error) => {
  console.error(error);
});

app.post('/recognition', upload.single('upload'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).send({ error: 'No file attached' });
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
    const [insertResults] = await (await connection).query(`INSERT INTO recogimg (imgurl) VALUES (?)`, [imageUrl]);
    const imgId = (insertResults as mysql.OkPacket).insertId;
    console.log(`Inserted image id: ${imgId}`);
    const formData = new FormData();
    formData.append('image', file.buffer, {
      contentType: file.mimetype,
      filename: file.originalname,
    });
    formData.append('id', imgId.toString());
  
    const response = await axios.post("http://flask-service:5000/predict", formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });


    // Insert the image URL into the database
    // (await connection).query(`INSERT INTO recogimg (imgurl) VALUES (?)`, [imageUrl]);

     res.status(200).send({ imageUrl: imageUrl, imgId: imgId });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error processing file upload' });
  }
});

app.listen(port, () => console.log("Server is running at port 8080"));

