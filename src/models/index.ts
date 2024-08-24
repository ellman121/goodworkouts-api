import { Sequelize } from "sequelize";

// Import models
import { User } from "./user";

// Export all models
export { User };

// Initilization function
export async function initDatabase() {
  const sequelize = new Sequelize({
    dialect: "postgres",
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: parseInt(process.env.DB_PORT ?? "5432"),
  });

  await sequelize.authenticate();
  console.log("DB connection established");

  sequelize.modelManager.addModel(User);
}
