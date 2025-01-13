import { useState, useEffect } from 'react';
import { Link, useNavigate  } from 'react-router-dom';
// icons
import logo from '../assets/logo/favicon.png';
// contexts
import { useAuth } from '../contexts/AuthContext';
// css styles
import './styles.css';
// react-icons
import { FcGoogle } from "react-icons/fc";
import { LuEye, LuEyeOff, } from "react-icons/lu";

// loaders
import { ClipLoader } from 'react-spinners';

function SignIn() {
    const navigate = useNavigate();
    
    const {
        email,
        setEmail,
        password,
        setPassword,
        isLoading,
        handleGoogleSignIn,
        handleSignIn,
        errors,
        isAuthenticated,
        user
    } = useAuth();

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);


    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    useEffect(() => {
        if (isAuthenticated)
            navigate("/",{ replace: true });
    }, [isAuthenticated, user])

    return (
        <div className='sign-container'>
            <div className='form-container'>
                <div className='title-container'>
                    <div className='auth-logo-container'>
                        <img className='logo-icon' src={logo} alt='logo' />
                    </div>
                    <span className='sign-with'>Sign In</span>
                </div>
                <form onSubmit={handleSignIn} className='sign-form'>
                    <div className='input-wrapper'>
                        <label>Email Address</label>
                        <input
                            type='email'
                            name='email'
                            className='inputField'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='email'

                        />
                        {errors.email && <span className='error'>{errors.email}</span>}
                    </div>
                    <div className='input-wrapper'>
                        <div className='password-label-wrapper'>
                            <label>Password</label>
                            <Link className='forgot-pass' to='/forgot'>Forgot Password?</Link>
                        </div>
                        <div className='pass-input'>
                            <input
                                type={isPasswordVisible ? 'text' : 'password'}
                                className='inputField'
                                value={password}
                                placeholder='password'
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className='eye-icon' onClick={togglePasswordVisibility}>
                                {isPasswordVisible ? <LuEye /> : <LuEyeOff />}
                            </div>
                        </div>
                        {errors.password && <span className='error'>{errors.password}</span>}
                    </div>
                    <div className='input-wrapper'>
                        <input
                            type='submit'
                            value='Sign In'
                        />
                    </div>
                    <div className='new-acc-wrapper'>
                        <span className='newtogchat'>New to GChat?</span>
                        <Link className='create-acc-link' to='/sign-up'>Create an account</Link>
                    </div>
                </form>
                <div className='separator-container'>
                    <div className='line'></div>
                    <div className='or-text'>OR</div>
                    <div className='line'></div>
                </div>
                <div className='sign-with-google-container' onClick={handleGoogleSignIn}>
                    <FcGoogle className='google-icon' />
                    <span className='sign-with-google'>Continue with Google</span>
                </div>
            </div>
            {isLoading && (
                <div className='loading-animation-container'>
                    <div className='loading-animation'>
                        <ClipLoader
                            color="#01A066"
                            loading
                            size={19}
                        />
                        <span style={{color:'white'}}>Sign In...</span>
                    </div>
                </div>
            )}
            {/* <ToastContainer/> */}
        </div>

    );
}

export default SignIn;