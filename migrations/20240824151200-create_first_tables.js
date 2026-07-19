"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const base = {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn("now") },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn("now") },
    };

    const nonNullString = { type: Sequelize.STRING, allowNull: false };

    await queryInterface.createTable("users", {
      ...base,
      username: nonNullString,
      password: nonNullString,
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });

    // Partial index: users are soft-deleted, and a plain unique constraint
    // would let a deleted account block its username forever.
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX "users_username_unique_active"
      ON "users" ("username")
      WHERE "deletedAt" IS NULL;
      `);

    await queryInterface.createTable("exercises", {
      ...base,
      name: nonNullString,
      userId: { type: Sequelize.UUID, allowNull: false },
    });

    await queryInterface.createTable("routines", {
      ...base,
      name: nonNullString,
      userId: { type: Sequelize.UUID, allowNull: false },
      exercises: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: false,
        defaultValue: [],
      },
    });

    await queryInterface.createTable("sets", {
      ...base,
      exerciseId: { type: Sequelize.UUID, allowNull: false },
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE "sets"
      ADD COLUMN "reps" NUMERIC[][2] NOT NULL DEFAULT '{{0,0}}'::numeric[][2];
      `);
  },

  async down(queryInterface, Sequelize) {
    queryInterface.dropTable("users");
    queryInterface.dropTable("exercises");
    queryInterface.dropTable("routines");
    queryInterface.dropTable("sets");
  },
};
