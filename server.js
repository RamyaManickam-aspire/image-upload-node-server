const express = require("express");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
let credentialsBase64 = process.env.GOOGLE_CREDENTIALS;
if (credentialsBase64) {
  var credentialsBuffer = Buffer.from(credentialsBase64, "base64");
  var credentials = JSON.parse(credentialsBuffer.toString("utf8"));

  // Initialize the Google Cloud Storage client with the credentials
  storage = new Storage({ credentials });
} else {
  console.error("GOOGLE_CREDENTIALS environment variable is not set.");
  process.exit(1); // Exit if the credentials are not set
}

let projectId = "gcp-learning-433309";

const storage = new Storage({
  projectId,
  credentials,
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
