import React, { useEffect, useState } from 'react'
import "./navbar.css"
import micOn from "../../asset/image/micOn.svg"
import micOff from "../../asset/image/micOff.svg"
import cameraOn from "../../asset/image/cameraOn.svg"
import cameraOff from "../../asset/image/cameraOff.svg"
import btnleave from "../../asset/image/leave.svg"

export default function Navbar({ toggleMic, toggleCamera, leaveRoom }) {
  const [acceptMic, setAcceptMic] = useState(false)
  const [acceptCam, setAcceptCam] = useState(true)
  const handleMic = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        toggleMic();
        setAcceptMic(!acceptMic)
      })
      .catch(() => {
        alert("mic khong su dung duoc")
      })
  }
  const handleCam = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => {
        toggleCamera();
        setAcceptCam(!acceptCam)
      })
      .catch(() => {
        alert("camera khong su dung duoc")
      })
  }
  const handleLeave = () => {
    leaveRoom();
  }
  useEffect(() => {
    console.log("check chay vao day")
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => {
        setAcceptCam(true)
      })
      .catch(() => {
        setAcceptCam(false)
      })
  }, [])
  return (
    <div className='navbar'>
      {acceptMic ?
        <button onClick={handleMic}><img src={micOn} alt="" /></button>
        :
        <button onClick={handleMic}><img src={micOff} alt="" /></button>
      }
      {acceptCam ?
        <button onClick={handleCam}><img src={cameraOn} alt="" /></button>
        :
        <button onClick={handleCam}><img src={cameraOff} alt="" /></button>
      }
      <button onClick={handleLeave}><img src={btnleave} alt="" /></button>
    </div>
  )
}
