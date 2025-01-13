import React, { useEffect, useState, useRef } from "react";

//import contexts
import { useCall } from "../../contexts/CallContext";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

//import icons
import NameIcon from "../NameIcon";
import userIcon from "../../assets/icon/user-icon.png";
import logo from "../../assets/logo/favicon.png";

//css
import "./chat.css";

//import react-icon
import {
  PiVideoLight,
  PiTrashLight,
  PiChatCircleTextLight,
} from "react-icons/pi";
import { CiSearch, CiImageOn } from "react-icons/ci";
import { HiMiniViewfinderCircle } from "react-icons/hi2";
import {
  IoSend,
  IoEllipsisVertical,
  IoPersonAddOutline,
  IoVideocamOutline,
} from "react-icons/io5";
import { IoMdDownload, IoMdClose } from "react-icons/io";
import { TbPhone } from "react-icons/tb";
import { BsSendPlus } from "react-icons/bs";
import { MdOutlineArrowBack, MdContentCopy } from "react-icons/md";
import { BiCheckDouble, BiEdit } from "react-icons/bi";
import { GrFormAttachment, GrClose } from "react-icons/gr";
import { FaPlay } from "react-icons/fa";
import { RiUserForbidLine, RiUserLine } from "react-icons/ri";
import { TfiAngleDown } from "react-icons/tfi";

