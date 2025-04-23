import dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config();

import http from "http";
import SocketService from "./services/socket";
import { startMessageConsumer } from "./services/kafka";

async function init(){
  try {
      startMessageConsumer().catch((err) => {
        console.error("Error running Kafka consumer:", err);
      });
      const socketService = new SocketService();
      const httpServer = http.createServer();
      const PORT = process.env.PORT ? process.env.PORT : 8000;
    
      socketService.io.attach(httpServer);
      httpServer.listen(PORT, () =>
      console.log(`HTTP Server started at PORT:${PORT}`)
    );

      socketService.initListeners();
    } catch (error) {
      console.error("Failed to initialize:",error);
      process.exit(1);
  }
}

init();