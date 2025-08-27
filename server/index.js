const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const sharp = require("sharp");

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.send("RemoveBG Backend is running!");
});

app.post("/remove-background", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const inputPath = req.file.path;
  const resizedPath = `${inputPath}-resized.png`;
  const bgRemovedPath = `${inputPath}-no-bg.png`;
  const finalPath = `${inputPath}-final.png`;

  const rembgPath = "rembg";

  try {
    // Ambil metadata setelah inputPath ada
    const metadata = await sharp(inputPath).metadata();

    // 1. Resize dulu biar hemat RAM
    await sharp(inputPath)
      .resize({ width: 800 }) // kalau terlalu besar, limit aja ke 800px
      .toFile(resizedPath);

    // 2. Jalankan rembg
    const cmd = `rembg i -a \
    --alpha-matting \
    --alpha-matting-foreground-threshold 240 \
    --alpha-matting-background-threshold 10 \
    --alpha-matting-erode-size 10 \
    --post-process-mask \
    "${resizedPath}" "${bgRemovedPath}"`;

    exec(cmd, async (error) => {
      if (error) {
        console.error("Rembg error:", error);
        return res.status(500).json({ error: "Failed to remove background" });
      }

      try {
        // 3. Perbesar hasil sesuai ukuran asli + haluskan edge
        await sharp(bgRemovedPath)
          .resize({ width: metadata.width })
          .blur(0.3)
          .median(3)
          .toFile(finalPath);

        res.sendFile(path.resolve(finalPath), (err) => {
          if (err) {
            console.error("SendFile error:", err);
          }

          [inputPath, resizedPath, bgRemovedPath, finalPath].forEach((p) => {
            fs.unlink(p, (err) => {
              if (err) console.error("Failed to delete file:", p, err);
            });
          });
        });
      } catch (err) {
        console.error("Sharp error:", err);
        res.status(500).json({ error: "Failed to process final image" });
      }
    });
  } catch (err) {
    console.error("Resize error:", err);
    res.status(500).json({ error: "Failed to resize image" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
