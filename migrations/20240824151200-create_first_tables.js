"use strict";

const exampleUser = {
  id: "6c677a30-e584-43df-a552-b47a7a95a0b4",
  email: "example@test.com",
  username: "exampleUser",
  password: "fakePassword",
};

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

    queryInterface
      .createTable("users", {
        ...base,
        email: nonNullString,
        username: nonNullString,
        password: nonNullString,
        deletedAt: { type: Sequelize.DATE, allowNull: true },
      })
      .then(() => {
        queryInterface.insert(null, "users", exampleUser);
      });

    queryInterface.createTable("exercises", {
      ...base,
      name: nonNullString,
      userId: { type: Sequelize.UUID, allowNull: false },
    });

    queryInterface.createTable("routines", {
      ...base,
      name: nonNullString,
      userId: { type: Sequelize.UUID, allowNull: false },
      exercises: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: false,
        defaultValue: [],
      },
    });

    queryInterface.createTable("sets", {
      ...base,
      exerciseId: { type: Sequelize.UUID, allowNull: false },
      reps: {
        type: Sequelize.ARRAY(Sequelize.ARRAY(Sequelize.NUMBER)),
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.dropTable("users");
    queryInterface.dropTable("exercises");
    queryInterface.dropTable("routines");
    queryInterface.dropTable("sets");
  },
};
