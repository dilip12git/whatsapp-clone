import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import './styles.css';
import logo from '../assets/logo/favicon.png';

// react-icons
import { LuEye, LuEyeOff, } from "react-icons/lu";
import { ClipLoader } from 'react-spinners';

// contexts
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

function UpdatePassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state;

    // states
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const {notifyError,notifySuccess}=useToast();
    const{isAuthenticated}=useAuth();
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    useEffect(() => {
       
        if (isAuthenticated) {
            navigate('/',{ replace: true })

        } else {

        }
        if (!email) {
            navigate('/forgot',{ replace: true })
        }
    },[isAuthenticated]);

   
 
    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };
    const toggleConfirmPasswordVisibility = () => {
        setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
    };
    const handleSubmit = async (event) => {
        event.preventDefault();

        const newErrors = {};
        if (!password) {
            newErrors.password = 'Invalid Password';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }
        else if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (confirmPassword !== password) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        const uData = {
            email,
            password
        }
        updatePass(uData)
        setErrors({});


    }

    const updatePass = async (uData) => {
        setIsLoading(true);
        if (uData.email && uData.password) {
            try {
                const response = await fetch('http://localhost:5000/users/auth/updatePass', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(uData),
                });
                if (response.ok) {
                    const data = await response.json();
                    // console.log(data)
                    if (data.msg === 'success') {
                        setTimeout(() => {
                            setIsLoading(false)
                            notifySuccess('Password updated');
                            setTimeout(() => {
                                navigate('/sign-in',{ replace: true });
                            }, 1000);

                        }, 1000);
                    }
                    return { success: true };
                }
                else {
                    setIsLoading(false)
                    const errorData = await response.json();
                    notifyError(errorData.msg);
                    throw new Error(`Error: ${errorData.msg || 'Network response was not ok'}`);
                }
            } catch (error) {
                setIsLoading(false)
                // console.error('Error updating password:', error.message);
                notifyError(error.message);
                return { success: false, message: error.message };
            }
        } else {
            setIsLoading(false)
            return { success: false, message: 'Missing required user data' };
        }
    };
    return (

        <div className='sign-container'>
            <div className='form-container'>
                <div className='title-container'>
                    <div className='auth-logo-container' >
                        <img className='logo-icon' src={logo} alt='logo' />
                    </div>
                    <span className='sign-with'>Update Password</span>
                </div>
                <form onSubmit={handleSubmit} className='sign-form'>
                    <div className='input-wrapper'>
                        <div className='password-label-wrapper'>
                            <label>Create password</label>

                        </div>
                        <div className='pass-input'>
                            <input
                                type={isPasswordVisible ? 'text' : 'password'}
                                className='inputField'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder='new password'

                            />
                            <div className='eye-icon' onClick={togglePasswordVisibility}>
                                {isPasswordVisible ? <LuEye /> : <LuEyeOff />}
                            </div>
                        </div>
                        {errors.password && <span className='error'>{errors.password}</span>}
                    </div>
                    <div className='input-wrapper'>
                        <div className='password-label-wrapper'>
                            <label>Confirm password</label>

                        </div>
                        <div className='pass-input'>
                            <input
                                type={isConfirmPasswordVisible ? 'text' : 'password'}
                                className='inputField'
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder='confirm password'

                            />
                            <div className='eye-icon' onClick={toggleConfirmPasswordVisibility}>
                                {isConfirmPasswordVisible ? <LuEye /> : <LuEyeOff />}
                            </div>
                        </div>
                        {errors.confirmPassword && <span className='error'>{errors.confirmPassword}</span>}
                    </div>

                    <div className='input-wrapper'>
                        <input type='submit' className='inputField' value='Update' />
                    </div>

                </form>
            </div>
            {isLoading && (
                <div className='loading-animation-container'>
                    <div className='loading-animation'>
                        <ClipLoader
                            color="#01A066"
                            loading
                            size={19}
                        />
                        <span style={{color:'white'}}>Updating...</span>
                    </div>
                </div>
            )}

       
        </div>
    )

}
export default UpdatePassword;