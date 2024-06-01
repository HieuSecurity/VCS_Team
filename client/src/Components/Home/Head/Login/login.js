import React, { useEffect } from "react";
import { Link } from "react-router-dom";

function Login({ onLogin }) {
  const handleLoginState = () => {
    onLogin(true);
  };

  return (
    <div>
      <Link style={{ textDecoration: "none" }} to="/login">
        
      </Link>
    </div>
  );
}

export default Login;
