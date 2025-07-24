import * as dotenv from "dotenv";
dotenv.config();
process.env.NODE_ENV = "test";
jest.retryTimes(3);