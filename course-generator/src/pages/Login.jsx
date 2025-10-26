import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Helper function to generate a simple unique ID
const generateUniqueId = () => {
  // A simple method: timestamp + short random string
  return 'USER-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5).toUpperCase();
};

const Login = () => {
  const navigate = useNavigate();
  
  // 🛑 Removed 'name' state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // 🛑 Removed 'userId' state
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = () => {
    setError("");
    setSuccess("");

    // 🛑 Updated required fields: now only username and password are required
    if (!username || !password) {
      setError("Username and Password are required.");
      return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let existingUser = users.find((u) => u.username === username);

    if (existingUser) {
      if (
        // 🛑 Removed check for 'name' in existing user logic
        existingUser.password === password
      ) {
        localStorage.setItem("currentUser", JSON.stringify(existingUser));
        setSuccess("Login successful!");
        navigate("/main");
      } else {
        // 🛑 Updated error message
        setError("Incorrect password for this username.");
      }
    } else {
      // User does not exist, so register them
      const uniqueId = generateUniqueId(); // Using the improved function
      // 🛑 The new user object only stores username (as name) and username
      const newUser = { 
          name: username, // Using username for the name field for compatibility
          username: username, 
          password: password, 
          id: uniqueId, 
          courses: [],
          savedCourses: [] 
      };
      
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      
      // CRITICAL: Display the unique ID to the user upon successful creation.
      setSuccess(`Account created successfully! Your Unique ID is: ${uniqueId}`);
      navigate("/main");
    }
  };

  // 🛑 Removed handleIdLogin function completely
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#060c14] text-white relative overflow-hidden font-sans">
      {/* Gradient background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d1b2a] via-[#162447] to-[#1b263b] opacity-90" />
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-sky-500/20 to-indigo-700/30 rounded-full blur-3xl top-20 left-20" />
      <div className="absolute w-[400px] h-[400px] bg-gradient-to-tr from-blue-700/30 to-sky-400/20 rounded-full blur-3xl bottom-20 right-20" />

      {/* Main glassmorphic card */}
      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-10 text-center">
        <h1 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
          Welcome to COURSEHUB
        </h1>
        <p className="text-gray-300 mb-8 text-sm">
          Create your profile or log in to continue your personalized learning journey.
        </p>

        {/* Signup/Login fields */}
        <div className="flex flex-col gap-4 text-left">
          {/* 🛑 Removed Full Name input field */}
          
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm mt-3 font-medium">{error}</p>
        )}
        {success && (
          <p className="text-green-400 text-sm mt-3 font-medium">{success}</p>
        )}

        {/* Continue button */}
        <button
          onClick={handleLogin}
          className="mt-8 w-full bg-gradient-to-r from-sky-500 to-indigo-600 py-3 rounded-full text-lg font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition shadow-lg"
        >
          Continue <ArrowRight className="w-5 h-5" />
        </button>

        {/* 🛑 Removed the Divider and the entire Login with ID section */}

        <button
          onClick={() => navigate("/")}
          className="mt-6 text-sky-400 hover:text-sky-300 transition text-sm underline underline-offset-2"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default Login;