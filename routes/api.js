const router = require("express").Router();
const passport = require("passport");
const {
  register,
  login,
  patch,
  thumbnail
} = require("../controllers/AppController");

router.post("/register", register);

//Login Route
router.post("/login", login);

//JSONPatch route
router.patch(
  "/jsonpatch",
  passport.authenticate("jwt", {
    session: false
  }),
  patch
);

//Thumbnail route
router.post(
  "/thumbnail",
  passport.authenticate("jwt", {
    session: false
  }),
  thumbnail
);

module.exports = router;
