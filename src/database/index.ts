import { Sequelize } from "sequelize-typescript";

const sequelize = new Sequelize({
  logging: false,
  dialect: "postgres",
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: parseInt(process.env.DB_PORT ?? "5432"),
  models: [__dirname + "/models/*"],
  modelMatch: (filename, member) => {
    return filename.substring(0, filename.indexOf('.model')) === member.toLowerCase();
  },
});

export async function initDatabase() {
  sequelize.authenticate().then(() => {
    console.log("DB connection established");
  });
}
