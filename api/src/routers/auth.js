const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

router.post("/register", authController.userRegistrasi);
router.post("/login", authController.userMasuk);
router.get("/logout", authController.userLogout);
router.get("/refetch", authController.userRefetch);

module.exports = router;
