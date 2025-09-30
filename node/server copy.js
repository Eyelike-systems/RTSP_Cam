const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3010;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // Serve static HLS files

const RTSP_URL = "rtsp://admin:Hikvision@12@169.254.15.202:554/Streaming/Channels/101/";
const HLS_DIR = path.join(__dirname, "public", "api", "stream");

// Ensure HLS output directory exists
if (!fs.existsSync(HLS_DIR)) {
  fs.mkdirSync(HLS_DIR, { recursive: true });
}

let ffmpegProcess;

// Function to start FFmpeg process
const startStreaming = () => {
  console.log("Starting FFmpeg to stream RTSP to HLS...");

  const ffmpegCommand = [
    "-i", RTSP_URL, // RTSP input URL
    "-c:v", "libx264", // Use x264 codec for video encoding
    "-preset", "ultrafast", // Minimize encoding latency
    "-tune", "zerolatency", // Optimize for low latency
    "-g", "15", // GOP size
    "-hls_time", "1", // Shorter HLS segments
    "-hls_list_size", "5", // Maintain 5 segments in the playlist
    "-hls_flags", "delete_segments", // Remove old segments
    "-fflags", "nobuffer", // Low-latency processing
    "-f", "hls", // Output format HLS
    path.join(HLS_DIR, "output.m3u8"),
  ];

  ffmpegProcess = spawn("ffmpeg", ffmpegCommand);

  ffmpegProcess.stdout.on("data", (data) => {
    console.log(`[FFmpeg]: ${data}`);
  });

  ffmpegProcess.stderr.on("data", (data) => {
    console.error(`[FFmpeg Error]: ${data}`);
  });

  ffmpegProcess.on("close", (code) => {
    console.error(`FFmpeg process exited with code ${code}`);
    // Restart FFmpeg process if it exits unexpectedly
    if (code !== 0) {
      console.log("Restarting FFmpeg...");
      setTimeout(startStreaming, 10000);
    }
  });
};

// Handle server shutdown gracefully
const handleExit = () => {
  console.log("Shutting down FFmpeg process...");
  if (ffmpegProcess) {
    ffmpegProcess.kill("SIGINT");
  }
  process.exit(0);
};

process.on("SIGINT", handleExit);
process.on("SIGTERM", handleExit);

// Start streaming on server start
startStreaming();

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
