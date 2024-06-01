import React, { useContext } from "react";
import { StateContext } from "./MyProvider"; // Import context từ MyProvider
import Login from "./Login/login";
import User from "./User/main";
import Title from "./Title/title";
import CreatePost from "./CreatePost/createPost";
import "../homeCSS/home.css";

function Head() {
  const { state, setState } = useContext(StateContext); // Sử dụng context từ MyProvider
  console.log(state);
  return (
    <div className="Head">
      <div className="login_create">
        {state ? <></> : <Login className="Login" />}
        {state ? <CreatePost className="CreatePost" /> : <></>}
        {state ? <User /> : <></>}
      </div>
      <Title />
    </div>
  );
}

export default Head;
