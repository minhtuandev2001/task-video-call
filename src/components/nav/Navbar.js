import React, { useEffect, useState } from 'react'
import "./navbar.css"
import micOn from "../../asset/image/micOn.svg"
import micOff from "../../asset/image/micOff.svg"
import cameraOn from "../../asset/image/cameraOn.svg"
import cameraOff from "../../asset/image/cameraOff.svg"
import btnleave from "../../asset/image/leave.svg"
import reaction from "../../asset/image/reaction.svg"

export default function Navbar({ toggleMic, toggleCamera, leaveRoom, sendReaction, acceptMic2, acceptCam1 }) { // 2 đối số liên quan đến camera, mic
  // const [acceptMic, setAcceptMic] = useState(true)
  // const [acceptCam, setAcceptCam] = useState(true)
  const [acceptMic, setAcceptMic] = useState(acceptMic2)
  const [acceptCam, setAcceptCam] = useState(acceptCam1)
  const [mic, setMic] = useState(false)
  const [camera, setCamera] = useState(true)
  const handleMic = () => {
    // check điều kiện từ đối số trả về từ database xem thử
    if (acceptMic) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          toggleMic();
          setMic(!mic)
        })
        .catch(() => {
          alert("mic không sử dụng được")
        })
    } else {
      alert("bạn bị cấm mic")
    }
  }
  const handleCam = () => {
    if (acceptCam) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => {
          toggleCamera();
          setCamera(!camera)
        })
        .catch(() => {
          alert("camera không sử dụng được")
        })
    } else {
      alert("bạn bị cấm sủw dụng camera")
    }
  }
  const handleLeave = () => {
    leaveRoom();
  }
  const handleReaction = () => {
    sendReaction();
  }
  useEffect(() => {
    setCamera(camera)
  }, [camera])
  useEffect(() => { // check lần đầu xem có mở camera được ko
    console.log("check chay vao day")
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => {
        if (acceptCam) {
          setCamera(true)
        } else {
          setCamera(false)
        }
      })
      .catch(() => {
        setCamera(false)
      })
  }, [])
  return (
    <div className='navbar'>
      {mic ?
        <button onClick={handleMic}><img src={micOn} alt="" /></button>
        :
        <button onClick={handleMic}><img src={micOff} alt="" /></button>
      }
      {camera ?
        <button onClick={handleCam}><img src={cameraOn} alt="" /></button>
        :
        <button onClick={handleCam}><img src={cameraOff} alt="" /></button>
      }
      <button onClick={handleLeave}><img src={btnleave} alt="" /></button>
      <button onClick={handleReaction}><img src={reaction} alt="" /></button>
    </div>
  )
}
