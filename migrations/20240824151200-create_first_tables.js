"use strict";

const exampleUser = {
  id: "12345678-1234-1234-1234-123456789abc",
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
      exercises: { type: Sequelize.ARRAY(Sequelize.UUID), allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.dropTable("users");
    queryInterface.dropTable("exercises");
    queryInterface.dropTable("routines");
  },
};
