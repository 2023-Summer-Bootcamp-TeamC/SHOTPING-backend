import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import logger from "./logger";

dotenv.config();

const MYSQL_HOST = process.env.MYSQL_HOST as string;
const MYSQL_USER = process.env.MYSQL_USER as string;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD as string;
const MYSQL_DATABASE = process.env.MYSQL_DATABASE as string;

const sequelize = new Sequelize(MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, {
  host: MYSQL_HOST,
  dialect: "mysql",
  logging: false,
});

sequelize
  .authenticate()
  .then(() => logger.info('Connection to the database has been established successfully.'))
  .catch(err => logger.error('Unable to connect to the database:', err));

export default sequelize;
