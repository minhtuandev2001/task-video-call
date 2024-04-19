import React, { useEffect, useRef, useState } from 'react'
import "./videoCall.css"
import Navbar from '../nav/Navbar'
import micOff from "../../asset/image/micOff.svg"
import micTalk from "../../asset/image/micTalk.svg"
import micOn from "../../asset/image/micOn.svg"
import cameraOn from "../../asset/image/cameraOn.svg"
import cameraOff from "../../asset/image/cameraOff.svg"

import AgoraRTC from 'agora-rtc-sdk-ng'
import AgoraRTM from "agora-rtm-sdk"

export default function VideoCall({ roomId, uid }) { // trong này cần id của chủ phòng 
  let config = {
    appid: 'ebc53ce9f18e46a1a04354d539f5f105',
    token: null,
  }
  let localTracks = {
    audioTrack: null,
    videoTrack: null,
  }
  let remoteTracks = {}
  let rtcClient;

  let channel;
  let rtmClient;

  // state 
  const videosRef = useRef(null);
  const micMuted = useRef(true);
  const cameraActive = useRef(true);
  const micCanUse = useRef(true);
  const cameraCanUse = useRef(true);
  const buttonCameraRef = useRef(null);

  // xử lý
  const initRtm = async () => {
    rtmClient = AgoraRTM.createInstance(config.appid)
    await rtmClient.login({ 'uid': uid, 'token': config.token })

    rtmClient.addOrUpdateLocalUserAttributes({
      'name': uid,
      'userRtcUid': uid.toString(),
      'avatar': 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?q=80&w=1336&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    })

    channel = rtmClient.createChannel(roomId)
    await channel.join()
    getChannelMembers()

    channel.on("ChannelMessage", (message, peerId) => {
      console.log("message :", message)
      console.log("peerId :", peerId)
      // handleInsertMess(message, peerId)
    })
    window.addEventListener('beforeunload', leaveRtmChannel)
    channel.on('MemberJoined', handleMemberJoined)
    channel.on('MemberLeft', handleMemberLeft)
  }


  const initRtc = async () => {
    rtcClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }) // create client rtc

    // event
    // rtcClient.on('user-joined', handleUserJoined)
    rtcClient.on("user-published", handleUserPublished)
    rtcClient.on("user-unpublished", handleUserUnPublished)
    rtcClient.on("user-left", handleUserLeft);

    await rtcClient.join(config.appid, roomId, config.token, uid)// connect to room

    // xuat ban - publish
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(async function (stream) {
          localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          localTracks.audioTrack.setMuted(micMuted.current) // mặc định mic ban đầu
          await rtcClient.publish([localTracks.audioTrack])
          initVolumeIndicator();
        })
        .catch(function (err0r) {
          micCanUse.current = false;
          console.log("khong the su dung mic");
        });
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(async function (stream) {
          localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack()
          let userVideo = `<div class="video-wrapper" id="user-${uid}">
        <div class="video-display" id="stream-${uid}">
        </div>
        <div class="video-desc">
            <div class="">
            <button>1</button>
            </div>
            <p>${uid} owner </p>
            </div>
            </div>`
          // <button class="user-rtc-${uid}" id="button-${uid}" ><img id="${uid}" src=${micOff} alt="" /></button>
          videosRef.current.insertAdjacentHTML('afterbegin', userVideo)
          localTracks.videoTrack.play(`stream-${uid}`)
          await rtcClient.publish([localTracks.videoTrack])
          // camera không bật chỗ trống được tạo trước
        })
        .catch(function (error) {
          cameraCanUse.current = false;
          console.log("khong the su dung camera ");
          let userVideo = `<div class="video-wrapper" id="user-${uid}">
          <img class='avatar' src="https://images.unsplash.com/photo-1712569490441-0c7cc00e6768?q=80&w=1036&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
          <div class="video-desc">
            <div class="">
            <button>1</button>
            </div>
            <p>${uid} owner ko camera</p>
            </div>
            </div>`
          // <button class="user-rtc-${uid}" id="button-${uid}" ><img id="${uid}" src=${micOff} alt="" /></button>
          videosRef.current.insertAdjacentHTML('afterbegin', userVideo)
        });
    }
  }
  const enterRoom = async () => {
    await initRtm();
    await initRtc()
  }

  function handleToogleMicMemeber(id) {
    console.log("check e", id)
  }
  function handleToogleCameraMemeber(id) {
    console.log("check e", id)
  }
  let handleMemberJoined = async (MemberId) => {
    const { name, userRtcUid, avatar } = await rtmClient.getUserAttributesByKeys(MemberId, ['name', 'userRtcUid', 'avatar'])
    let userVideo = `<div class="video-wrapper" id="user-${MemberId}">
          <img class='avatar' src=${avatar} alt="" />
          <div class="video-desc">
            <div class="">
            <button class="user-rtc-${MemberId}" id="button-${MemberId}" ><img src=${micOff} alt="" /></button>
            <button class="user-rtc-camera-${MemberId}" id="button-camera-${MemberId}" ><img src=${cameraOff} alt="" /></button>
            </div>
            <p>${MemberId} tham gia</p> 
          </div>
          </div>`
    // check chủ phòng afterbegin
    videosRef.current.insertAdjacentHTML('beforeend', userVideo)
    let buttonMicUser = videosRef.current.querySelector(`#button-${MemberId}`);
    let buttonCamUser = videosRef.current.querySelector(`#button-camera-${MemberId}`);
    if (buttonMicUser) {
      buttonMicUser.addEventListener('click', (e) => {
        handleToogleMicMemeber(MemberId)
      })
    }
    if (buttonCamUser) {
      buttonCamUser.addEventListener('click', (e) => {
        handleToogleCameraMemeber(MemberId)
      })
    }
  }
  let getChannelMembers = async () => {
    let members = await channel.getMembers()
    for (let i = 0; members.length > i; i++) {
      if (members[i] !== uid) {
        const { name, userRtcUid, avatar } = await rtmClient.getUserAttributesByKeys(members[i], ['name', 'userRtcUid', 'avatar'])
        let newMember = `<div class="video-wrapper" id="user-${members[i]}">
        <img class='avatar' src=${avatar} alt="" />
        <div class="video-desc">
          <div class="">
          <button class="user-rtc-${members[i]}" id="button-${members[i]}" ><img src=${micOff} alt="" /></button>
          <button class="user-rtc-camera-${members[i]}" id="button-camera-${members[i]}" ><img src=${cameraOff} alt="" /></button>
          </div>
          <p>${members[i]} tham gia</p> 
        </div>
        </div>`
        videosRef.current.insertAdjacentHTML('beforeend', newMember)
      }
    }
  }
  // const handleUserJoined = async (user) => {
  //   console.log("check 1", name)
  //   console.log("check 1", userRtcUid)
  //   console.log("check 1", avatar)
  //   // trường hợp giành cho 2 trình duyệt khác nhau dùng 1 camera 
  //   let userVideo = `<div class="video-wrapper" id="user-${user.uid}">
  //         <img class='avatar' src=${avatar} alt="" />
  //         <div class="video-desc">
  //           <div class="">
  //           <button class="user-rtc-${user.uid}" id="button-${user.uid}" ><img src=${micOff} alt="" /></button>
  //           <button class="user-rtc-camera-${user.uid}" id="button-camera-${user.uid}" ><img src=${cameraOff} alt="" /></button>
  //           </div>
  //           <p>${user.uid} tham gia</p> 
  //         </div>
  //         </div>`
  //   // check chủ phòng afterbegin
  //   videosRef.current.insertAdjacentHTML('beforeend', userVideo)
  //   let buttonMicUser = videosRef.current.querySelector(`#button-${user.uid}`);
  //   let buttonCamUser = videosRef.current.querySelector(`#button-camera-${user.uid}`);
  //   if (buttonMicUser) {
  //     buttonMicUser.addEventListener('click', (e) => {
  //       handleToogleMicMemeber(user.uid)
  //     })
  //   }
  //   if (buttonCamUser) {
  //     buttonCamUser.addEventListener('click', (e) => {
  //       handleToogleCameraMemeber(user.uid)
  //     })
  //   }
  // }
  const handleUserPublished = async (user, mediaType) => {
    console.log("check 2")
    await rtcClient.subscribe(user, mediaType)
    remoteTracks[user.uid] = [user.audioTrack, user.videoTrack];
    console.log("can", user)
    if (mediaType === 'video') {
      const userElement = videosRef.current.querySelector(`#user-${user.uid}`);
      if (userElement) { // đã vào rồi mà tắt camera
        userElement.innerHTML = `<div class="video-display" id="stream-${user.uid}">
        </div>
        <div class="video-desc">
            <div class="">
            <button class="user-rtc-${user.uid}" id="button-${user.uid}" ><img src=${micOff} alt="" /></button>
            <button class="user-rtc-camera-${user.uid}" id="button-camera-${user.uid}" ><img src=${cameraOn} alt="" /></button>
            </div>
            <p>${user.uid} client co camera</p>
          </div>`
      } else { // vào lần đầu tiên 
        let userVideo = `<div class="video-wrapper" id="user-${user.uid}">
        <div class="video-display" id="stream-${user.uid}">
        </div>
        <div class="video-desc">
            <div class="">
            <button class="user-rtc-${user.uid}" id="button-${user.uid}" ><img src=${micOff} alt="" /></button>
            <button class="user-rtc-camera-${user.uid}" id="button-camera-${user.uid}" ><img src=${cameraOn} alt="" /></button>
            </div>
            <p>${user.uid} owner </p>
          </div>
        </div>`
        // trường hợp trình duyệt 1 ko dùng cam, trình duyệt thứ 2 vào và 
        // check chủ phòng
        videosRef.current.insertAdjacentHTML('beforeend', userVideo)
      }
      let buttonMicUser = videosRef.current.querySelector(`#button-${user.uid}`);
      let buttonCamUser = videosRef.current.querySelector(`#button-camera-${user.uid}`);
      if (buttonMicUser) {
        buttonMicUser.addEventListener('click', (e) => {
          handleToogleMicMemeber(user.uid)
        })
      }
      if (buttonCamUser) {
        buttonCamUser.addEventListener('click', (e) => {
          handleToogleCameraMemeber(user.uid)
        })
      }
      user.videoTrack.play(`stream-${user.uid}`)
    }
    if (mediaType === 'audio') {
      user._audioTrack.play();
    }
  }
  const handleUserUnPublished = async (user, mediaType) => {
    const { name, userRtcUid, avatar } = await rtmClient.getUserAttributesByKeys(user.uid, ['name', 'userRtcUid', 'avatar'])
    if (mediaType === 'video') {
      const userElement = videosRef.current.querySelector(`#user-${user.uid}`);
      if (userElement) {
        userElement.innerHTML = `<img class='avatar' src=${avatar} alt="" />
        <div class="video-desc">
          <div class="">
          <button class="user-rtc-${user.uid}" id="button-${user.uid}" ><img src=${micOff} alt="" /></button>
          <button class="user-rtc-camera-${user.uid}" id="button-camera-${user.uid}" ><img src=${cameraOff} alt="" /></button>
          </div>
          <p>${user.uid} đã tắt camera</p>
          </div>
          </div>`
      }
    }
    if (mediaType === 'audio') {
      const buttonMicUser = videosRef.current.querySelector(`#button-${user.uid}`);
      if (buttonMicUser) {
        buttonMicUser.innerHTML = `<img src=${micOff} alt="" />`
      }
    }
  }
  let handleUserLeft = async (user) => {
    console.log("check 1 2 3")
    delete remoteTracks[user.uid];
  }
  let handleMemberLeft = async (MemberId) => {
    const userElement = videosRef.current.querySelector(`#user-${MemberId}`);
    if (userElement) {
      userElement.remove();
    }
    console.log("check 7 8 9")
  }

  let leaveRtmChannel = async () => {
    await channel.leave();
    await rtmClient.logout();
  }
  const leaveRoom = async () => {
    const userElement = videosRef.current.querySelector(`#user-${uid}`);
    if (userElement) {
      userElement.remove();
    }
    //2 ngừng xuất bản và rời khỏi kênh 
    rtcClient.unpublish()
    rtcClient.leave()

    leaveRtmChannel();
    videosRef.current.innerHTML = ''
    // chuyển hướng đến trang khác 
  }

  const initVolumeIndicator = async () => {
    AgoraRTC.setParameter("AUDIO_VOLUME_INDICATION_INTERVAL", 200);
    rtcClient.enableAudioVolumeIndicator();

    rtcClient.on("volume-indicator", volumes => {
      volumes.forEach(volume => {
        try {
          let item = videosRef.current.getElementsByClassName(`user-rtc-${volume.uid}`)[0];
          if (item) {
            if (volume.level > 50) {
              console.log("check ", item)
              item.innerHTML = `<img src=${micTalk} alt="" />`
            } else if (volume.level > 0 && volume.level < 50) {
              console.log("check ", volume.level)
              console.log("check ", item)
              item.innerHTML = `<img src=${micOn} alt="" />`
            }
          }
        } catch (error) {
          console.log(error)
        }
      })
    })
  }
  const toggleMic = async () => {
    // mount component thì sẽ lấy data phòng , trong đó có cho mở mic ko 
    if (micCanUse.current) {
      if (micMuted.current) {
        // e.target.innerHTML = "mic off"
        micMuted.current = false
      } else {
        // e.target.innerHTML = "mic on"
        micMuted.current = true
      }
      await localTracks.audioTrack.setMuted(micMuted.current)
    } else {
      alert("mic khong su dung duoc")
    }
  }
  const toggleCamera = async (e) => {
    // mount component thì sẽ lấy data phòng , trong đó có cho mở camera ko 
    if (cameraCanUse.current) {
      if (cameraActive.current) { // tắt camera
        stopVideo()
      } else {
        startVideo();
      }
    } else {
      alert("Camera khong su dung duoc")
    }
  }
  const stopVideo = async () => {
    // nhớ lấy avatar của tài khoản này thay vào 
    if (cameraActive.current === true) {
      const userElement = videosRef.current.querySelector(`#user-${uid}`);
      if (userElement) {
        userElement.innerHTML = `<img class='avatar' src="https://images.unsplash.com/photo-1712569490441-0c7cc00e6768?q=80&w=1036&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
        <div class="video-desc">
          <div class="">
          <button>1</button>
          </div>
          <p>${uid} owner tắt camera</p>
          </div>
          </div>`
      }
      await rtcClient.unpublish([localTracks.videoTrack])
      cameraActive.current = false;
    }
  }
  const startVideo = async () => {
    if (cameraActive.current === false) {
      const userElement = videosRef.current.querySelector(`#user-${uid}`);
      if (userElement) {
        userElement.innerHTML = `<div class="video-display" id="stream-${uid}">
        </div>
        <div class="video-desc">
            <div class="">
            <button>1</button>
            </div>
            <p>${uid} owner </p>
            </div>
            </div>`
        localTracks.videoTrack.play(`stream-${uid}`)
      }
      await rtcClient.publish([localTracks.videoTrack])
      cameraActive.current = true;
    }
  }
  useEffect(() => {
    enterRoom()
    return () => {
      leaveRoom();
    }
  }, [])
  return (
    <div className="video-call">
      <Navbar toggleMic={toggleMic} toggleCamera={toggleCamera} leaveRoom={leaveRoom}></Navbar>
      <div className='video'>
        {/* <div className="video-owner video-wrapper">
          <img className='avatar' src="https://images.unsplash.com/photo-1712569490441-0c7cc00e6768?q=80&w=1036&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
          <div className="video-desc">
            <div className="">
              <button>1</button>
              <button>1</button>
            </div>
            <p>tuan</p>
          </div>
        </div> */}
        <div className="list-video" ref={videosRef}>
          {/* <div className="video-item video-wrapper"></div> */}
        </div>
      </div>
    </div>
  )
}
