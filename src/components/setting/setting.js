import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// IMPORT CONTEXTS
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import NameIcon from "../NameIcon";

import axios from "axios";

// SERVICES
import CryptoService from "../../services/encryptDecryptService";
import "./setting.css";

// ICONS
import { GoPencil } from "react-icons/go";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
const Setting = () => {

  // CONTEXTS
  const { user, setAuthenticated, setUser } = useAuth();
  const { notifyError, notifyWarning } = useToast();
  const navigate = useNavigate();
  // states
  const [profileImage, setProfileImage] = useState(null);
  const [profile, setProfile] = useState(user?.profile);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [newName, setNewName] = useState(user?.name || "");
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));

  const [isProfileError, setIsProfileError] = useState(false);
  const [isNameChanged, setIsNameChanged] = useState(false);
  const [isEmailChanged, setIsEmailChanged] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isProfileChanged, setIsProfileChanged] = useState(false);
  const [otpMatch, setOtpMatch] = useState(false);

  
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result !== profile) {
          setProfile(reader.result);
          setIsProfileChanged(true);
          setIsProfileError(false);
        }
      };
      reader.readAsDataURL(file);
      setProfileImage(file);
    }
  };

  const handleChoosePictureClick = () => {
    fileInputRef.current.click();
  };

  const saveProfilePicture = () => {
    setIsProfileChanged(false);
    updateProfile("profilePicture", profileImage);
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setNewName(value);
    setIsNameChanged(value !== name);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setNewEmail(value);
    setIsEmailChanged(value !== email);
  };

  const saveName = () => {
    setName(newName);
    setIsNameChanged(false);
    updateProfile("name", newName);
  };

  const saveEmail = async () => {
    if (!newEmail) {
      notifyError("Email required !");
    } else if (!emailRegex.test(newEmail)) {
      notifyWarning("Invalid email address !");
    } else {
      setEmail(newEmail);
      setIsEmailChanged(false);

      try {
        const email = newEmail;
        const response = await fetch(
          "http://localhost:5000/users/auth/sendOTP",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email }),
          }
        );
        const otpRes = await response.json();
        if (response.ok) {
          setGeneratedOTP(otpRes.otp);
          setShowPopup(true);
        } else {
          notifyError(otpRes.message);
        }
      } catch (err) {
        // console.error(err);
        notifyError("Something went wrong");
      }
    }
  };

  const handleChange = (element, index) => {
    const value = element.value.replace(/[^0-9]/g, "");
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (element.nextSibling && value) {
        element.nextSibling.focus();
      }
    }
  };
  const handleKeyDown = (event, index) => {
    if (
      event.key === "Backspace" &&
      otp[index] === "" &&
      event.target.previousSibling
    ) {
      event.target.previousSibling.focus();
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();

    const otpString = otp.join("");
    if (otp.some((digit) => digit === "")) {
      setErrors({ otp: "Incorrect OTP!" });
      return;
    }
    if (otpString === generatedOTP) {
      setOtp(new Array(6).fill(""));
      updateProfile("email", newEmail);
      setOtpMatch(true);
    } else {
      setErrors({ otp: "OTP does not match" });
    }
  };

  const updateProfile = async (field, value) => {
    const formData = new FormData();
    const id = user.userId;
    if (field === "profilePicture" && value instanceof File) {
      formData.append("profileImage", value);
    } else {
      formData.append(field, value);
    }
    formData.append("userId", id);

    try {
      const response = await axios.patch(
        "http://localhost:5000/users/auth/update-user",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        const encryptedUserData = CryptoService.encryptData(response.data.user);
        localStorage.setItem("userData", JSON.stringify(encryptedUserData));

        const decryptedUserData = CryptoService.decryptData(encryptedUserData);
        setUser(decryptedUserData);

        setTimeout(() => {
          setOtpMatch(false);
          setShowPopup(false);
        }, 1000);
      } else {
        notifyError("Failed to update user profile.");
        setShowPopup(false);
      }
    } catch (error) {
      console.error(error.response?.data?.message || error.message);
      setShowPopup(false);
    }
  };

  const logOut = async () => {
    localStorage.removeItem("userData");
    const user = JSON.parse(localStorage.getItem("userData"));
    if (!user) {
      setAuthenticated(false);
      navigate("/sign-in");
    }
  };

  return (
    <div className="setting-container">
      <div className="setting-title">
        <span>Setting</span>
      </div>
      <div className="setting-user-profile-wrapper">
        <div className="setting-user-profile gchat-user-profile">
          {!isProfileError ? (
            <img
              src={profile}
              onError={() => setIsProfileError(true)}
              className="setting-uPic"
              alt="User Profile"
            />
          ) : (
            <NameIcon size={100} name={name} />
          )}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleProfileChange}
            accept="image/*"
          />
          <div
            className="gchat-edit-profile-icon-wr"
            onClick={handleChoosePictureClick}
          >
            <GoPencil color="white" size={16} />
          </div>
          {isProfileChanged && (
            <button onClick={saveProfilePicture} className="save-picture-btn">
              Save Picture
            </button>
          )}
        </div>
        <div className="setting-input-box-wrapper">
          <label className="setting-label">Name</label>
          <input
            type="text"
            value={newName}
            onChange={handleNameChange}
            className="setting-input-box"
          />
          <button
            disabled={!isNameChanged}
            onClick={saveName}
            style={{
              background: isNameChanged ? "#01a066" : "",
              color: isNameChanged ? "white" : "",
            }}
          >
            Save Change
          </button>
        </div>
        <div className="setting-input-box-wrapper">
          <label className="setting-label">Email Address</label>
          <input
            type="text"
            value={newEmail}
            onChange={handleEmailChange}
            className="setting-input-box"
          />
          <button
            disabled={!isEmailChanged}
            onClick={saveEmail}
            style={{
              background: isEmailChanged ? "#01a066" : "",
              color: isEmailChanged ? "white" : "",
            }}
          >
            Save Change
          </button>
        </div>
        <div className="h-line"></div>
        <button className="gchat-user-profile-logout-btn" onClick={logOut}>
          Log Out
        </button>
        <p className="lgout-note">
          After logging out, your chats will remain saved and will not be
          deleted.
        </p>
      </div>
      {showPopup && (
        <div className="opt-container">
          {!otpMatch ? (
            <div className="opt-wrapper">
              <div className="verified-icon">
                <IoShieldCheckmarkSharp className="vcheck-icon" />
              </div>
              <span className="enter-otp-text">OTP Verification</span>
              <span className="otp-desc-txt">
                OTP has been successfully sent to your email.
              </span>
              <form onSubmit={verifyOtp}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleChange(e.target, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onFocus={(e) => e.target.select()}
                    />
                  ))}
                </div>
                {errors.otp && (
                  <span
                    style={{ color: "rgb(255, 152, 152)", fontSize: "12px" }}
                  >
                    {errors.otp}
                  </span>
                )}
                <button type="submit" style={{ marginTop: "20px" }}>
                  Verify OTP
                </button>

                <div className="resend-otp-txt" onClick={saveEmail}>
                  Resend OTP
                </div>
              </form>
            </div>
          ) : (
            <div className="opt-wrapper">
              <div className="verified-icon">
                <IoShieldCheckmarkSharp className="vcheck-icon" />
              </div>
              <span className="enter-otp-text">Verified</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Setting;
