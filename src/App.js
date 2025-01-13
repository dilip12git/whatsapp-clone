import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// css styles
import "./App.css";

// components
import SignIn from "./auth/sign-in";
import Chat from "./components/chat/chat";
import Call from "./components/call/call";
import SignUp from "./auth/sign-up";
import Forgot from "./auth/forgot";
import UpdatePassword from "./auth/updatePassword";
import ScrollToTop from "./ScrollToTop";
import ChatWrapper from "./components/ChatWrapper/ChatWrapper";
import Loader from "./components/loader/loader";
import Setting from "./components/setting/setting";

// toast
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsAppLoading(false);
    }, 3000);
  }, []);

  return (
    <Router>
      <div className="App">
        {isAppLoading ? (
          <Loader />
        ) : (
          <>
            <ScrollToTop />
            <ToastContainer />
            <Routes>
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/forgot" element={<Forgot />} />
              <Route path="/update-password" element={<UpdatePassword />} />
              <Route path="/" element={<ChatWrapper />}>
                <Route path="/" element={<Chat />} />
                <Route path="/call" element={<Call />} />
                <Route path="/setting" element={<Setting />} />
              </Route>
            </Routes>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
