import express, { Express, Request, Response } from "express";
import mysql, { Connection } from "mysql";
import dotenv from "dotenv";

const app: Express = express();
dotenv.config();
const port = 8080;

app.use(express.json());

// Create a connection
const db: Connection = mysql.createConnection({
  host: process.env.DB_HOST, // Docker Compose 파일에 정의된 MySQL 서비스 이름을 사용하십시오.
  user: process.env.MYSQL_USER, // MySQL username
  password: process.env.MYSQL_PASSWORD, // MySQL password
  database: process.env.MYSQL_DATABASE, // Database name
});

// Connect to the database
db.connect((err: any) => {
  if (err) {
    throw err;
  }
  console.log("Connected to the MySQL server.");
});

// Define a route to get some data from the database
app.get("/users", (req: Request, res: Response) => {
  db.query("SELECT * FROM Users", (err, result) => {
    if (err) {
      res.send({ error: err });
    } else {
      res.send({ users: result });
    }
  });
});

/*예시코드 */
//migrations로 데이터베이스 users 테이블 생성
//테이블 기초 세팅
app.post("/users", (req: Request, res: Response) => {
  const user = req.body;

  // Get the current date and time
  const now = new Date();

  const query =
    "INSERT INTO Users (firstName, lastName, email, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)";
  db.query(
    query,
    [user.firstName, user.lastName, user.email, now, now],
    (err, result) => {
      if (err) {
        res.send({ error: err });
      } else {
        res.send({ user: user, result: result });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
