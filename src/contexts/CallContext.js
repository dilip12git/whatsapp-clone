import React, {
  useContext,
  createContext,
  useEffect,
  useState,
  useRef,
} from "react";
import Peer from "peerjs";
import { useChat } from "./ChatContext";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import useRingTone from "../components/playRingtone";
import axios from "axios";
import { useCallLogs } from "./CallLogsContext";
const context = createContext(null);

const CallContext = ({ children }) => {
  const { user } = useAuth();
  const { socket, selectedChatUserId } = useChat();
  const { notifySuccess, notifyError, notifyWarning } = useToast();
  const { fetchCallHistory } = useCallLogs();

  // State variables
  const [myPeerId, setMyPeerId] = useState("");
  const [incomingCall, setIncomingCall] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [playRingtone, setPlayRingtone] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [callNotAnswered, setCallNotAnswered] = useState(false);
  const [callerDetails, setCallerDetails] = useState({});
  const [currentCallType, setCurrentCallType] = useState(null);
  const [displayDuration, setDisplayDuration] = useState("00:00");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoStatusOfPartner, setVideoStatusOfPartner] = useState(true);
  const [audioStatusOfPartner, setAudioStatusOfPartner] = useState(true);
  const [isMinimize, setMinimize] = useState(false);
  const [onCallClose, setOnCallClose] = useState(false);
  const [callId, setCallId] = useState("");
  const [callStatus, setCallStatus] = useState("");
  const [callEndAt, setCallEndAt] = useState("");
  const [recipientUser, setRecipientUser]=useState({});

  // Refs for streaming and timers
  const currentStream = useRef(null);
  const peerStream = useRef(null);
  const peerRef = useRef(null);
  const timeOut = useRef();
  const startTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const callDurationRef = useRef("00:00");

  useEffect(() => {
    if (user?.userId) {
      const peer = new Peer(user.userId, { secure: true });
      peerRef.current = peer;

      peer.on("open", setMyPeerId);

      peer.on("call", setIncomingCall);

      const handleCallInvitation = ({ from, name, profile, callType }) => {
        setIncomingCall({ from });
        setPlayRingtone(true);
        setCallNotAnswered(false);
        setIsCalling(false);
        setCallerDetails({ userId: from, name, profile, callType });
        fetchCallHistory();
      };

      const handleRecipientDetails = ({ userId, name, profile, callType }) => {
        setCallerDetails({ userId, name, profile, callType });
      };

      const handleCallRejected = () => {
        setCallNotAnswered(true);
        removeStreaming();
        setMinimize(false);
        setIsRinging(false);
        setCallStatus("missed");
        fetchCallHistory();
      };

      const handleCallNotAnswered = () => {
        setIncomingCall(null);
        setPlayRingtone(false);
        setIsRinging(false);
        removeStreaming();
        setCallStatus("missed");
        fetchCallHistory();
      };

      const handleCallEnded = ({ from, to }) => {
        setPlayRingtone(false);
        setIncomingCall(null);
        setIsCalling(false);
        removeStreaming();
        setIsCallActive(false);
        setIsRinging(false);
        notifySuccess("call ended");
        fetchCallHistory();

        if (from && from !== user.userId) {
          const currentDate = new Date().toISOString();
          setCallStatus("completed");
          setCallEndAt(currentDate);
        }
      };

      socket.on("call-invitation", handleCallInvitation);
      socket.on("recipientUser-details", handleRecipientDetails);
      socket.on("call-rejected", handleCallRejected);
      socket.on("call-not-answered", handleCallNotAnswered);
      socket.on("call-ended", handleCallEnded);

      socket.on("call-accepted", () => {
        setIsRinging(false);
        fetchCallHistory();
      });

      socket.on("video-status", ({ status }) =>
        setVideoStatusOfPartner(status)
      );
      socket.on("audio-status", ({ status }) =>
        setAudioStatusOfPartner(status)
      );

      // Cleanup on component unmount
      return () => {
        peer.destroy();
        socket.off("call-invitation", handleCallInvitation);
        socket.off("recipientUser-details", handleRecipientDetails);
        socket.off("call-rejected", handleCallRejected);
        socket.off("call-not-answered", handleCallNotAnswered);
        socket.off("call-ended", handleCallEnded);
        socket.off("call-accepted");
        socket.off("video-status");
        socket.off("audio-status");
        notifySuccess("");
      };
    }
  }, [user, socket]);

  const acceptCall = async (callType) => {
    try {
      clearTimeout(timeOut.current);

      if (!incomingCall) return;

      setPlayRingtone(false);
      setCurrentCallType(callType);

      // Ensure currentStream is set up
      if (!currentStream.current) {
        const mediaConstraints = {
          video: callType === "video",
          audio: true,
        };
        currentStream.current = await navigator.mediaDevices.getUserMedia(
          mediaConstraints
        );
      }

      incomingCall.answer(currentStream.current);
      setIncomingCall(null);

      // Handle remote stream
      incomingCall.on("stream", (remoteStream) => {
        peerStream.current = remoteStream;
        setIsCallActive(true);
        setIsCalling(true);
        setCallNotAnswered(false);
      });

      // Notify the server
      socket.emit("call-accepted", { from: callerDetails.userId, callType });
      fetchCallHistory();

      // Handle call closure
      incomingCall.on("close", () => {
        handleHangUp(myPeerId);
        stopCallTimer();
      });
    } catch (err) {
      console.error("Error in acceptCall:", err.message, err);
      if (["NotAllowedError", "NotFoundError"].includes(err.name)) {
        alert("Please allow access to camera and microphone.");
      }
    }
  };

  const handleHangUp = (id) => {
    let to;
    if (id !== callerDetails.userId) {
      to = callerDetails.userId || selectedChatUserId;
      if (isCallActive) {
        const currentDate = new Date().toISOString();
        setCallStatus("completed");
        setCallEndAt(currentDate);
      } else {
        setCallStatus("missed");
        
      }
    }
    // Notify the remote peer about the hang-up
    socket.emit("call-ended", { from: id, to });
    removeStreaming();
    setIsCallActive(false);
    setIsCalling(false);
    setIsRinging(false);
    setIncomingCall(null);
    stopCallTimer();
    clearTimeout(timeOut.current);
    // notifySuccess("Call ended");
  };

  const rejectCall = () => {
    setIncomingCall(null);
    setPlayRingtone(false);
    setIsRinging(false);
    clearTimeout(timeOut.current);
    socket.emit("call-rejected", { from: callerDetails.userId });
    fetchCallHistory();

  };

  const removeStreaming = () => {
    // Clear timeout and reset peer stream
    clearTimeout(timeOut.current);
    peerStream.current = null;

    // Stop and release local media tracks
    if (currentStream.current) {
      currentStream.current.getTracks().forEach((track) => track.stop());
      currentStream.current = null;
    }
    // Reset media and partner statuses
    setAudioEnabled(true);
    setVideoEnabled(true);
    setAudioStatusOfPartner(true);
    setVideoStatusOfPartner(true);
  };

  const initiateCall = async (recipientUser, callType) => {
    try {
      const { name, profile, userId } = recipientUser;
      setRecipientUser(recipientUser);

      if (isMinimize) {
        setMinimize(false);
        return;
      }

      // Reset call states
      setCallNotAnswered(false);
      setCurrentCallType(callType);
      setAudioEnabled(true);
      setVideoEnabled(true);
      setAudioStatusOfPartner(true);
      setVideoStatusOfPartner(true);
      setMinimize(false);
      setOnCallClose(false);
      setCallEndAt("");
      setCallStatus("");
      setCallId("");

      // Stop and clear existing stream
      if (currentStream.current) {
        currentStream.current.getTracks().forEach((track) => track.stop());
        currentStream.current = null;
      }

      // Determine media constraints
      const mediaConstraints = {
        video: callType === "video" && videoEnabled,
        audio: audioEnabled,
      };

      // Acquire a new media stream
      currentStream.current = await navigator.mediaDevices.getUserMedia(
        mediaConstraints
      );

      // Notify recipient
      socket.emit("call-user", {
        from: myPeerId,
        to: userId,
        name: user.name,
        profile: user.profile,
        callType,
        rName: name,
        rProfile: profile,
      });

      // Initiate the call
      const call = peerRef.current.call(userId, currentStream.current);
      setIsCalling(true);
      setIsRinging(true);

      const callLogsData = {
        callerId: myPeerId,
        receiverId: userId,
        callType,
      };
      storeCallLogs(callLogsData);

      // Set a timeout for unanswered calls
      timeOut.current = setTimeout(() => {
        if (!isCallActive) {
          socket.emit("call-not-answered", { to: userId });
          setCallNotAnswered(true);
          setIsRinging(false);
          removeStreaming();
        }
      }, 30000);

      // Handle remote stream
      call.on("stream", (remoteStream) => {
        peerStream.current = remoteStream;
        setIsCallActive(true);
        clearTimeout(timeOut.current);
      });

      // Handle call closure
      call.on("close", () => {
        handleHangUp(myPeerId);
        clearTimeout(timeOut.current);
        stopCallTimer();
      });
    } catch (err) {
      console.error("Error in initiateCall:", err.message, err);
      if (["NotAllowedError", "NotFoundError"].includes(err.name)) {
        alert("Please allow access to camera and microphone.");
      }
    }
  };

  const toggleVideo = (id) => {
    if (!currentStream.current) return;

    const to =
      id === callerDetails.userId
        ? selectedChatUserId
        : callerDetails.userId || myPeerId;
    const videoTrack = currentStream.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);
      socket.emit("video-status", { to, status: videoTrack.enabled });
    }
  };

  const toggleAudio = (id) => {
    if (!currentStream.current) return;

    const to =
      id === callerDetails.userId
        ? selectedChatUserId
        : callerDetails.userId || myPeerId;
    const audioTrack = currentStream.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
      socket.emit("audio-status", { to, status: audioTrack.enabled });
    }
  };

  const startCallDuration = () => {
    startTimeRef.current = Date.now();

    timerIntervalRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor(
        (Date.now() - startTimeRef.current) / 1000
      );
      const formattedDuration = formatDuration(elapsedSeconds);
      callDurationRef.current = formattedDuration;
      setDisplayDuration(formattedDuration);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    callDurationRef.current = "00:00";
    setDisplayDuration("00:00");
  };

  const formatDuration = (durationInSeconds) => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const storeCallLogs = async (callLogsData) => {
    try {
      if (!callLogsData) {
        notifyError("Reciever data not found");
        return;
      }
      const { callerId, receiverId, callType } = callLogsData;
      const response = await axios.post(
        "http://localhost:5000/call/callhistories/call-logs",
        {
          callerId,
          receiverId,
          callType,
        }
      );
      setCallId(response.data.call._id);
    } catch (error) {
      console.log(
        `Error creating call: ${error.response?.data?.error || error.message}`
      );
    }
  };

  const updateCallLogs = async () => {
    try {
      // console.log("status:", callStatus);
      // console.log("callId:", callId);
      if (!callId && !callStatus) {
        console.log("data not found");
        return;
      }
      const response = await axios.patch(
        "http://localhost:5000/call/update-call-logs",
        {
          id: callId,
          status: callStatus,
          endedAt: callEndAt,
        }
      );

    } catch (error) {
      console.log(
        `Error updating call: ${error.response?.data?.error || error.message}`
      );
    }
  };
  useEffect(() => {
    if (callStatus && callId && callEndAt) updateCallLogs();
  }, [callStatus, callId, callEndAt]);

  useRingTone({ playRingtone, isRinging });

  return (
    <context.Provider
      value={{
        myPeerId,
        currentStream,
        peerStream,
        isCallActive,
        isCalling,
        incomingCall,
        setIsCalling,
        initiateCall,
        acceptCall,
        rejectCall,
        handleHangUp,
        setPlayRingtone,
        setIsRinging,
        callNotAnswered,
        setCallNotAnswered,
        callerDetails,
        currentCallType,
        displayDuration,
        toggleVideo,
        toggleAudio,
        audioEnabled,
        videoEnabled,
        videoStatusOfPartner,
        audioStatusOfPartner,
        isMinimize,
        setMinimize,
        onCallClose,
        setOnCallClose,
        recipientUser
      }}
    >
      {children}
    </context.Provider>
  );
};

export default CallContext;
export const useCall = () => useContext(context);
