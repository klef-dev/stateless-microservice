const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jsonpatch = require("jsonpatch");
const Jimp = require("jimp");
const User = require("../db/User");

module.exports = class AppController {
  // REGISTER A USER
  static async register(request, response) {
    // Destructed incoming request
    let { username, password } = request.body;
    try {
      let user = await User.findOne({ username });
      if (user) {
        return response.status(400).json({
          msg: "Username already exists"
        });
      }
      password = await bcrypt.hash(password, 10);
      try {
        user = await new User({ username, password }).save();
        response.status(201).json({ user });
      } catch (error) {
        response.status(400).json({ msg: "Query error", error });
      }
    } catch (error) {
      response.status(400).json({ msg: "Query error", error });
    }
  }

  //   LOGIN A USER
  static async login(request, response) {
    let { username, password } = request.body;
    try {
      let findUser = await User.findOne({ username });
      if (!findUser) {
        return response.status(404).json({
          msg: "One of your credential is wrong and I won't tell you which one",
          error: true
        });
      }
      const isMatch = await bcrypt.compare(password, findUser.password);
      if (isMatch) {
        const user = {
          id: findUser.id,
          username
        };
        const token = jwt.sign(user, process.env.SECRET, {
          expiresIn: "1h"
        });
        response.json({ token: `Bearer ${token}`, success: true });
      } else {
        response.status(400).json({
          msg: "One of your credential is wrong and I won't tell you which one",
          error: true
        });
      }
    } catch (error) {
      response.status(400).json({ msg: "Query error", error });
    }
  }

  //   MAKING USE OF JSONPATCHER
  static async patch(request, response) {
    let { json, patch } = request.body;

    try {
      let patchedDoc = jsonpatch.apply_patch(json, patch);
      response.send(patchedDoc);
    } catch (error) {
      response.status(400).json({
        msg: "Bad request",
        error
      });
    }
  }

  //   MAKING USE OF JIMP TO RESIZE AND CREATE A THUMBNAIL
  static async thumbnail(request, response) {
    let { url } = request.body;
    try {
      const image = await Jimp.read(url);
      image
        .resize(50, 50)
        .quality(50)
        .write("thumbnail.jpg");
      response.json({
        msg: "Thumbnail successfully created",
        success: true
      });
    } catch (error) {
      response.status(400).json({ error });
    }
  }
};
