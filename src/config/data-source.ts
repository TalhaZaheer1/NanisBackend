import { DataSource } from "typeorm";
import { User } from "../entities/User";
import dotenv from "dotenv";
import { Conversation } from "../entities/Conversation";
import { Message } from "../entities/Message";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true, // use migrations in production
  logging: false,
  entities: [User,Conversation,Message],
});

const userRepo = AppDataSource.getRepository(User);
const conversationRepo = AppDataSource.getRepository(Conversation);
const messageRepo = AppDataSource.getRepository(Message);

export {
  userRepo,
  conversationRepo,
  messageRepo
}

