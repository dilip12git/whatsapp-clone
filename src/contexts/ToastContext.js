import React,{useContext,createContext} from 'react'
import {ToastContainer,toast } from 'react-toastify';


const toastContext = createContext(null);

const ToastService = ({children}) => {
  const notifySuccess = (message) => toast.success(message, {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    closeButton:false,
    pauseOnHover: false,
    style: { backgroundColor: '#333', color: '#fff' }


  });
  
  const notifyWarning = (message) => toast.warning(message, {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    closeButton:false,
    style: { backgroundColor: '#333', color: '#fff' }

  });
  
  const notifyError = (message) => toast.error(message, {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    closeButton:false,
    style: { backgroundColor: '#333', color: '#fff' }

  });
  
  return (
    <toastContext.Provider value={{notifySuccess,notifyWarning,notifyError}}>
        {children}
       
    </toastContext.Provider>
  )
}

export default ToastService

export const useToast = () =>{
    return useContext(toastContext)
}
