import React, { useEffect, useState, useRef } from "react";

//import contexts
import { useCallLogs } from "../../contexts/CallLogsContext";
import { useAuth } from "../../contexts/AuthContext";
import { useCall } from "../../contexts/CallContext";
import { useChat } from "../../contexts/ChatContext";
import { useToast } from "../../contexts/ToastContext";

//icons component
import NameIcon from "../NameIcon";

//css style
import "./call.css";
import "../Modal/Modal.css";

//react-icons
import { IoSearchOutline, IoVideocamOutline } from "react-icons/io5";
import { MdOutlineHistory, MdBlock, MdArrowLeft } from "react-icons/md";
import { TbPhonePlus, TbPhone, TbTrash } from "react-icons/tb";
import { RiArrowRightUpLine, RiArrowLeftDownLine } from "react-icons/ri";
import { CiSearch } from "react-icons/ci";
import { IoMdArrowBack } from "react-icons/io";

const Call = () => {
  //context
  const { callHistory, fetchCallHistory, deleteCallLog, deleteAllCallLogs } =
    useCallLogs();
  const { initiateCall } = useCall();
  const { chatList, fetchChatsLists, fetchBlockedUsers, blockUser } = useChat();
  const { user } = useAuth();
  const { notifyWarning } = useToast();
  //states
  const [isProfileError, setProfileError] = useState(false);
  const [isOpenLogsProfileError, setOpenLogsProfileError] = useState(false);
  const [isCallLogsOpen, setIsCallLogsOpen] = useState(false);
  const [isUserContactListOpen, setUserContactListOpen] = useState(false);
  const [isUserBlocked, setIsUserBlocked] = useState(false);
  const [isBlockedMe, setIsblockedByMe] = useState(false);
  const [isCallHistoryDeleting, setIsCallHistoryDeleting] = useState(false);

  const [selectedCallLogs, setSelectedCallLogs] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCallLogs, setSearchCallLogs] = useState("");
  //ref
  const containerRef = useRef(null);

  //useEffects

  useEffect(() => {
    const fetchBlockedStatus = async () => {
      if (user?.userId && selectedCallLogs?.recipient?.userId) {
        const currentUserId = user.userId;
        const selectedUserId = selectedCallLogs.recipient.userId;

        const userBlockedList = await fetchBlockedUsers(currentUserId);
        const selectedUserBlockedList = await fetchBlockedUsers(selectedUserId);

        setIsblockedByMe(userBlockedList.includes(selectedUserId));
        setIsUserBlocked(selectedUserBlockedList.includes(currentUserId));
      }
    };

    fetchBlockedStatus();
  }, [user, selectedCallLogs]);

  useEffect(() => {
    fetchCallHistory();
    fetchChatsLists();
  }, [user]);

  useEffect(() => {
    if (selectedCallLogs && selectedCallLogs.recipient) {
      setIsCallLogsOpen(true);
    }
  }, [selectedCallLogs]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setUserContactListOpen(false);
        setSearchQuery("");
      }
    };

    if (isUserContactListOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserContactListOpen]);

  const openCallLogs = (logs) => {
    setSelectedCallLogs(logs);
  };
  const clearCallLogs = () => {
    console.log("Cleared");
  };
  const clearCallHistory = () => {
    console.log("Cleared");
  };

  const getFormattedDate = (dateString) => {
    const callDate = new Date(dateString);
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

    if (callDate >= startOfWeek && callDate <= endOfWeek) {
      return callDate.toLocaleDateString("en-US", { weekday: "long" });
    }

    return callDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getFormattedTime = (startedAt) => {
    const date = new Date(startedAt);
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  // Helper to format call date or time
  const getFormattedCallDate = (startedAt) => {
    const callDate = new Date(startedAt);
    const today = new Date();

    const isToday =
      callDate.getDate() === today.getDate() &&
      callDate.getMonth() === today.getMonth() &&
      callDate.getFullYear() === today.getFullYear();

    return isToday
      ? callDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : callDate.toLocaleDateString();
  };

  const calculateDuration = (startedAt, endedAt) => {
    const start = new Date(startedAt);
    const end = new Date(endedAt);
    let seconds = Math.floor((end - start) / 1000);
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    const durationParts = [];

    if (hours > 0) durationParts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    if (minutes > 0)
      durationParts.push(`${minutes} min${minutes > 1 ? "s" : ""}`);
    if (seconds > 0)
      durationParts.push(`${seconds} sec${seconds > 1 ? "s" : ""}`);
    return durationParts.join(", ");
  };

  // Helper to render call status
  const renderCallStatus = (call) => {
    const isMissed = call.status === "missed";
    const isIncomming = call.callDirection === "incoming";
    const Icon = isIncomming ? RiArrowLeftDownLine : RiArrowRightUpLine;

    return (
      <div className="call-status">
        <Icon
          size={14}
          style={{
            color: isIncomming && isMissed ? "rgb(255, 152, 152)" : "lightgrey",
          }}
        />
        <span
          style={{
            color: isIncomming && isMissed ? "rgb(255, 152, 152)" : "lightgrey",
          }}
        >
          {isIncomming
            ? isMissed
              ? `Missed ${call.callType} call`
              : `Incoming ${call.callType} call`
            : `Outgoing ${call.callType} call`}
        </span>
      </div>
    );
  };

  //Helper to render call cantact list
  const renderContactList = () => {
    const performSearchOnContact = chatList.filter(({ userDetail }) =>
      userDetail?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <>
        <span className="user-contact-list-title">New call</span>
        <div className="chat-search-wrapper">
          <CiSearch className="chat-search-icon" />
          <input
            type="text"
            placeholder="Search"
            className="chat-search-box"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="user-contact-list">
          {performSearchOnContact.length > 0 ? (
            performSearchOnContact.map(({ userDetail }, index) => (
              <div key={index} className="user-contact-list-item">
                {!isOpenLogsProfileError ? (
                  <img
                    src={userDetail?.profile}
                    alt="Participant Profile"
                    loading="lazy"
                    onError={() => setOpenLogsProfileError(true)}
                    className="call-logs-user-contact-profile"
                  />
                ) : (
                  <NameIcon name={userDetail?.name} size={30} />
                )}
                <span
                  className="call-logs-caller-name"
                  style={{ fontSize: "15px" }}
                >
                  {userDetail?.name}
                </span>
                <div className="contact-list-call-media">
                  <div
                    className="media-icon-wrapper"
                    onClick={() => initiateCall(userDetail, "audio")}
                    title="Audio call"
                  >
                    <TbPhone size={18} color="#01a066" />
                  </div>
                  <div
                    className="media-icon-wrapper"
                    onClick={() => initiateCall(userDetail, "video")}
                    title="Video call"
                  >
                    <IoVideocamOutline size={20} color="#01a066" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "grey", textAlign: "center" }}>
              No contact list found.
            </p>
          )}
        </div>
      </>
    );
  };

  const renderCallHistory = () => {
    const performSearchOnCallHistory = callHistory.filter(({ recipient }) =>
      recipient.name.toLowerCase().includes(searchCallLogs.toLocaleLowerCase())
    );
    return (
      <>
        {performSearchOnCallHistory.length > 0 ? (
          performSearchOnCallHistory.map((call, index) => {
            const isActive = call._id === selectedCallLogs?._id;

            return (
              <div
                key={index}
                className={`call-logs-list-item ${
                  isActive ? "call-logs-list-item-active" : ""
                }`}
                onClick={() => openCallLogs(call)}
              >
                {!isProfileError ? (
                  <img
                    src={call.recipient.profile}
                    alt="Participant Profile"
                    loading="lazy"
                    onError={() => setProfileError(true)}
                    className="call-logs-caller-profile"
                  />
                ) : (
                  <NameIcon
                    name={call.recipient.name}
                    size={50}
                    className="call-logs-caller-profile"
                  />
                )}
                <div className="call-logs-info">
                  <div className="call-logs-caller-name-and-date">
                    <span className="call-logs-caller-name">
                      {call.recipient.name}
                    </span>
                    <span className="call-logs-dates">
                      {getFormattedCallDate(call.startedAt)}
                    </span>
                  </div>
                  <div className="call-logs-callstatus">
                    <span>{renderCallStatus(call)}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ color: "white" }} color="grey" align="center">
            No call logs found.
          </p>
        )}
      </>
    );
  };

  const renderCallHistoryDeletePopup = () => {
    return (
      <div className="call-logs-delete-popup-wrapper">
        <div className="popup-title">
          <span
            style={{ color: "white", fontSize: "24px", fontWeight: "bold" }}
          >
            GChat
          </span>
          <span style={{ color: "white" }}>
            Are sure you want to delete all call histories?
          </span>
        </div>
        <div className="popup-confirm-and-cancel-btns">
          <button onClick={() => setIsCallHistoryDeleting(false)}>
            Cancel
          </button>
          <button
            onClick={() => {
              deleteAllCallLogs();
              setIsCallHistoryDeleting(false);
              setIsCallLogsOpen(false);
              setSelectedCallLogs(null);
            }}
          >
            Yes, Delete it
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="call-logs-container">
      <div className="call-logs-list-container">
        <div className="call-logs-title">
          <span>Calls</span>
          <div className="add-call-btn">
            <TbPhonePlus
              color="white"
              size={20}
              onClick={() => setUserContactListOpen((prev) => !prev)}
            />
            {isUserContactListOpen && (
              <div className="user-contact-list-container" ref={containerRef}>
                {renderContactList()}
              </div>
            )}
          </div>
        </div>
        <div className="call-logs-search-wrapper">
          <IoSearchOutline className="call-logs-search-icon" />
          <input
            type="text"
            placeholder="search or start new call"
            className="call-logs-search-box"
            value={searchCallLogs}
            onChange={(e) => setSearchCallLogs(e.target.value)}
          />
        </div>
        <div className="call-logs-recent-title">
          <span>Recent</span>
          <button
            className="clear-call-logs"
            onClick={() => setIsCallHistoryDeleting(true)}
          >
            Clear all history
          </button>
        </div>
        <div className="call-logs-list">{renderCallHistory()}</div>
      </div>
      <div
        className={`call-logs-info-container ${
          isCallLogsOpen ? "call-logs-info-container-active" : ""
        }`}
      >
        {isCallLogsOpen ? (
          <>
            <div className="call-logs-info-title">
              <div className="call-logs-title-and-arrow">
                <IoMdArrowBack
                  size={22}
                  color="white"
                  className="call-logs-back-arrow"
                  onClick={() => {
                    setIsCallLogsOpen(false);
                    setSelectedCallLogs(null);
                  }}
                />
                <span className="call-info-txt">Call Info</span>
              </div>

              <button
                className="clear-call-logs"
                onClick={() => {
                  deleteCallLog(selectedCallLogs._id);
                  setIsCallLogsOpen(false);
                  setSelectedCallLogs(null);
                }}
              >
                Clear call logs
              </button>
            </div>
            <div className="call-logs-open-user-info-wrapper">
              <div className="call-logs-open-user-profile">
                <div className="call-logs-open-user-info">
                  {!isOpenLogsProfileError ? (
                    <img
                      src={selectedCallLogs.recipient.profile}
                      alt="Participant Profile"
                      loading="lazy"
                      onError={() => setOpenLogsProfileError(true)}
                      className="call-logs-caller-profile"
                    />
                  ) : (
                    <NameIcon
                      name={selectedCallLogs.recipient.name}
                      size={40}
                    />
                  )}
                  <span className="call-logs-open-caller-name">
                    {selectedCallLogs.recipient.name}
                  </span>
                </div>
                <div className="call-logs-chat-medium-icon">
                  <div
                    className={`medium-icon-wrapper ${
                      isUserBlocked ? "disabled" : ""
                    }`}
                    onClick={
                      !isUserBlocked
                        ? () =>
                            initiateCall(selectedCallLogs.recipient, "video")
                        : null
                    }
                  >
                    <IoVideocamOutline size={22} color="white" />
                  </div>
                  <div
                    className={`medium-icon-wrapper ${
                      isUserBlocked ? "disabled" : ""
                    }`}
                    onClick={
                      !isUserBlocked
                        ? () =>
                            initiateCall(selectedCallLogs.recipient, "audio")
                        : null
                    }
                  >
                    <TbPhone size={22} color="white" />
                  </div>
                </div>
              </div>
              {isUserBlocked && (
                <div className="user-block-status">
                  <span>You have been blocked</span>
                </div>
              )}
              <div className="call-logs-details-wrapper">
                <span className="call-logs-date">
                  {getFormattedDate(selectedCallLogs.startedAt)}
                </span>
                <div className="call-logs-details">
                  <div className="call-logs-calltypes">
                    {selectedCallLogs.callType === "video" ? (
                      <IoVideocamOutline size={20} color="white" />
                    ) : (
                      <TbPhone size={20} color="white" />
                    )}
                    <span>
                      {`${
                        selectedCallLogs.callDirection === "incoming"
                          ? selectedCallLogs.status === "missed"
                            ? "Missed"
                            : "Incoming"
                          : "Outgoing"
                      } ${selectedCallLogs.callType} call at ${getFormattedTime(
                        selectedCallLogs.startedAt
                      )}`}
                    </span>
                  </div>

                  <div className="call-logs-details-call-status">
                    {selectedCallLogs.status === "completed" ? (
                      <span>
                        {calculateDuration(
                          selectedCallLogs.startedAt,
                          selectedCallLogs.endedAt
                        )}
                      </span>
                    ) : (
                      <span>Unanswered</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="call-history-if-not-selected">
            <MdOutlineHistory size={55} color="lightgrey" />
            <span className="call-history-if-not-selected-text">
              Select call logs
            </span>
          </div>
        )}
      </div>
      {isCallHistoryDeleting &&
        (callHistory?.length > 0 ? (
          <div className="Modal">{renderCallHistoryDeletePopup()}</div>
        ) : (
          notifyWarning("No call histories found to delete")
        ))}
    </div>
  );
};

export default Call;
