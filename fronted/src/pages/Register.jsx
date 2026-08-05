import React, {useState, useContext} from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import '../styles/auth.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState ('');
    const [password, setPassword] = useState('');
    const {login} = useContext(AuthContext);
    const navigate = useNavigate();

    const handelSubmit = async (e) => {
        e.preventDefault();
        try{
            const res = await fetch('/api/auth/register',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({name, email, password})
            });
            const data = await res.json();
            if(res.ok){
                alert('Registration Successfully Please check your email for the welcome OTP.');
                login(data);
                navigate('/');
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handelSubmit} className="auth-form">
                <h2>Register</h2>
                <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                <button type="submit" className="btn">Register</button>
                <p>Already have an account? <Link to="/login">Login</Link></p>
            </form>
        </div>
    );
};

export default Register;