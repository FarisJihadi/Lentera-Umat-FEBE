const UserSchema = require("../models/auth");
const DetilUserSchema = require("../models/detilUser");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.userRegistrasi = async (req, res) => {
  try {
    const { username, email, password, role, namaLengkap, pernyataanUrl } =
      req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hashSync(password, salt);
    const userBaru = new UserSchema({
      username,
      email,
      password: hashedPassword,
      role,
    });
    const simpanUser = await userBaru.save();
    const detilUserBaru = new DetilUserSchema({
      detilUid: simpanUser._id,
      namaLengkap: namaLengkap || "",
      fotoProfil: "",
      bio: "",
      linkedinUrl: "",
      instagramUrl: "",
      noWa: "",
      pernyataanUrl: pernyataanUrl || "",
      permohonanBarang: [],
    });

    await detilUserBaru.save();

    res.status(200).json({
      message: "User dan DetilUser berhasil registrasi",
      user: simpanUser,
      detilUser: detilUserBaru,
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      let field = Object.keys(error.keyValue)[0];
      let message = `Data duplikat: ${field} '${error.keyValue[field]}' sudah terdaftar.`;
      if (field === "username") {
        message = "Username ini sudah digunakan. Mohon pilih username lain.";
      } else if (field === "email") {
        message =
          "Email ini sudah terdaftar. Mohon gunakan email lain atau masuk.";
      }
      return res.status(409).json({ message });
    }
    res
      .status(500)
      .json({
        message: "Terjadi kesalahan server saat registrasi.",
        error: error.message,
      });
  }
};

exports.userMasuk = async (req, res) => {
  try {
    const temukanUser = await UserSchema.findOne({
      username: req.body.username,
    });
    if (!temukanUser) {
      return res.status(404).json("User not found!");
    }

    const match = await bcrypt.compare(req.body.password, temukanUser.password);
    if (!match) {
      return res.status(401).json("Wrong credentials!");
    }

    const token = jwt.sign(
      {
        _id: temukanUser._id,
        username: temukanUser.username,
        email: temukanUser.email,
        role: temukanUser.role,
      },
      process.env.SECRET,
      { expiresIn: "3d" }
    );
    const { password, ...info } = temukanUser._doc;
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .status(200)
      .json(info);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.userLogout = async (req, res) => {
  try {
    res
      .clearCookie("token", { sameSite: "none", secure: true })
      .status(200)
      .send("User logged out successfully!");
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.userRefetch = (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Token not found. Please log in." });
  }

  jwt.verify(token, process.env.SECRET, {}, (err, data) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }
    res.status(200).json(data);
  });
};
