import React from "react";

function HikvisionStream() {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <img
        src="http://localhost:8080/feed"
        alt="Hikvision Camera Stream"
        style={{
          width: "100%",
          height: "auto",
          backgroundColor: "black",
        }}
      />
    </div>
  );
}

export default HikvisionStream;
