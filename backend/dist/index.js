import dotenv from "dotenv";
import app from "./app.js";
dotenv.config();
const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
        console.error(`[server]: Port ${port} is already in use.`);
    }
    else {
        console.error(`[server]: An error occurred:`, error);
    }
});
