import React, { useContext, createContext, useEffect, useState } from "react";

// import contexts
import { useAuth } from "./AuthContext";

import axios from "axios";

//creating context
const callLogsContext = createContext(null);
export const useCallLogs = () => {
  return useContext(callLogsContext);
};

export const CallLogsContext = ({ children }) => {
  //context
  const { user } = useAuth();

  //states
  const [callHistory, setCallHistory] = useState([]);
  const [error, setError] = useState(null);

  //useEffects
  useEffect(() => {
    fetchCallHistory();
  }, [user]);

  const fetchCallHistory = async () => {
    try {
      const userId = user.userId;
      const response = await axios.get(
        `http://localhost:5000/call/fetch-call-logs?userId=${userId}`
      );
      setCallHistory(response.data);
    } catch (err) {
      setError("Error fetching call history");
    }
  };
  const deleteCallLog = async (callId) => {
    try {
      const userId = user.userId;
      await axios.delete(`http://localhost:5000/call/delete-call-logs/delete/${callId}`, {
        data: { userId },
      });
      fetchCallHistory();
    } catch (error) {
      console.error("Error deleting call log:", error);
    }
  };

  const deleteAllCallLogs = async () => {
    try {
      const userId = user.userId;

      await axios.delete(`http://localhost:5000/call/delete-call-logs/delete-all`, { data: { userId } });
      fetchCallHistory();
    } catch (error) {
      console.error("Error deleting all call logs:", error);
    }
  };

  return (
    <callLogsContext.Provider value={{ callHistory, error, fetchCallHistory,deleteCallLog,deleteAllCallLogs }}>
      {children}
    </callLogsContext.Provider>
  );
};
