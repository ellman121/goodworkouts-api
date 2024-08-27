"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface
      .createTable("users", {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
        },
        email: { type: Sequelize.STRING, allowNull: false },
        username: { type: Sequelize.STRING, allowNull: false },
        password: { type: Sequelize.STRING, allowNull: false },
        createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn("now") },
        updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn("now") },
      })
      .then(() => {
        queryInterface.insert(null, "users", {
          id: "12345678-1234-1234-1234-123456789abc",
          email: "example@test.com",
          username: "exampleUser",
          password: "fakePassword",
        });
      });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.dropTable("users");
  },
};
