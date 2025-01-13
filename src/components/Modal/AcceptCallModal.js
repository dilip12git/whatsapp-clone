import React, { useState } from "react";

// import contexts
import { useCall } from "../../contexts/CallContext";

// css style
import "./Modal.css";
//icons
import NameIcon from "../NameIcon";

//react-icons
import { ImPhoneHangUp } from "react-icons/im";
import { BsTelephoneFill } from "react-icons/bs";

const AcceptCallModal = () => {
  //context
  const { acceptCall, callerDetails, rejectCall } = useCall();
  const { name, profile, callType } = callerDetails;

  //states
  const [imageError, setImageError] = useState(false);

  return (
    <div className="AcceptCall-modal-container">
      <div className="caller-info-wrapper">
        {profile && !imageError ? (
          <img
            src={profile}
            className="caller-picture"
            alt="Recipient"
            onError={() => setImageError(true)}
          />
        ) : (
          <NameIcon name={name} size={50} />
        )}
        <div className="caller-info">
          <span className="caller-name">{name}</span>
          <span className="caller-desc">is requesting {callType} call... </span>
        </div>
      </div>
      <div className="incoming-call-btn-container">
        <button onClick={rejectCall}>
          <ImPhoneHangUp size={20} color="white" />
          <span>Decline</span>
        </button>
        <button onClick={() => acceptCall(callType)}>
          <BsTelephoneFill size={16} color="white" />
          <span>Accept</span>
        </button>
      </div>
    </div>
  );
};

export default AcceptCallModal;
