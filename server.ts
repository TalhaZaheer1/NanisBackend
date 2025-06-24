import "reflect-metadata";
import { AppDataSource } from "./src/config/data-source";
import app from "./app";

AppDataSource.initialize()
  .then(() => {
    app.listen(3000, () => console.log("Server running on http://localhost:3000"));
  })
  .catch(err => console.error("DB Connection Error:", err));
