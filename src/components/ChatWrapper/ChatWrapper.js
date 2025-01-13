import React, { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";

//icons
import userIcon from "../../assets/icon/user-icon.png";
import logo from "../../assets/logo/favicon.png";

//css styles
import "./ChatWrapper.css";

// import context
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import { useCall } from "../../contexts/CallContext";

// import react-icons
import { PiChatCircleTextLight } from "react-icons/pi";
import { IoSettingsOutline } from "react-icons/io5";
import { TbPhone } from "react-icons/tb";
import { GoPencil } from "react-icons/go";

// import components
import Modal from "../Modal/callModal";
import AcceptCallModal from "../Modal/AcceptCallModal";

const ChatWrapper = () => {
  // contexts
  const { isAuthenticated, user, setAuthenticated } = useAuth();
  const { incomingCall, isCalling, isMinimize } = useCall();

  // hooks
  const navigate = useNavigate();

  // states
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const { selectedChatUserId, selectedUser } = useChat();

  // ref
  const profileWrapperRef = useRef(null);
  const profileToggleRef = useRef(null);

  const handleProfileImageError = (event) => {
    event.target.src = userIcon;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/sign-in", { replace: true });
    }
  }, [user, isAuthenticated]);

  const toggleProfileVisibility = () => {
    setIsProfileVisible((prev) => !prev);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileWrapperRef.current &&
        !profileWrapperRef.current.contains(event.target) &&
        profileToggleRef.current &&
        !profileToggleRef.current.contains(event.target)
      ) {
        setIsProfileVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const logOut = async () => {
    localStorage.removeItem("userData");
    const user = JSON.parse(localStorage.getItem("userData"));
    if (!user) {
      setAuthenticated(false);
      navigate("/sign-in");
    }
  };
  return (
    <div className="chat-wrapper">
      <div className="gchat-header">
        <div className="logo-container">
          <img src={logo} alt="logo" className="gchat-logo" />
        </div>
        <div className="gchat-title-wrapper">
          <span className="gchat-title">GChat</span>
        </div>
      </div>
      <div className="sidebar-and-content-wrapper">
        <div
          className={`gchat-sidebar ${
            selectedChatUserId ? "disable-sidebar" : "gchat-sidebar"
          }`}
        >
          <div className="gchat-icon">
            <div className="logo-container">
              <img src={logo} alt="logo" className="gchat-logo" />
            </div>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "active-icon gchat-sidebar-icon"
                  : "gchat-sidebar-icon"
              }
            >
              <PiChatCircleTextLight
                className="gchat-sidebar-icon-t"
                color="white"
              />
              <span className="gchat-sidebar-icon-title">Chats</span>
            </NavLink>
            <NavLink
              to="/call"
              className={({ isActive }) =>
                isActive
                  ? "active-icon gchat-sidebar-icon"
                  : "gchat-sidebar-icon"
              }
            >
              <TbPhone className="gchat-sidebar-icon-t" color="white" />
              <span className="gchat-sidebar-icon-title">Calls</span>
            </NavLink>
          </div>
          <div className="user-and-setting-icon">
            <NavLink
              to="/setting"
              className={({ isActive }) =>
                isActive
                  ? "active-icon gchat-sidebar-icon"
                  : "gchat-sidebar-icon"
              }
            >
              <IoSettingsOutline
                className="gchat-sidebar-icon-t"
                color="white"
              />
              <span className="gchat-sidebar-icon-title">Settings</span>
            </NavLink>

            <div className="gchat-sidebar-icon gchat-user-profile-icon">
              <img
                className="user-profile"
                src={user ? user.profile : userIcon}
                alt={user.name}
                onError={handleProfileImageError}
                title="Profile"
                onClick={toggleProfileVisibility}
                ref={profileToggleRef}
              />
              <span className="gchat-sidebar-icon-title">Account</span>
              <div
                ref={profileWrapperRef}
                className={`gchat-user-profile-wrapper ${
                  isProfileVisible ? "visible" : "hidden"
                }`}
              >
                <div className="gchat-user-profile">
                  <img
                    className="gchat-user-profile"
                    src={user ? user.profile : userIcon}
                    alt={user.name}
                    onError={handleProfileImageError}
                    title="Profile"
                  />
                  <div className="gchat-edit-profile-icon-wr">
                    <GoPencil color="white" size={16} />
                  </div>
                  <div className="gchat-edit-profile-option-wr">
                    <div className="gchat-edit-profile-optn-item">
                      <span>View image</span>
                    </div>
                    <div
                      className="gchat-edit-profile-optn-item"
                      onClick={() => {
                        navigate("/setting");
                        setIsProfileVisible(false);
                      }}
                    >
                      <span>Change image</span>
                    </div>
                  </div>
                </div>
                <div className="gchat-user-name-wr">
                  <span>{user.name}</span>
                  <div
                    className="gchat-user-edit-icon-wr"
                    onClick={() => {
                      navigate("/setting");
                      setIsProfileVisible(false);
                    }}
                  >
                    <GoPencil color="white" size={16} />
                  </div>
                </div>
                <div className="gchat-user-email-wr">
                  <div className="gchat-user-email-lbl-wr">
                    <small>Email address</small>
                    <button
                      className="gchat-user-profile-change-email-btn"
                      onClick={() => {
                        navigate("/setting");
                        setIsProfileVisible(false);
                      }}
                    >
                      Change
                    </button>
                  </div>
                  <span className="gchat-user-profile-email">{user.email}</span>
                </div>
                <div className="h-line"></div>
                <button
                  className="gchat-user-profile-logout-btn"
                  onClick={logOut}
                >
                  Log out
                </button>
                <p className="lgout-note">
                  After logging out, your chats will remain saved and will not
                  be deleted.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="gchat-outlet">
          <Outlet />
        </div>
      </div>

      {incomingCall && (
        <div className="Incomming-call-Modal">
          <AcceptCallModal />
        </div>
      )}

      {isCalling && !incomingCall && (
        <div className={`${!isMinimize ? "Modal" : "minimize-modal"}`}>
          <Modal />
        </div>
      )}
    </div>
  );
};

export default ChatWrapper;
