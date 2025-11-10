import { GoogleLogin } from '@react-oauth/google'
import React from 'react'
import { googleLogin } from '../services/auth.service'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const navigate = useNavigate();

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const response = await googleLogin(credentialResponse.credential);

            localStorage.setItem("token", response.accessToken);
            localStorage.setItem("name", response.user.name);
            localStorage.setItem("avatar", response.user.avatar);

            window.dispatchEvent(new Event('userChanged'));
            navigate('/');
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Đăng nhập bằng Google</h2>
            <GoogleLogin onSuccess={handleGoogleLogin} onError={() => alert("Đăng nhập thất bại")} />
        </div>
    )
}

export default Login