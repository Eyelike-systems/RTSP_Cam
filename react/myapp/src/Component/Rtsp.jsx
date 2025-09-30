import React, { useEffect, useRef, useState } from "react";
import "../App.css";
import Hls from "hls.js"; // Import hls.js for HLS support
import config from "../config";

function Rtsp() {
  const videoRef = useRef(null);
  const cameraContainerRef = useRef(null);
  const [imageDataArray, setImageDataArray] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);


  

  // // Video stream setup using hls.js
  // useEffect(() => {
  //   if (videoRef.current && Hls.isSupported()) {
  //     const hls = new Hls();
  //     hls.loadSource('http://localhost:3000/stream/output.m3u8');
  //     hls.attachMedia(videoRef.current);
  //     hls.on(Hls.Events.MANIFEST_PARSED, function () {
  //       console.log('Manifest loaded');
  //     });
  //   } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
  //     // Safari natively supports HLS
  //     videoRef.current.src = 'http://localhost:3000/stream/output.m3u8';
  //   }
  // }, []);

  useEffect(() => {
    if (videoRef.current && Hls.isSupported()) {
      const hls = new Hls({
        startLevel: -1, // Automatically select the best quality level
        capLevelToPlayerSize: true, // Limit the video quality to the size of the player
        maxMaxBufferLength: 30, // Reduce the maximum buffer size (default is 60)
        maxBufferLength: 10, // Limit buffer length
        maxBufferSize: 50 * 1000 * 1000, // Max buffer size
        bufferStarvationLimit: 2, // Increase this to reduce stalls
        highBufferWatchdogPeriod: 3, // Watchdog to prevent excessive buffering
        lowBufferWatchdogPeriod: 1, // Reduce to reduce startup buffering delay
        liveSyncDuration: 0, // Reduce live sync delay to improve live latency
        liveMaxLatencyDuration: 5, // Limit max latency in seconds
      });
  
      // hls.loadSource('http://localhost:3000/stream/output.m3u8');
      hls.loadSource(`${config.BACKEND_API}/stream/output.m3u8`);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        console.log('Manifest loaded');
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari natively supports HLS
      videoRef.current.src = 'http://localhost:3000/stream/output.m3u8';
    }
  }, []);
  

  return (
    <div className="camera-container" ref={cameraContainerRef}>
      {/* Show live RTSP stream */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        className="camera-feed"
        style={{
          backgroundColor: "black",
          // transform: "scaleX(-1)", // Remove mirror effect
          width: "100vw",
          height: "100vh",
        }}
      />

      
    </div>
  );
}

export default Rtsp;
