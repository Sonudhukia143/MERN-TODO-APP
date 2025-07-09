import Login from "../Auth/Login";
import Register from "../Auth/Register";
import { useState } from "react";
import "../../styles/UserReg.css";

export default function UserRegistration() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="page">
            <div className="card">
                
                {/* Toggle Button */}
                <div className="toggleContainer">
                    <button className="toggleButton" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "Need an account? Register" : "Already registered? Login"}
                    </button>
                </div>

                {/* Heading */}
                <h2 className="heading">
                    {isLogin ? "Login to Your Account" : "Create a New Account"}
                </h2>

                {/* Auth Forms */}
                <div className="formContainer">
                    {isLogin ? <Login /> : <Register />}
                </div>
            </div>
        </div>
    );
}
