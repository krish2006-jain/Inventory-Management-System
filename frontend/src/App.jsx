import { BrowserRouter as Router,Routes,Route,Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
function App() {
  const [user,setUser]=useState(null);
  const [error,setError]=useState('');

  useEffect(()=>{
   const fetchUser=async()=>{
    const token=localStorage.getItem("token");
    if(token){
      try{
        const res=await axios.get("http://localhost:5000/api/auth/me",{
          headers:{Authorization:`Bearer ${token}`}
        })
        setUser(res.data)
      }
      catch(err){
        setError("Fail to fetch the user data")
        localStorage.removeItem("token");
      }
    }
   };
   fetchUser();
  },[])
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element={<Login/>}/>
      </Routes>
    </Router>
  )
}

export default App;
