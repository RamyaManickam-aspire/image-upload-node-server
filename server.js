const express = require("express");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());

// Initialize Secret Manager Client
const secretClient = new SecretManagerServiceClient();

// Function to access the secret
async function getCredentials() {
  const [version] = await secretClient.accessSecretVersion({
    name: "projects/gcp-learning-433309/secrets/my-credentials/versions/latest", // Replace with your secret name
  });
  const payload = version.payload.data.toString("utf8");
  return JSON.parse(payload);
}

// Function to initialize Google Cloud Storage with credentials from Secret Manager
async function initializeStorage() {
  const credentials = await getCredentials();
  const storage = new Storage({
    projectId: "gcp-learning-433309",
    credentials,
  });
  return storage.bucket("upload-node-angular");
}

// Multer setup to store file in memory
const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory for quick access
});

app.post("/upload", upload.single("file"), async (req, res) => {
  console.log("Made it /upload");
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const bucket = await initializeStorage();
    console.log("File found, trying to upload...");

    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on("error", (err) => {
      console.error("Stream Error:", err); // Log the error
      res.status(500).send({ message: err.message });
    });

    blobStream.on("finish", () => {
      console.log("Success");
      res.status(200).send({ message: "File uploaded successfully!" });
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    console.error("Catch Error:", error); // Log the error
    res.status(500).send({ message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
