import React,{useState} from 'react'
import { Link } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import google from "../assets/googleimg.webp";
import loginimg from "../assets/loginimg.png"
import "../styles/auth.css";
import axios from 'axios';
const Register = () => {
  const [role, setRole] = useState("cashier");
  return (
    <>
        <div className="container">
          {/*login left window*/}
          <div className="left-bar">
            <div className="logo">
                <img src={logo} alt='logo'/>
                <h1 className='title'>STOCKLY</h1>
                <p className='subtitle'>INVENTORY MANAGEMENT SYSTEM</p>
            </div>
            <h2>Welcome To Stockly!!</h2>
            <p className="subtext">Create  your account</p>
                      <div className="roles">

            <button
              className={role === "owner" ? "active-role" : ""}
              onClick={() => setRole("owner")}
              type="button"
            >
              👑 Owner
            </button>

            <button
              className={role === "manager" ? "active-role" : ""}
              onClick={() => setRole("manager")}
              type="button"
            >
              📦 Stock mgr
            </button>

            <button
              className={role === "cashier" ? "active-role" : ""}
              onClick={() => setRole("cashier")}
              type="button"
            >
              💰 Cashier
            </button>

          </div>
            <form className="login-form">
                 <label>Username</label>
                 <input type='name' placeholder='Enter your name'/>
                <label>Email Address</label>
                <input type='email' placeholder='Enter your email'/>
                <label>Password</label>
                <input type='password' placeholder='Enter your password'/>
                <label>Phone No</label>
                <input type='phone' placeholder='Enter your phone number'/>
                <button className='login-btn'><Link to="/">Sign up</Link></button>
                <p className='or'>Or</p>
                <button className='google-btn'><img src={google} alt='google'/>Sign up With Google</button>
                <p className='signup'>Already Have An Account ?<Link to="/register">Sign In</Link>
                </p>
            </form>
          </div>
            {/*right window*/}
            <div className="image-section">
              <img src={loginimg} alt="inventory"/>
              <h3>  The Easiest  Way to Maintain your Inventory !!!</h3>
            </div>
        </div>
      <footer className="footer">
      Made With ❤️ <br />
      Copyright © 2026 Stockly
    </footer>
</>
  );
} 
export default Register ;
