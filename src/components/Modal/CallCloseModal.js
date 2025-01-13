import React from "react";

//contexts
import { useCall } from "../../contexts/CallContext";
import { useAuth } from "../../contexts/AuthContext";

//css styles
import "./Modal.css";

const CallCloseModal = () => {
  //contexts
  const { handleHangUp, setOnCallClose } = useCall();
  const { user } = useAuth();

  return (
    <div className="Call-Close-modal-container">
        <div className="call-close-info-wrapper">
            <span style={{color:'white',fontSize:'24px',fontWeight:'bold'}}>GChat</span>
            <span style={{color:'white'}}>Are sure you want to end the current call?</span>
        </div>
      <div className="incoming-call-btn-container">
        <button onClick={() => setOnCallClose(false)}>Cancel</button>
        <button onClick={() => handleHangUp(user.userId)}>OK</button>
      </div>
    </div>
  );
};

export default CallCloseModal;
