const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const crypto = require("crypto");
const PasswordEntry = require("./models/PasswordEntry");
const User = require("./models/User");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/familyvault";
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || "dev-encryption-secret-change-me";
const ENCRYPTION_KEY = crypto.createHash("sha256").update(ENCRYPTION_SECRET).digest();
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "https://family-vault-henna.vercel.app";

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("\u2705 Connected to MongoDB");
  })
  .catch((error) => {
    console.error("\u274c MongoDB connection error", error);
  });

function encryptPassword(plainText) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

function decryptPassword(encryptedValue) {
  const [ivHex, encryptedHex] = encryptedValue.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString("utf8");
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

app.get("/health", (req, res) => {
  res.send("Family Vault API is running");
});

app.get("/", (req, res) => {
  res.send("Family Vault API is running. Use /health to verify service status.");
});

app.get("/pingdb", (req, res) => {
  const state = mongoose.connection.readyState;
  res.json({ status: state === 1 ? "connected" : "disconnected" });
});

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ username, passwordHash });

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create user" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id.toString(), username: user.username }, JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.json({ token });
  } catch (error) {
    return res.status(500).json({ message: "Failed to login user" });
  }
});

app.post("/add", authenticateToken, async (req, res) => {
  const { serviceName, username, password } = req.body;

  if (!serviceName || !username || !password) {
    return res
      .status(400)
      .json({ message: "serviceName, username, and password are required" });
  }

  try {
    const encryptedPassword = encryptPassword(password);
    const entry = await PasswordEntry.create({
      userId: req.user.userId,
      serviceName,
      username,
      encryptedPassword,
    });

    return res.status(201).json({ message: "Password entry added", id: entry._id });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add password entry" });
  }
});

app.get("/retrieve/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid entry ID" });
  }

  try {
    const entry = await PasswordEntry.findOne({ _id: id, userId: req.user.userId });
    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    const decryptedPassword = decryptPassword(entry.encryptedPassword);
    return res.json({
      id: entry._id,
      serviceName: entry.serviceName,
      username: entry.username,
      password: decryptedPassword,
      createdAt: entry.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve password entry" });
  }
});

app.get("/list", authenticateToken, async (req, res) => {
  try {
    const entries = await PasswordEntry.find({ userId: req.user.userId })
      .select("serviceName username createdAt")
      .sort({ createdAt: -1 });

    return res.json(entries);
  } catch (error) {
    return res.status(500).json({ message: "Failed to list password entries" });
  }
});

app.get("/profile", authenticateToken, (req, res) => {
  return res.json({ message: "Protected route access granted", user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
