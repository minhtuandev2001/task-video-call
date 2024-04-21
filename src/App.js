import { useState } from 'react';
import './App.css';
import VideoCall from './components/videoCall/VideoCall';

function App() {
  // id phòng và id user , code cũ 
  const [roomId, setRoomId] = useState("main");
  const [uid, setUid] = useState(String(Math.floor(Math.random() * 2032)));
  // end id phòng và id user , code cũ 

  // lấy dữ liệu từ url 
  let url = new URL(window.location.href);
  const roomId1 = url.searchParams.get('roomid');
  const roomIdOwner1 = url.searchParams.get('roomidOwner');
  const uid1 = url.searchParams.get('uid1');
  const acceptMic1 = url.searchParams.get('acceptMic1');
  const acceptCam1 = url.searchParams.get('acceptCam1');
  console.log("check 9 ", roomId1, " ", roomIdOwner1, " ", acceptMic1, " ", acceptCam1, " ", uid1)
  // end lấy dữ liệu từ url 

  return (
    <div className="App">
      {/* component call video , lưu ý tham số  acceptMic acceptCam1 phải là boolen nên phải chuyển về dạng boolean */}
      <VideoCall roomId={roomId1} uid={uid1} roomOwner={roomIdOwner1} acceptMic={JSON.parse(acceptMic1)} acceptCam1={JSON.parse(acceptCam1)} ></VideoCall>
    </div>
  );
}

export default App;
