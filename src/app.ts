import express, { Application, Request, Response, NextFunction } from "express";
import scraperRoutes from "./routes/scraperRoutes";
import { logger } from "./utils/winstonLogger";

const app: Application = express();

app.use(express.json());

app.use("/scraper", scraperRoutes);

app.use("/", (req: Request, res: Response, next: NextFunction): void => {
  res.json({ message: "Nothing here but us Chickens" });
});

export default app;
