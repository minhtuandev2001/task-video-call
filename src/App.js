import { useState } from 'react';
import './App.css';
import VideoCall from './components/videoCall/VideoCall';

function App() {
  const [roomId, setRoomId] = useState("main");
  const [uid, setUid] = useState(String(Math.floor(Math.random() * 2032)));
  return (
    <div className="App">
      <VideoCall roomId={roomId} uid={uid}></VideoCall>
    </div>
  );
}

export default App;
