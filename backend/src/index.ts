import dotenv from "dotenv";
import app from "./app.ts";

dotenv.config();

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

server.on("error", (error: any) => {
  if (error.code === "EADDRINUSE") {
    console.error(`[server]: Port ${port} is already in use.`);
  } else {
    console.error(`[server]: An error occurred:`, error);
  }
});