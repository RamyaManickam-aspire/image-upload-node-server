const express = require("express");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());

let projectId = "gcp-learning-433309";
let keyFilename = process.env.GOOGLE_CREDENTIALS;
const storage = new Storage({
  projectId,
  keyFilename,
});

const bucketName = storage.bucket("upload-node-angular");

const upload = multer({
  storage: multer.memoryStorage(),
});

app.post("/upload", upload.single("file"), async (req, res) => {
  console.log("Made it /upload");
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    console.log("File found, trying to upload...");
    const blob = bucketName.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on("error", (err) => {
      console.error("Stream Error:", err);
      res.status(500).send({ message: err.message });
    });

    blobStream.on("finish", () => {
      console.log("Success");
      res.status(200).send({ message: "File uploaded successfully!" });
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    console.error("Catch Error:", error);
    res.status(500).send({ message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
