import { useEffect } from "react";
import { Link } from "react-router-dom";

function Login({ onSendValue }) {
  useEffect(() => {
    onSendValue(true);
  });
  return (
    <div className="Login">
      <Link style={{ textDecoration: "none" }} to="/login">
        Đăng nhập
      </Link>
    </div>
  );
}

export default Login;
