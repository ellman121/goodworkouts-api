import { Transaction } from "sequelize";
import { Sequelize } from "sequelize-typescript";

const sequelize = new Sequelize({
  logging: false,
  dialect: "postgres",
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: parseInt(process.env.DB_PORT ?? "5432"),
  models: [__dirname + "/models/*"],
  modelMatch: (filename, member) =>
    filename.substring(0, filename.indexOf(".model")) === member.toLowerCase(),
});

/**
 * @function withTransaction
 * @description Executes the provided `work` function in a transaction which
 * commits at the end or rolls back on any `throw`.
 * @param work Function which will be executed in the transaction context
 */
export async function withTransaction<T>(
  work: (transaction: Transaction) => Promise<T>,
) {
  return await sequelize.transaction(work);
}

export async function initDatabase() {
  await sequelize.authenticate();
  console.log("DB connection established");
}
