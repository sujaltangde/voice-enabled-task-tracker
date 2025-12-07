import "reflect-metadata";
import { AppDataSource } from "./data-source";
import app from "./app";

const PORT = process.env.PORT || 4000;

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Data Source has been initialized!");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error("❌ Error during Data Source initialization:", err);
    process.exit(1);
  });

