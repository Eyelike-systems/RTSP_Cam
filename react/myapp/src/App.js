import logo from './logo.svg';
import './App.css';
import Rtsp from './Component/Rtsp';
import HikvisionStream from './Component/RtspD';
import VideoPlayer from './Component/RtspD';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {

  const hlsStreamUrl = 'http://localhost:3010/feed.m3u8'; // URL of the HLS stream

  return (
    <>
    {/* <Rtsp /> */}
    {/* <HikvisionStream /> */}
    {/* <VideoPlayer src={hlsStreamUrl} /> */}
  
    <Router>
      <Routes>
        <Route exact path="/" element={<Navigate to="/rtsp" />} />
        <Route exact path="/rtsp" element={<Rtsp />} />
        {/* <Route path="*" element={<PageNotFound />} /> */}
      </Routes>
    </Router>
    </>
  );
}

export default App;
