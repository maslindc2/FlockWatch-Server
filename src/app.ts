import express, { Application, Request, Response, NextFunction } from "express";
import dataRoutes from "./routes/dataRoutes";
import { logger } from "./utils/winstonLogger";
import { DatabaseService } from "./services/DatabaseService";

class App {
    public app: Application;

    constructor() {
        this.app = express();
        this.middleware();

        // Connect to DB
        DatabaseService.connect(process.env.MONGODB_URI!);
    }

    private middleware(): void {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use("/data", dataRoutes);
        this.app.use("/", (req: Request, res: Response, next: NextFunction): void => {
            res.json({ message: "Nothing here but us Chickens" });
        });
    }
}

export { App };
