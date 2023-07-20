"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mysql_1 = __importDefault(require("mysql"));
const dotenv_1 = __importDefault(require("dotenv"));
const app = (0, express_1.default)();
dotenv_1.default.config();
const port = 8080;
app.use(express_1.default.json());
// Create a connection
const db = mysql_1.default.createConnection({
  host: process.env.DB_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE, // Database name
});
// Connect to the database
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to the MySQL server.");
});
// Define a route to get some data from the database
app.get("/users", (req, res) => {
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
app.post("/users", (req, res) => {
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
