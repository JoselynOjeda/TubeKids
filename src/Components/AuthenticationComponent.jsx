import React, { useState, useEffect } from 'react';
import * as Components from './AuthenticationStyles';
import { FaEnvelope, FaLock, FaUser, FaPhone, FaIdBadge, FaGlobe, FaCalendarAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const API_URL = "http://localhost:5000/api/users/";

const initialState = {
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    pin: '',
    name: '',
    surname: '',
    country: '',
    birthDate: '',
};

const AuthenticationComponent = () => {
    const navigate = useNavigate();
    const [signIn, toggle] = useState(initialState);
    const [formData, setFormData] = useState(initialState);
    const [signInData, setSignInData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [countries, setCountries] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/countries')
            .then(res => res.json())
            .then(data => setCountries(data))
            .catch(err => console.error("Error fetching countries:", err));
    }, []);

    const handleChange = (e, isSignIn = false) => {
        const { name, value } = e.target;
        if (isSignIn) {
            setSignInData({ ...signInData, [name]: value });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const resetForm = () => {
        setFormData(initialState);
    };

    const validateForm = () => {
        let errors = [];
        if (!formData.email.includes('@')) errors.push("Invalid email format.");
        if (!formData.email || !formData.password) errors.push("Email and password are required.");
        if (!signIn && (formData.password !== formData.confirmPassword)) errors.push("Passwords do not match.");
        if (!signIn && !formData.name) errors.push("Name is required.");
        if (!signIn && !formData.phone) errors.push("Phone number is required.");

        if (errors.length > 0) {
            Swal.fire({ icon: 'error', title: 'Oops...', html: errors.join('<br/>') });
            return false;
        }
        return true;
    };

    const handleSignup = async () => {
        if (!validateForm()) return;
        try {
            const response = await fetch(`${API_URL}signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok) {
                Swal.fire('Success!', 'Your registration is complete!', 'success');
                resetForm();
                toggle(true);
            } else {
                throw new Error(data.message || 'Failed to register');
            }
        } catch (error) {
            Swal.fire('Error!', error.message, 'error');
        }
    };

    const handleLogin = async () => {
        if (!signInData.email || !signInData.password) {
            Swal.fire('Error!', 'Please provide both email and password.', 'error');
            return;
        }
        try {
            const response = await fetch(`${API_URL}login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signInData)
            });
            const data = await response.json();
            if (response.ok) {
                Swal.fire('Success!', 'You have successfully logged in.', 'success');
                localStorage.setItem('token', data.token);
                navigate('/profile-selector');
            } else {
                throw new Error(data.message || 'Failed to log in');
            }
        } catch (error) {
            Swal.fire('Error!', error.message, 'error');
        }
    };

    const handleSubmit = (event, isSignIn = false) => {
        event.preventDefault();
        isSignIn ? handleLogin() : handleSignup();
    };

    return (
        <div className="auth-page">
            <Components.Container>
                <Components.SignUpContainer signinIn={signIn}>
                    <Components.SignUpForm onSubmit={(e) => handleSubmit(e, false)}>
                        <Components.Title>Create Account</Components.Title>
                        <Components.InputContainer><Components.Icon><FaUser /></Components.Icon><Components.Input type='text' placeholder='Name' name='name' value={formData.name} onChange={handleChange} /></Components.InputContainer>
                        <Components.InputContainer><Components.Icon><FaUser /></Components.Icon><Components.Input type='text' placeholder='Surname' name='surname' value={formData.surname} onChange={handleChange} /></Components.InputContainer>
                        <Components.InputContainer><Components.Icon><FaEnvelope /></Components.Icon><Components.Input type='email' placeholder='Email' name='email' value={formData.email} onChange={handleChange} /></Components.InputContainer>
                        <Components.InputContainer><Components.Icon><FaLock /></Components.Icon><Components.Input type='password' placeholder='Password' name='password' value={formData.password} onChange={handleChange} /></Components.InputContainer>
                        <Components.InputContainer><Components.Icon><FaLock /></Components.Icon><Components.Input type='password' placeholder='Repeat Password' name='confirmPassword' value={formData.confirmPassword} onChange={handleChange} /></Components.InputContainer>
                        <Components.InputContainer><Components.Icon><FaPhone /></Components.Icon><Components.Input type='text' placeholder='Phone Number' name='phone' value={formData.phone} onChange={handleChange} /></Components.InputContainer>
                        <Components.InputContainer><Components.Icon><FaIdBadge /></Components.Icon><Components.Input type='text' placeholder='Pin (6 digits)' name='pin' value={formData.pin} onChange={handleChange} /></Components.InputContainer>
                        <Components.InputContainer>
                            <Components.Icon><FaGlobe /></Components.Icon>
                            <select
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px', border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: '14px' }}
                            >
                                <option value="">Select your country</option>
                                {countries.map((c) => (
                                    <option key={c._id} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </Components.InputContainer>
                        <Components.InputContainer><Components.Icon><FaCalendarAlt /></Components.Icon><Components.Input type='date' placeholder='Date of Birth' name='birthDate' value={formData.birthDate} onChange={handleChange} /></Components.InputContainer>
                        {Object.values(errors).map(error => (<Components.Paragraph key={error} style={{ color: 'red' }}>{error}</Components.Paragraph>))}
                        <Components.Button type='submit'>Sign Up</Components.Button>
                    </Components.SignUpForm>
                </Components.SignUpContainer>

                <Components.SignInContainer signinIn={signIn}>
                    <Components.SignInForm onSubmit={(e) => handleSubmit(e, true)}>
                        <Components.Title>Sign In</Components.Title>
                        <Components.InputContainer><Components.Icon><FaEnvelope /></Components.Icon><Components.Input type='email' placeholder='Email' name='email' value={signInData.email} onChange={(e) => handleChange(e, true)} /></Components.InputContainer>
                        <Components.InputContainer><Components.Icon><FaLock /></Components.Icon><Components.Input type='password' placeholder='Password' name='password' value={signInData.password} onChange={(e) => handleChange(e, true)} /></Components.InputContainer>
                        <Components.Anchor href='#'>Forgot your password?</Components.Anchor>
                        <Components.Button>Sign In</Components.Button>
                    </Components.SignInForm>
                </Components.SignInContainer>

                <Components.OverlayContainer signinIn={signIn}>
                    <Components.Overlay signinIn={signIn}>
                        <Components.LeftOverlayPanel signinIn={signIn}>
                            <Components.Title>Welcome Back!</Components.Title>
                            <Components.Paragraph>Ready for more adventures? Log in with your info!</Components.Paragraph>
                            <Components.GhostButton onClick={() => toggle(true)}>Sign In</Components.GhostButton>
                        </Components.LeftOverlayPanel>
                        <Components.RightOverlayPanel signinIn={signIn}>
                            <Components.Title>Hello, New Explorer!</Components.Title>
                            <Components.Paragraph>Join us and discover a world of fun and learning!</Components.Paragraph>
                            <Components.GhostButton onClick={() => toggle(false)}>Sign Up</Components.GhostButton>
                        </Components.RightOverlayPanel>
                    </Components.Overlay>
                </Components.OverlayContainer>
            </Components.Container>
        </div>
    );
};

export default AuthenticationComponent;
