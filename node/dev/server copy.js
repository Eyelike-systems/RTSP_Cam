const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "100mb" })); // Handle large image payloads
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // Serve static files (e.g., HLS segments)

const RTSP_URL =
  "rtsp://admin:Mk123456@192.168.1.2:554/Streaming/Channels/102/";

const HLS_DIR = path.join(__dirname, "public", "stream");

// Ensure HLS output directory exists
if (!fs.existsSync(HLS_DIR)) {
  fs.mkdirSync(HLS_DIR, { recursive: true });
}

// Function to start FFmpeg process
const startStreaming = () => {
  console.log("Starting FFmpeg to stream RTSP to HLS...");
  const ffmpegCommand = `ffmpeg -i "${RTSP_URL}" -fflags +genpts -hls_time 2 -hls_list_size 5 -hls_flags delete_segments -f hls ${path.join(
    HLS_DIR,
    "output.m3u8"
  )}`;
  const ffmpegProcess = exec(ffmpegCommand);

  ffmpegProcess.stdout.on("data", (data) => {
    console.log(`[FFmpeg]: ${data}`);
  });

  ffmpegProcess.stderr.on("data", (data) => {
    console.error(`[FFmpeg Error]: ${data}`);
  });

  ffmpegProcess.on("close", (code) => {
    console.log(`FFmpeg process exited with code ${code}`);
  });
};

// Start streaming on server start
startStreaming();

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
