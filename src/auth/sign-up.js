import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// css styles
import "./styles.css";
import logo from "../assets/logo/favicon.png";

// react-icons
import { FcGoogle } from "react-icons/fc";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { LuEye, LuEyeOff } from "react-icons/lu";

// loader
import { ClipLoader } from "react-spinners";
import "react-phone-input-2/lib/style.css";

// context
import { useAuth } from "../contexts/AuthContext";

function SignUp() {
  const navigate = useNavigate();

  const {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    otp,
    setOtp,
    showPopup,
    otpMatch,
    isLoading,
    verifyOtp,
    handleGoogleSignUp,
    handleSignUp,
    errors,
    user,
    isAuthenticated,
  } = useAuth();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, user]);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
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

  return (
    <div className="sign-container">
      <div className="form-container">
        <div className="title-container">
          <div className="auth-logo-container">
            <img className="logo-icon" src={logo} alt="logo" />
          </div>
          <span className="sign-with">Sign Up</span>
        </div>
        <form onSubmit={handleSignUp} className="sign-form">
          <div className="input-wrapper">
            <label>Name</label>
            <input
              className="inputField"
              value={name}
              type="name"
              name="name"
              onChange={(e) => setName(e.target.value)}
              placeholder="name"
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>
          <div className="input-wrapper">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              className="inputField"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="input-wrapper">
            <div className="password-label-wrapper">
              <label>Create password</label>
            </div>
            <div className="pass-input">
              <input
                type={isPasswordVisible ? "text" : "password"}
                className="inputField"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
              />
              <div className="eye-icon" onClick={togglePasswordVisibility}>
                {isPasswordVisible ? <LuEye /> : <LuEyeOff />}
              </div>
            </div>
            {errors.password && (
              <span className="error">{errors.password}</span>
            )}
          </div>

          <div className="input-wrapper">
            <input type="submit" className="inputField" value="Sign Up" />
          </div>

          <div className="new-acc-wrapper">
            <span className="newtogchat">Already have an account?</span>
            <Link className="create-acc-link" to="/sign-in">
              Sign In
            </Link>
          </div>
        </form>
        <div className="separator-container">
          <div className="line"></div>
          <div className="or-text">OR</div>
          <div className="line"></div>
        </div>
        <div
          className="sign-with-google-container"
          onClick={handleGoogleSignUp}
        >
          <FcGoogle className="google-icon" />
          <span className="sign-with-google">Continue with Google</span>
        </div>
      </div>

      {/* OTP Popup */}
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
                  <span style={{ color: "red", fontSize: "12px" }}>
                    {errors.otp}
                  </span>
                )}
                <button type="submit" style={{ marginTop: "20px" }}>
                  Verify OTP
                </button>

                <div className="resend-otp-txt" onClick={handleSignUp}>
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
      {isLoading && (
        <div className="loading-animation-container">
          <div className="loading-animation">
            <ClipLoader color="#01A066" loading size={19} />
            <span style={{ color: "white" }}>Sign up...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignUp;
