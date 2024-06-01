import React, { useEffect } from "react";
import { Link } from "react-router-dom";

function Login() {
  return (
    <div>
      <Link
        style={{
          textDecoration: "none",
          backgroundColor: "rgb(220, 53, 69)",
          borderRadius: "5px",
          padding: "10px",
          color: "white",
        }}
        to="/login"
      >
        Đăng nhập
      </Link>
    </div>
  );
}

export default Login;
