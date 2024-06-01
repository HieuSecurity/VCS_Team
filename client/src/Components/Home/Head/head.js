import React, { useContext, useEffect } from "react";
import { StateContext } from "./MyProvider"; // Import context từ MyProvider
import Login from "./Login/login";
import User from "./User/main";
import Title from "./Title/title";
import CreatePost from "./CreatePost/createPost";
import "../homeCSS/home.css";

function Head() {
  const { state, setState } = useContext(StateContext); // Sử dụng context từ MyProvider

  // Sử dụng useEffect để kiểm tra và cập nhật state từ localStorage khi component được render
  useEffect(() => {
    const loggedIn = JSON.parse(localStorage.getItem("loggedIn"));
    if (loggedIn) {
      setState(true); // Cập nhật state từ localStorage
    }
  }, []);

  console.log(state);

  return (
    <div className="Head">
      <div className="login_create">
        {state ? (
          <CreatePost className="CreatePost" />
        ) : (
          <Login className="Login" />
        )}
        {state ? <User /> : null}
      </div>
      <Title />
    </div>
  );
}

export default Head;
