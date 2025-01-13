import React, {useState } from "react";

//import icons
import logo from "../../assets/logo/favicon.png";
import NameIcon from "../NameIcon";

//imports react-icons
import {
  IoVideocamOutline,
  IoCloseSharp,
  IoMicOffOutline,
  IoVideocamOffOutline,
  IoMicOutline,
  IoVolumeHighOutline,
  IoVolumeMuteOutline,
} from "react-icons/io5";
import { BsTelephoneFill } from "react-icons/bs";
import { ImPhoneHangUp } from "react-icons/im";
import { TbWindowMaximize, TbWindowMinimize } from "react-icons/tb";

//imports contexts
import { useCall } from "../../contexts/CallContext";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";

//css styles
import "./Modal.css";

//import components
import CallCloseModal from "./CallCloseModal";

const Modal = React.memo(() => {

  //contexts
  const { selectedUser } = useChat();
  const { user } = useAuth();
  const {
    peerStream,
    currentStream,
    handleHangUp,
    setIsCalling,
    isCallActive,
    callNotAnswered,
    setCallNotAnswered,
    initiateCall,
    currentCallType,
    callerDetails,
    displayDuration,
    toggleVideo,
    toggleAudio,
    audioEnabled,
    videoEnabled,
    videoStatusOfPartner,
    audioStatusOfPartner,
    isMinimize,
    setMinimize,
    setOnCallClose,
    onCallClose,
    recipientUser,
  } = useCall();
  const { name, profile } = recipientUser;

  //states
  const [imageError, setImageError] = useState(false);
  const [recipientImageError, setRecipientImageError] = useState(false);
  const [callerImageError, setCallerImageError] = useState(false);
  const [isRemoteAudioOn, setIsRemoteAudioOn] = useState(true);

  const muteRemoteAudio = () => {
    if (peerStream.current) {
      const audioTracks = peerStream.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const isEnabled = audioTracks[0].enabled;
        audioTracks[0].enabled = !isEnabled;
        setIsRemoteAudioOn(!isEnabled);
      }
    }
  };

  return (
    <div
      className={`${
        !isMinimize ? "call-modal-container" : "call-modal-minimize-container"
      }`}
    >
      {onCallClose && (
        <div className="Modal">
          <CallCloseModal />
        </div>
      )}
      {/* Modal Header */}
      <div className="call-modal-header-container">
        {!isMinimize && (
          <div className="call-app-logo-container">
            <img
              src={logo}
              alt="logo"
              loading="lazy"
              className="call-app-logo"
            />
            <span className="call-app-name">GChat</span>
          </div>
        )}
        <div className="call-modal-closer" style={{ cursor: "pointer" }}>
          {!isMinimize ? (
            <TbWindowMinimize
              size={20}
              color="white"
              title="Minimize call"
              onClick={() => setMinimize(true)}
            />
          ) : (
            <TbWindowMaximize
              size={20}
              color="white"
              onClick={() => setMinimize(false)}
              title="Maximize call"
            />
          )}
          {!isMinimize && (
            <IoCloseSharp
              size={26}
              color="white"
              title="End call"
              onClick={() => setOnCallClose(true)}
            />
          )}
        </div>
      </div>

      {/* Modal Call Stream Container */}
      <div className="call-modal-stream-container">
        {currentCallType === "video" && peerStream.current ? (
          <div className="remote-video-container">
            <video
              id="video"
              ref={(videoStream) => {
                if (videoStream && peerStream.current) {
                  videoStream.srcObject = peerStream.current;
                }
              }}
              onClick={() => {
                if (isMinimize) {
                  setMinimize(false);
                }
              }}
              autoPlay
              className="remote-video"
            />

            {!videoStatusOfPartner && (
              <div className="media-turned-off-container">
                {callerDetails.profile && !recipientImageError ? (
                  <img
                    src={callerDetails.profile}
                    className="recipient-picture"
                    alt="Recipient"
                    onError={() => setRecipientImageError(true)}
                    style={{ width: isMinimize ? "25px" : "" }}
                  />
                ) : (
                  <NameIcon name={callerDetails.name} size={60} />
                )}
                <span className="recipient-name">{callerDetails.name}</span>

                <div className="media-status-wrapper">
                  <IoVideocamOffOutline size={16} color="white" />
                  <span className="media-status-txt">Camera is off</span>
                </div>
              </div>
              // </div> siz
            )}
            {!audioStatusOfPartner && (
              <div className="media-status-wrapper media-muted-wapper">
                <IoMicOffOutline size={16} color="white" />
                {!isMinimize && (
                  <span className="media-status-txt">
                    {callerDetails.name}'s is muted
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          // </div>
          // Handling Audio Call
          <div className="remote-audio-placeholder">
            {isCallActive && (
              <div className="recipient-info-wrapper">
                {callerDetails.profile && !callerImageError ? (
                  <img
                    src={callerDetails.profile}
                    className="recipient-picture"
                    alt="Recipient"
                    onError={() => setCallerImageError(true)}
                    style={{ width: isMinimize ? "30px" : "" }}
                  />
                ) : (
                  <NameIcon name={callerDetails.name} size={60} />
                )}
                <span className="recipient-name">{callerDetails.name}</span>
                {!audioStatusOfPartner && (
                  <div className="media-status-wrapper">
                    <IoMicOffOutline size={16} color="white" />
                    <span className="media-status-txt">Muted</span>
                  </div>
                )}
                {isCallActive && (
                  <span style={{ color: "white" }}>{displayDuration}</span>
                )}
              </div>
            )}
            <audio
              id="audio"
              ref={(ref) => {
                if (ref && peerStream.current) {
                  ref.srcObject = peerStream.current;
                  ref.play();
                }
              }}
              controls={false}
              autoPlay
            />
          </div>
        )}

        {/* Local Stream - Audio or Video */}
        <div
          className={`${
            !isCallActive ? "localVideoIfNotActive" : "local-video-container"
          }`}
        >
          {!isCallActive && (
            <div className="recipient-info-wrapper">
              {profile && !imageError ? (
                <img
                  src={profile}
                  className="recipient-picture"
                  alt="Recipient"
                  onError={() => setImageError(true)}
                  style={{ width: isMinimize ? "30px" : "" }}
                />
              ) : isMinimize ? (
                <NameIcon name={name} size={40} />
              ) : (
                <NameIcon name={name} size={80} />
              )}
              <span
                className="recipient-name"
                style={{ fontSize: isMinimize ? "12px" : "" }}
              >
                {name}
              </span>
              {callNotAnswered ? (
                <span
                  className="recipient-desc"
                  style={{ fontSize: isMinimize ? "12px" : "" }}
                >
                  Call was not answered.
                </span>
              ) : (
                <span className="recipient-desc">Calling...</span>
              )}
            </div>
          )}

          {callNotAnswered ? (
            <div
              className="call-not-answered-container"
              style={{
                gap: isMinimize ? "2px" : "",
                marginTop: isMinimize ? "15px" : "",
              }}
            >
              <button
                className={`call-cancel ${
                  isMinimize
                    ? "call-not-ansbtn-if-minimize"
                    : "call-not-answer-btn"
                }`}
                onClick={() => {
                  setCallNotAnswered(false);
                  setIsCalling(false);
                }}
              >
                Cancel
              </button>
              <button
                className={`call-again ${
                  isMinimize
                    ? "call-not-ansbtn-if-minimize"
                    : "call-not-answer-btn"
                }`}
                onClick={() => {
                  setCallNotAnswered(false);
                  initiateCall(selectedUser, currentCallType);
                }}
              >
                {isMinimize ? (
                  <BsTelephoneFill size={10} color="white" />
                ) : (
                  <BsTelephoneFill size={15} color="white" />
                )}

                <span>Call Again</span>
              </button>
            </div>
          ) : (
            !isMinimize && (
              <div>
                {currentStream.current && currentCallType === "video" && (
                  <div
                    className={`${isCallActive ? "local-video-wrapper" : ""}`}
                  >
                    <video
                      id="video"
                      ref={(videoStream) => {
                        if (videoStream) {
                          if (currentStream.current) {
                            videoStream.srcObject = currentStream.current; // Attach the stream
                          } else {
                            console.log("No current stream available.");
                          }
                        }
                      }}
                      autoPlay
                      className={`${
                        !isCallActive ? "isCallNotActive" : "local-video"
                      }`}
                    />
                    {!audioEnabled && (
                      <div
                        className="media-status-wrapper media-muted-wapper"
                        style={{ padding: "5px", top: "3%" }}
                      >
                        <IoMicOffOutline size={16} color="white" />
                      </div>
                    )}
                    {!videoEnabled && isCallActive && (
                      <div
                        className="media-turned-off-container"
                        style={{ background: "#212121" }}
                      >
                        {user.profile && !callerImageError ? (
                          <img
                            src={user.profile}
                            className="recipient-picture"
                            alt="Recipient"
                            onError={() => setCallerImageError(true)}
                            style={{ width: "50px" }}
                          />
                        ) : (
                          <NameIcon name={user.name} size={60} />
                        )}
                        {/* <span className="recipient-name">
                        {user.name}
                      </span> */}

                        <div className="media-status-wrapper">
                          <IoVideocamOffOutline size={11} color="white" />
                          <span
                            className="media-status-txt"
                            style={{ fontSize: "10px" }}
                          >
                            Your camera is off
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          )}
          {/* </div> */}
        </div>
      </div>

      {/* Call Handlers */}
      {!isMinimize && (
        <>
          {!callNotAnswered && (
            <div
              className="call-hanlders-cotainer"
              style={{
                gap: isMinimize ? "5px" : "",
                padding: isMinimize ? "5px" : "",
              }}
            >
              {currentCallType === "video" && (
                <div
                  className={`${
                    !videoEnabled ? "notEnabled-call-handlers" : "call-handlers"
                  }`}
                  onClick={() => toggleVideo(user.userId)}
                >
                  {videoEnabled ? (
                    <IoVideocamOutline
                      size={20}
                      className="call-handlers-icon call-video-icon"
                    />
                  ) : (
                    <IoVideocamOffOutline
                      size={20}
                      className="call-handlers-icon call-video-icon"
                    />
                  )}
                </div>
              )}
              <div
                className={`${
                  !isRemoteAudioOn
                    ? "notEnabled-call-handlers"
                    : "call-handlers"
                }`}
                onClick={muteRemoteAudio}
              >
                {isRemoteAudioOn ? (
                  <IoVolumeHighOutline
                    size={20}
                    className="call-handlers-icon call-mic-icon"
                  />
                ) : (
                  <IoVolumeMuteOutline
                    size={20}
                    className="call-handlers-icon call-mic-icon"
                  />
                )}
              </div>
              <div
                className={`${
                  !audioEnabled ? "notEnabled-call-handlers" : "call-handlers"
                }`}
                onClick={() => toggleAudio(user.userId)}
              >
                {audioEnabled ? (
                  <IoMicOutline
                    size={20}
                    className="call-handlers-icon call-mic-icon"
                  />
                ) : (
                  <IoMicOffOutline
                    size={20}
                    className="call-handlers-icon call-mic-icon"
                  />
                )}
              </div>
              <div
                className="call-handlers call-hangup-handlers"
                onClick={() => handleHangUp(user.userId)}
              >
                <ImPhoneHangUp
                  size={20}
                  className="call-handlers-icon call-hangup-icon"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default Modal;