const Chat = () => {
  // contexts
  const { initiateCall } = useCall();
  const { user } = useAuth();
  const { notifySuccess, notifyError, notifyWarning } = useToast();
  const {
    messages,
    chatList,
    selectedChatUserId,
    setSelectedChatUserId,
    sendMessage,
    fetchChatsLists,
    fetchChatMessages,
    deleteMessage,
    blockUser,
    isUserBlocked,
    isBlockedMe,
    selectedFilePrev,
    setSelectedFilePrev,
    deleteChat,
    currentUserId,
    setSelectedUser,
    selectedUser,
    chatId,
    markMessagesAsSeen,
    activeUsers,
    isMessageSent,
  } = useChat();

  //states
  const [msgData, setMsgData] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [scale, setScale] = useState(1);
  const [activeInput, setActiveInput] = useState(null);
  const [toOpenFileUrl, setToOpenFileUrl] = useState(null);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [chaltListSearchQuery, setChatListSearchQuery] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [errors, setErrors] = useState({ name: "", emailOrUserId: "" });

  const [isNewContact, setIsNewContact] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showFileOptions, setShowFileOptions] = useState(false);
  const [isAddNewContactVisible, setIsAddNewContactVisible] = useState(false);
  const [isOpenChatOptions, setIsOpenChatOptions] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isChatlistActive, setIsChatlistActive] = useState(false);

  //ref
  const contactWrapperRef = useRef(null);
  const addNewContactToggleRef = useRef(null);
  const messageRefs = useRef({});
  const userInfoRef = useRef(null);
  const chatoptionRef = useRef(null);
  const togglechatOptRef = useRef(null);
  const chatListRef = useRef(null);
  const fileOptionsRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatBoxRef = useRef(null);

  //useEffects
  useEffect(() => {
    setIsChatlistActive(true);
    return () => {
      setSelectedChatUserId(null);
    };
  }, []);

  useEffect(() => {
    if (currentUserId) fetchChatsLists();
  }, [currentUserId]);

  useEffect(() => {
    if (selectedChatUserId) {
      fetchChatMessages(selectedChatUserId);
    }
  }, [selectedChatUserId]);

  useEffect(() => {
    if (selectedChatUserId && chatId) {
      markMessagesAsSeen(chatId);
    }
  }, [selectedChatUserId, chatId]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        fileOptionsRef.current &&
        !fileOptionsRef.current.contains(event.target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target)
      ) {
        setShowFileOptions(false);
      }

      if (activeMessageId !== null) {
        const currentMessageRef = messageRefs.current[activeMessageId];
        if (currentMessageRef && !currentMessageRef.contains(event.target)) {
          setActiveMessageId(null);
        }
      }

      if (
        chatoptionRef.current &&
        !chatoptionRef.current.contains(event.target) &&
        togglechatOptRef.current &&
        !togglechatOptRef.current.contains(event.target)
      ) {
        setIsOpenChatOptions(false);
      }

      if (userInfoRef.current && !userInfoRef.current.contains(event.target)) {
        setIsUserProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMessageId]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        contactWrapperRef.current &&
        !contactWrapperRef.current.contains(event.target) &&
        addNewContactToggleRef.current &&
        !addNewContactToggleRef.current.contains(event.target)
      ) {
        setIsAddNewContactVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //functions
  const handleSendMessage = async () => {
    let fileUrl = "";
    if (selectedFile && selectedFilePrev) {
      fileUrl = await uploadFile();
    }
    if (selectedChatUserId) {
      const fileToSend = fileUrl || selectedFilePrev;

      if (fileToSend || msgData.trim()) {
        await sendMessage(selectedChatUserId, msgData, fileToSend);
        setMsgData("");
        document.querySelector(".chat-input-box").style.height = "auto";
        fetchChatsLists();
        setSelectedFilePrev(null);
      }
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      console.error("No file selected for upload");
      return;
    }

    const formData = new FormData();
    formData.append("senderId", currentUserId);
    formData.append("file", selectedFile);

    try {
      const res = await fetch("http://localhost:5000/upload-file", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        removeSelectedFile();
        return result.fileUrl;
      } else {
        console.error("Error uploading file:", result.message);
      }
    } catch (error) {
      console.error("Error uploading file", error);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setActiveInput(event.target.name);
    if (file && file.size > 30 * 1024 * 1024) {
      notifyWarning("File size exceeds 30MB. Please select a smaller file.");
      setSelectedFilePrev(null);
      setSelectedFile(null);
      fileInputRef.current.value = "";
    } else {
      const fileUrl = URL.createObjectURL(file);
      setSelectedFilePrev(fileUrl);
      setSelectedFile(file);
    }
  };
  const removeSelectedFile = () => {
    if (activeInput) {
      setSelectedFilePrev(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  const handleDownload = () => {
    fetch(toOpenFileUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Gchat-download";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
  };

  const copyMsg = (msg) => {
    navigator.clipboard
      .writeText(msg)
      .then(() => {
        notifySuccess("Message copied to clipboard");
      })
      .catch((err) => {
        notifyError("Failed to copy message: " + err);
      });
  };

  const handleChatClick = (chat, userDetail) => {
    setSelectedChatUserId(chat.peerId);
    fetchChatMessages(chat.peerId);
    const data = {
      ...userDetail,
      date: chat.timestamp,
    };
    setSelectedUser(data);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!e.shiftKey) handleSendMessage();
      e.target.style.height = "auto";
    } else if (e.key === "Enter" && e.shiftKey) {
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  };

  const handleChatListToggle = () => {
    setIsChatlistActive((prev) => !prev);
    setSelectedChatUserId("");
  };

  const toggleSelectedUserProfile = () => {
    setIsUserProfileOpen((prev) => !prev);
  };
  const toggleOpenChatOptions = () => {
    setIsOpenChatOptions((prev) => !prev);
  };

  const toggleFileOptions = () => {
    setShowFileOptions((prevState) => !prevState);
  };
  const handleDoubleClick = () => {
    setScale((prevScale) => (prevScale === 1 ? 2 : 1));
  };

  const toggleShowMessageOption = (messageId) => {
    setActiveMessageId((prevId) => (prevId === messageId ? null : messageId));
  };

  const toggleVisibility = () => {
    setIsAddNewContactVisible((prev) => !prev);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setAddEmail(value);
    if (validateEmail(value)) {
      setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!addEmail) {
      setErrors({ email: "Email is required." });
      return;
    }

    if (!validateEmail(addEmail)) {
      setErrors({ email: "Invalid email format." });
      return;
    }
    saveChatList(user.userId, addEmail, "No message found");
  };

  const saveChatList = async (userId, chatPartnerEmail, lastMessage) => {
    try {
      const response = await fetch(
        "http://localhost:5000/GChat/chatlists/add-chatlist",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, chatPartnerEmail, lastMessage }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        setErrors({ email: "Failed to save chat list." });
      }

      const data = await response.json();
      // console.log("Chat list saved:", data);
      setIsNewContact(false);
      setAddEmail("");
      setErrors({});
      fetchChatsLists();
    } catch (error) {
      console.error("Error saving chat list:", error.message);
      setErrors({ email: "User not found on GChat, send invite link" });
    }
  };

  const handleUserInvite = async () => {
    try {
      const siteUrl = window.location.href;
      const inviteUrl = `${siteUrl}?ref=${encodeURIComponent(user.email)}`;

      const shareData = {
        title: "Join me on this chat app!",
        text: `Hi! I am inviting you to join this amazing chat app. Sign up with this link to connect with me directly.`,
        url: inviteUrl,
      };

      if (navigator.share) {
        await navigator.share(shareData);
        // notifySuccess("Invite link shared successfully!");
      } else {
        notifyWarning("Sharing not supported on this browser.");
      }
    } catch (error) {
      console.error("Error sharing invite link:", error);
    }
  };

  const renderChatList = () => {
    const performSearchOnChatList = chatList.filter(
      ({ userDetail }) =>
        userDetail &&
        userDetail.name &&
        userDetail.name
          .toLowerCase()
          .includes(chaltListSearchQuery.toLowerCase())
    );
    return (
      <>
        {performSearchOnChatList.length > 0 ? (
          performSearchOnChatList.map(
            ({ chatPartner, userDetail, unseenMessagesCount }, index) => (
              <div
                key={index}
                onClick={() => {
                  handleChatClick(chatPartner, userDetail);
                  setSelectedFilePrev(null);
                  setSelectedFile(null);
                  setMsgData("");
                  setIsChatlistActive(false);
                }}
                className={`chat-list-item ${
                  chatPartner.peerId === selectedChatUserId
                    ? "chat-list-active"
                    : ""
                }`}
              >
                <div className="chat-list-profile-wrapper">
                  {userDetail.profile && !imageError ? (
                    <img
                      src={userDetail.profile}
                      alt={`${userDetail.name}'s profile`}
                      className="chat-list-profile-pic"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <NameIcon size={45} name={userDetail.name} />
                  )}
                  {activeUsers.includes(chatPartner.peerId) && (
                    <div className="chat-list-active-icon"></div>
                  )}
                </div>
                <div className="chats-list-item-details">
                  <div className="chat-list-user-name-and-date">
                    <span className="chat-list-user-name">
                      {userDetail.name}
                    </span>
                    <span className="chat-list-date">
                      {(() => {
                        const messageDate = new Date(chatPartner.timestamp);
                        return messageDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      })()}
                    </span>
                  </div>
                  <div className="chat-list-user-name-and-date">
                    <span className="chat-list-last-chat">
                      {chatPartner.lastMessage}
                    </span>
                    {unseenMessagesCount > 0 && (
                      <div className="unseen-messages-count">
                        {unseenMessagesCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          )
        ) : (
          <div style={{ color: "white" }} align="center">
            <p>No chat contact found.</p>
            <button onClick={() => setIsNewContact(true)}>
              Add new contact
            </button>
          </div>
        )}
      </>
    );
  };

  const getFormattedDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();

    if (
      messageDate.getFullYear() === today.getFullYear() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getDate() === today.getDate()
    ) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return messageDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const renderMessages = () => {
    return messages.map((msg, index) => {
      const isCurrentUser = msg.senderId === currentUserId;
      const currentDate = new Date(msg.timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const previousDate =
        index > 0
          ? new Date(messages[index - 1].timestamp).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
              }
            )
          : null;

      return (
        <React.Fragment key={index}>
          {currentDate !== previousDate && (
            <div className="chats-dates">
              <em>{currentDate}</em>
            </div>
          )}
          <div
            className="chats-messages"
            style={{
              justifyContent: isCurrentUser ? "flex-end" : "flex-start",
            }}
          >
            <div
              className="messages"
              ref={(el) => (messageRefs.current[msg._id] = el)}
              style={{
                maxWidth: msg.fileUrl ? "250px" : "",
                padding: msg.fileUrl ? "6px" : "",
                backgroundColor: !isCurrentUser ? "#2c2c2c" : "#01A066",
                color: "white",
                cursor: msg.fileUrl ? "pointer" : "",
              }}
            >
              {msg.fileUrl && (
                <div className="msg-media-file">
                  {msg.fileUrl.endsWith(".jpg") ||
                  msg.fileUrl.endsWith(".jpeg") ||
                  msg.fileUrl.endsWith(".svg") ||
                  msg.fileUrl.endsWith(".png") ||
                  msg.fileUrl.endsWith(".gif") ? (
                    <>
                      <img
                        src={msg.fileUrl}
                        className="msg-file"
                        alt="File"
                        loading="lazy"
                      />
                      <div
                        className="msg-hover-icon"
                        onClick={() => setToOpenFileUrl(msg.fileUrl)}
                      >
                        <HiMiniViewfinderCircle size={20} color="white" />
                      </div>
                    </>
                  ) : msg.fileUrl.endsWith(".mp4") ||
                    msg.fileUrl.endsWith(".mkv") ||
                    msg.fileUrl.endsWith(".webm") ? (
                    <>
                      <video
                        src={msg.fileUrl}
                        className="msg-file msg-vdo"
                        alt="File"
                      />
                      <div
                        className="msg-hover-icon"
                        onClick={() => setToOpenFileUrl(msg.fileUrl)}
                      >
                        <FaPlay size={20} color="white" />
                      </div>
                    </>
                  ) : (
                    <p>Unsupported file type</p>
                  )}
                </div>
              )}
              <span className="msg">{msg.message}</span>
              <em className="chats-messages-time">
                <span>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {isCurrentUser && <BiCheckDouble size={20} style={{}} />}
                {isCurrentUser && (
                  <TfiAngleDown
                    size={14}
                    onClick={() => toggleShowMessageOption(msg._id)}
                    style={{ cursor: "pointer" }}
                  />
                )}
              </em>
              {isCurrentUser && activeMessageId === msg._id && (
                <div className="message-options">
                  <div
                    className="message-options-item"
                    onClick={() => {
                      copyMsg(msg.message);
                      setActiveMessageId(null);
                    }}
                  >
                    <MdContentCopy size={15} />
                    <span className="msg-opt-title">Copy</span>
                  </div>
                  <div
                    className="message-options-item"
                    style={{ color: "red" }}
                    onClick={() => deleteMessage(msg._id, msg.senderId)}
                  >
                    <PiTrashLight size={15} />
                    <span className="msg-opt-title">Delete</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </React.Fragment>
      );
    });
  };

  const renderIfChatNotOpen = () => {
    return (
      <div className="chat-not-selected-wrapper">
        <PiChatCircleTextLight
          className="chat-not-selected-icon"
          color="grey"
          size={50}
        />
        <span className="chat-not-selected-msg">
          Who would you like to chat with today? Select a user to get started!
        </span>
        <span
          style={{ color: "#01A066", cursor: "pointer", fontSize: "12px" }}
          onClick={handleChatListToggle}
        >
          Select a chat
        </span>
      </div>
    );
  };
  const renderIfNotMessageFound = () => {
    return (
      <div className="chat-not-selected-wrapper" style={{marginTop:'200px'}}>
        <PiChatCircleTextLight
          className="chat-not-selected-icon"
          color="grey"
          size={50}
        />
        <span className="chat-not-selected-msg">No messages found</span>
      </div>
    );
  };

  const renderUserProfileInfo = () => {
    return (
      <div className="selected-chat-user-info-wrapper" ref={userInfoRef}>
        <div className="selected-user-profile">
          {selectedUser.profile && !imageError ? (
            <img
              className="selected-user-profile-img"
              src={selectedUser ? selectedUser.profile : userIcon}
              onError={() => setImageError(true)}
            />
          ) : (
            <NameIcon size={75} name={selectedUser.name} />
          )}
        </div>
        <div className="selected-user-profile-name">
          <span className="selected-user-name">{selectedUser.name}</span>
          <span className="selected-user-email">{selectedUser.email}</span>
        </div>
        <div className="selected-user-call-wrapper">
          <button
            className={`selected-user-video-call-btn vCall ${
              isUserBlocked ? "disabled" : ""
            }`}
            disabled={isUserBlocked}
            onClick={
              !isUserBlocked ? () => initiateCall(selectedUser, "video") : null
            }
          >
            <IoVideocamOutline color="white" size={20} />
            <span className="selected-user-call-txt">Video</span>
          </button>
          <button
            className={`selected-user-video-call-btn vCall ${
              isUserBlocked ? "disabled" : ""
            }`}
            disabled={isUserBlocked}
            onClick={
              !isUserBlocked ? () => initiateCall(selectedUser, "audio") : null
            }
          >
            <TbPhone color="white" size={20} />
            <span className="selected-user-call-txt">Voice</span>
          </button>
        </div>
        {selectedUser.phoneNumber && (
          <div className="selected-user-phone-number-wrapper">
            <span className="selected-user-phone-number-label">
              Phone number
            </span>
            <span className="selected-user-phone-number">
              {selectedUser.phoneNumber}
            </span>
          </div>
        )}
        <div className="selected-user-block-report-btn-wrapper">
          <button className="selected-user-block-btn" onClick={blockUser}>
            {isBlockedMe ? <span>Unblock</span> : <span>Block</span>}
          </button>
          <button className="selected-user-report-btn">Report</button>
        </div>
      </div>
    );
  };
  const renderChatMenuOptions = () => {
    return (
      <div className="chat-box-opt-wrapper" ref={chatoptionRef}>
        <div
          className="chat-box-opt-item"
          onClick={() => {
            blockUser();
            setIsOpenChatOptions(false);
          }}
        >
          {isBlockedMe ? (
            <div className="chat-block-user">
              <RiUserForbidLine size={18} />
              <span>Unblock</span>
            </div>
          ) : (
            <div className="chat-block-user">
              <RiUserLine size={18} />
              <span>Add to Blocklist</span>
            </div>
          )}
        </div>
        <div
          className="chat-box-opt-item"
          onClick={() => {
            deleteChat();
            setIsOpenChatOptions(false);
          }}
        >
          <PiTrashLight size={18} />
          <span>Delete chat</span>
        </div>
      </div>
    );
  };
  const renderOpenFileUrl = () => {
    return (
      <div className="msg-media-file-viewer">
        <div className="msg-media-viewer-closer">
          <div onClick={handleDownload} className="viewer-download-icon">
            <IoMdDownload color="white" size={20} />
          </div>
          <GrClose
            color="white"
            size={20}
            className="viewer-close-icon"
            onClick={() => setToOpenFileUrl(null)}
          />
        </div>
        <div className="msg-media-file-view">
          {toOpenFileUrl.endsWith(".jpg") ||
          toOpenFileUrl.endsWith(".jpeg") ||
          toOpenFileUrl.endsWith(".png") ||
          toOpenFileUrl.endsWith(".gif") ? (
            <img
              onDoubleClick={handleDoubleClick}
              src={toOpenFileUrl}
              className="view-msg-img"
              alt="File"
              loading="lazy"
              style={{
                transform: `scale(${scale})`,
                transition: "transform 0.3s ease",
                cursor: scale === 1 ? "zoom-in" : "zoom-out",
              }}
            />
          ) : toOpenFileUrl.endsWith(".mp4") ||
            toOpenFileUrl.endsWith(".mkv") ||
            toOpenFileUrl.endsWith(".webm") ? (
            <video
              src={toOpenFileUrl}
              className="view-vdo-file"
              alt="File"
              controls
              autoPlay
            />
          ) : (
            <p>Unsupported file type</p>
          )}
        </div>
      </div>
    );
  };
  const renderSelectedFilePreview = () => {
    return (
      <div className="chat-box-selected-image-wrapper">
        <div
          className="file-preview-closer"
          onClick={() => {
            removeSelectedFile();
            setSelectedFilePrev(null);
            setMsgData("");
          }}
        >
          <GrClose color="white" size={20} className="viewer-close-icon" />
        </div>
        {selectedFile && selectedFile.type.startsWith("image/") ? (
          <img
            src={selectedFilePrev}
            alt="Preview"
            className="chat-box-selected-img"
          />
        ) : selectedFile ? (
          <video className="chat-box-selected-vdo" controls>
            <source
              src={selectedFilePrev}
              type={selectedFile?.type || "video/"}
            />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={selectedFilePrev}
            alt="Preview"
            className="chat-box-selected-img"
          />
        )}
      </div>
    );
  };
  const renderAddNewContactUi = () => {
    return (
      <div className="add-new-contact-wrapper">
        <form className="chat-form" onSubmit={handleSubmit}>
          <div className="add-new-contact-title">
            <span>Add contact</span>
            <IoMdClose
              onClick={() => {
                setIsNewContact(false);
                setAddEmail("");
                setErrors({});
              }}
              color="white"
              style={{ cursor: "pointer" }}
              size={20}
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              id="emailOrUserId"
              name="emailOrUserId"
              value={addEmail}
              onChange={handleChange}
              placeholder="Enter email"
              className={errors.email ? "error-input" : ""}
            />
            {errors.email && (
              <small className="error-text">{errors.email}</small>
            )}
          </div>
          <div className="gchat-add-new-contact-btn-wrapper">
            <button type="submit" className="submit-button adnBtn">
              Save
            </button>
          </div>
        </form>
      </div>
    );
  };
  const renderChooseFileUi = () => {
    return (
      <div className="chat-box-show-file-choose-opt" ref={fileOptionsRef}>
        <div className="ch-file-title">
          <span>Choose file</span>
        </div>
        <div className="chat-box-file-choose-item">
          <label htmlFor="image-upload">
            <CiImageOn className="chat-add-icon" />
            <span className="choose-title">Photo</span>
          </label>
          <input
            id="image-upload"
            type="file"
            accept=".jpeg, .png, .svg, .jpg"
            name="image-file"
            ref={fileInputRef}
            onChange={(e) => {
              handleFileChange(e);
              setShowFileOptions(false);
            }}
            style={{ display: "none" }}
          />
        </div>
        <div className="chat-box-file-choose-item">
          <label htmlFor="video-upload">
            <PiVideoLight className="chat-add-icon" />
            <span className="choose-title">Video</span>
          </label>
          <input
            id="video-upload"
            type="file"
            name="video-file"
            accept="video/*"
            ref={fileInputRef}
            onChange={(e) => {
              handleFileChange(e);
              setShowFileOptions(false);
            }}
            style={{ display: "none" }}
          />
        </div>
      </div>
    );
  };
  return (
    <div className="chat-container">
      <div
        className={`chat-aside ${isChatlistActive ? "aside-active" : ""}`}
        ref={chatListRef}
      >
        <div className="chat-top-wrapper">
          <div className="gchat-title-wrapper">
            <div className="gchat-title">
              <div className="gchat-logo-container">
                <img src={logo} alt="logo" className="gchat-logo" />
              </div>
              <span>Chats</span>
            </div>
            <div className="gchat-h-icon-wr">
              <div className="gchat-add-person-wrapper">
                <div
                  className="gchat-header-add-icon"
                  onClick={toggleVisibility}
                  ref={addNewContactToggleRef}
                >
                  <BiEdit size={16} color="white" />
                </div>
                <div
                  ref={contactWrapperRef}
                  className={`gchat-add-new-contact-wrapper ${
                    isAddNewContactVisible ? "visible" : "hidden"
                  }`}
                >
                  <div className="gchat-add-newContact-title">
                    <span>New chat</span>
                  </div>
                  <div className="gchat-invite-new" onClick={handleUserInvite}>
                    <div className="gchat-header-add-icon">
                      <BsSendPlus size={14} color="white" />
                    </div>
                    <div className="gchat-invite-text">
                      <span>Send invite link</span>
                    </div>
                  </div>

                  <div
                    className="gchat-invite-new"
                    onClick={() => {
                      setIsNewContact(true);
                      setIsAddNewContactVisible(false);
                    }}
                  >
                    <div className="gchat-header-add-icon">
                      <IoPersonAddOutline size={14} color="white" />
                    </div>
                    <div className="gchat-invite-text">
                      <span>Add contact</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="chat-search-wrapper">
            <CiSearch className="chat-search-icon" />
            <input
              type="text"
              placeholder="Search or start new chat"
              className="chat-search-box"
              value={chaltListSearchQuery}
              onChange={(e) => setChatListSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="chat-list">{renderChatList()}</div>
      </div>
      <>
        {selectedChatUserId ? (
          <div className="chat-box-wrapper">
            <div className="chat-box-header">
              <div
                className="chat-list-menu-icon"
                onClick={handleChatListToggle}
              >
                <MdOutlineArrowBack
                  size={25}
                  color="white"
                  className="call-logs-back-arrow"
                />
              </div>
              <div className="select-chat-user">
                <div
                  className="chat-list-profile-wrapper"
                  onClick={toggleSelectedUserProfile}
                  style={{ marginLeft: "10px" }}
                >
                  {selectedUser.profile && !imageError ? (
                    <img
                      src={selectedUser ? selectedUser.profile : userIcon}
                      alt={selectedUser.name}
                      onError={() => setImageError(true)}
                      className="chat-box-user-profile"
                    />
                  ) : (
                    <NameIcon size={35} name={selectedUser.name} />
                  )}
                  {activeUsers.includes(selectedChatUserId) && (
                    <div className="chat-list-active-icon"></div>
                  )}
                </div>
                <div
                  className="chat-box-user-info"
                  onClick={toggleSelectedUserProfile}
                >
                  <span className="chat-box-user-name">
                    {selectedUser.name}
                  </span>
                  <span className="chat-box-user-date">
                    {selectedUser.date
                      ? getFormattedDate(selectedUser.date)
                      : getFormattedDate(new Date())}
                  </span>
                </div>
                {isUserProfileOpen && <>{renderUserProfileInfo()}</>}
              </div>
              <div className="chat-box-opt">
                <div
                  className={`chat-box-opt-icon ${
                    isUserBlocked ? "disabled" : ""
                  }`}
                  onClick={
                    !isUserBlocked
                      ? () => initiateCall(selectedUser, "video")
                      : null
                  }
                >
                  <IoVideocamOutline
                    size={20}
                    color="white"
                    className="chat-box-call-icon"
                  />
                </div>
                <div
                  className={`chat-box-opt-icon ${
                    isUserBlocked ? "disabled" : ""
                  }`}
                  onClick={
                    !isUserBlocked
                      ? () => initiateCall(selectedUser, "audio")
                      : null
                  }
                >
                  <TbPhone
                    size={20}
                    color="white"
                    className="chat-box-call-icon"
                  />
                </div>

                <div
                  ref={togglechatOptRef}
                  onClick={toggleOpenChatOptions}
                  className="chat-box-opt-icon"
                >
                  <IoEllipsisVertical size={18} color="white" />
                </div>
                {isOpenChatOptions && <>{renderChatMenuOptions()}</>}
              </div>
            </div>
            <div className="chat-box" ref={chatBoxRef}>
              {isBlockedMe && (
                <div className="if-user-blocked-show" onClick={blockUser}>
                  <span>You blocked this contact. Tap to unblock</span>
                </div>
              )}
              {messages.length ? (
                <div className="chat-messages-wrapper">{renderMessages()}</div>
              ) : (
                <>{renderIfNotMessageFound()}</>
              )}
            </div>

            {selectedFilePrev && <>{renderSelectedFilePreview()}</>}

            {!isUserBlocked ? (
              <div className="chat-input-box-wrapper">
                {showFileOptions && <>{renderChooseFileUi()}</>}
                <div
                  className="chat-box-icon"
                  ref={toggleButtonRef}
                  onClick={toggleFileOptions}
                >
                  <GrFormAttachment />
                </div>

                <textarea
                  className="chat-input-box"
                  placeholder="Type message..."
                  value={msgData}
                  onChange={(e) => setMsgData(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button
                  className={`chat-send-btn ${
                    !(msgData.trim() || selectedFilePrev) ? "disabled" : ""
                  }`}
                  onClick={handleSendMessage}
                  disabled={!(msgData.trim() || selectedFilePrev)}
                >
                  <span>Send</span>
                  <IoSend />
                </button>
              </div>
            ) : (
              <div className="chat-input-box-wrapper">
                <div
                  style={{
                    color: "rgb(255, 152, 152)",
                    textAlign: "center",
                    fontSize: "12px",
                    margin: "auto",
                  }}
                >
                  You have been blocked.
                </div>
              </div>
            )}
          </div>
        ) : (
          <>{renderIfChatNotOpen()}</>
        )}
      </>
      {toOpenFileUrl && <>{renderOpenFileUrl()}</>}

      {isNewContact && <>{renderAddNewContactUi()}</>}
    </div>
  );
};

export default Chat;
