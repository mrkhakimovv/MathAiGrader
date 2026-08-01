import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import * as dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { evaluateHomework, analyzeTeacherExamples } from "./src/server/evaluator.ts";

dotenv.config();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set("trust proxy", 1);
  app.use(express.json({ limit: "50mb" }));
  
  // Serve uploaded files statically
  app.use("/uploads", express.static(uploadDir));
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "Siz juda ko'p so'rov yubordingiz. Iltimos, 15 daqiqadan so'ng qayta urining." },
    validate: { xForwardedForHeader: false }
  });

  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Fayl topilmadi" });
    }
    res.json({ url: `/uploads/${req.file.filename}` });
  });

  app.post("/api/grade", limiter, async (req, res) => {
    try {
      const { images, taskReference } = req.body;
      
      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ error: "Image data is required" });
      }

      const formattedImages = images.map((img: any) => {
        const base64Data = img.imageBase64.split(",")[1] || img.imageBase64;
        return {
          imageBase64: base64Data,
          mimeType: img.mimeType
        };
      });
      
      const result = await evaluateHomework(formattedImages, taskReference);
      res.json(result);
    } catch (error: any) {
      console.error("Error evaluating homework:", error);
      const statusCode = error.message && error.message.includes("API kaliti noto'g'ri") ? 401 : 500;
      res.status(statusCode).json({ error: error.message || "Xatolik yuz berdi" });
    }
  });

  app.post("/api/analyze-teacher-examples", limiter, async (req, res) => {
    try {
      const { images } = req.body;
      
      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ error: "Image data is required" });
      }

      const formattedImages = images.map((img: any) => {
        const base64Data = img.imageBase64.split(",")[1] || img.imageBase64;
        return {
          imageBase64: base64Data,
          mimeType: img.mimeType
        };
      });
      
      const result = await analyzeTeacherExamples(formattedImages);
      res.json(result);
    } catch (error: any) {
      console.error("Error analyzing examples:", error);
      const statusCode = error.message && error.message.includes("API kaliti noto'g'ri") ? 401 : 500;
      res.status(statusCode).json({ error: error.message || "Xatolik yuz berdi" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
