const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3010;

// ===== Middleware =====
app.use(cors());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // Serve HLS files

// ===== Config =====
// const RTSP_URL = "rtsp://admin:Hikvision@12@169.254.15.202:554/Streaming/Channels/101/"; //hikvision cam
const RTSP_URL = "rtsp://admin:admin%40123@192.168.1.10:554/cam/realmonitor?channel=1&subtype=0"; //cp-plus cam // pass: admin@123
const HLS_DIR = path.join(__dirname, "public", "api", "stream");

let ffmpegProcess;
let lastSegmentTime = Date.now();

// ===== Setup HLS Directory =====
if (!fs.existsSync(HLS_DIR)) {
  fs.mkdirSync(HLS_DIR, { recursive: true });
} else {
  fs.readdirSync(HLS_DIR).forEach(file => fs.unlinkSync(path.join(HLS_DIR, file)));
}

// ===== Watchdog: Restart FFmpeg if segments stop updating =====
const startWatchdog = () => {
  setInterval(() => {
    const now = Date.now();
    if (now - lastSegmentTime > 10000) { // 10 seconds of inactivity
      console.error("⚠️ Stream inactive for over 10 seconds. Restarting FFmpeg...");
      if (ffmpegProcess) ffmpegProcess.kill("SIGKILL");
      startStreaming();
    }
  }, 5000);
};

// ===== Watch for HLS segment updates =====
const startSegmentWatcher = () => {
  fs.watch(HLS_DIR, (eventType, filename) => {
    if (filename && filename.endsWith(".ts")) {
      lastSegmentTime = Date.now(); // segment written
    }
  });
};

// ===== Start FFmpeg =====
const startStreaming = () => {
  console.log("🚀 Starting FFmpeg to stream RTSP to HLS...");

  const ffmpegCommand = [
    "-i", RTSP_URL,
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-tune", "zerolatency",
    "-g", "15",
    "-hls_time", "1",
    "-hls_list_size", "5",
    "-hls_flags", "delete_segments",
    "-fflags", "nobuffer",
    "-f", "hls",
    path.join(HLS_DIR, "output.m3u8")
  ];

  ffmpegProcess = spawn("ffmpeg", ffmpegCommand);

  ffmpegProcess.stdout.on("data", (data) => {
    console.log(`[FFmpeg]: ${data.toString()}`);
  });

  ffmpegProcess.stderr.on("data", (data) => {
    const msg = data.toString();
    const isError = msg.toLowerCase().includes("error");
    console[isError ? "error" : "log"](`[FFmpeg]: ${msg}`);
  });

  ffmpegProcess.on("close", (code) => {
    console.error(`❌ FFmpeg exited with code ${code}`);
    if (code !== 0) {
      console.log("🔁 Restarting FFmpeg in 10 seconds...");
      setTimeout(startStreaming, 10000);
    }
  });
};

// ===== Clean Exit =====
const handleExit = () => {
  console.log("🛑 Shutting down FFmpeg...");
  if (ffmpegProcess) {
    ffmpegProcess.kill("SIGINT");
  }
  process.exit(0);
};

process.on("SIGINT", handleExit);
process.on("SIGTERM", handleExit);

// ===== Start Everything =====
startStreaming();
startWatchdog();
startSegmentWatcher();

app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});
