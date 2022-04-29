const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../index');
const User = require('../database/models/users');
const mongoose = require('../database/dbConection');
const UserService = require('../database/services/users');
const RecipeService = require('../database/services/recipes');

let id;
let token;

describe("test auth api", () => {
  beforeAll(async () => {
    // create a test user: admin/okay
    const password = bcrypt.hashSync("okay", 10);
    await User.create({
      username: "admin",
      password,
    });
  });

  afterAll(async () => {
    await User.deleteMany();
    mongoose.disconnect();
  });

  // test login
  describe("POST/login", () => {
    it("authenticate user and sign him in", async () => {
      // DATA YOU WANT TO SAVE TO DB
      const user = {
        username: "admin",
        password: "okay",
      };

      const res = await request(app).post("/login").send(user);

      token = res.body.accessToken;
      expect(res.statusCode).toEqual(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          accessToken: res.body.accessToken,
          success: true,
          data: expect.objectContaining({
            id: res.body.data.id,
            username: res.body.data.username,
          }),
        })
      );
    });

    it("do not sign him in, password can not be empty", async () => {
      // DATA YOU WANT TO SAVE TO DB
      const user = {
        username: "admin",
      };

      const res = await request(app).post("/login").send(user);

      // login should failed
      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          success: false,
          message: "username or password can not be empty",
        })
      );
    });

    it("do not sign him in,username field can not be empty", async () => {
      // DATA YOU WANT TO SAVE TO DB
      const user = {
        password: "okay",
      };

      const res = await request(app).post("/login").send(user);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          success: false,
          message: "username or password can not be empty",
        })
      );
    });

    it("do not sign him in, username does not exist", async () => {
      // DATA YOU WANT TO SAVE TO DB
      const user = {
        username: "chii",
        password: "okay",
      };
      const res = await request(app).post("/login").send(user);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          success: false,
          message: "Incorrect username or password",
        })
      );
    });

    it("do not sign him in, incorrect password", async () => {
      // DATA YOU WANT TO SAVE TO DB
      const user = {
        username: "admin",
        password: "okay1",
      };

      const res = await request(app).post("/login").send(user);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          success: false,
          message: "Incorrect username or password",
        })
      );
    });

    it("do not sign him in, internal server error", async () => {
      // DATA YOU WANT TO SAVE TO DB
      const user = {
        username: "admin",
        password: "okay",
      };
      jest.spyOn(UserService, "findByUsername").mockRejectedValueOnce(new Error());

      const res = await request(app).post("/login").send(user);
      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual(
        expect.objectContaining({
          success: false,
          message: "login failed.",
        })
      );
    });
  });
});
