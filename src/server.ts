import app from "./app";
import { logger } from "./utils/winstonLogger";

const PORT: number = 5050;

app.listen(PORT, () => logger.info(`Starting server on port: ${PORT}`));
