import CreatePost from "./CreatePost/createPost";
import Login from "./Login/login";
import Title from "./Title/title";
import "../homeCSS/home.css";
import { useEffect, useState } from "react";
function Head() {
  const [isLogined, SetIsLogined] = useState(false);
  useEffect(() => {
    console.log(isLogined);
  });
  const SendValue = (status) => {
    SetIsLogined(status);
  };
  return (
    <div className="Head">
      <div className="login_create">
        <Login onSendValue={SendValue} className="Login" />
        <CreatePost className="CreatePost" />
      </div>
      <Title />
    </div>
  );
}

export default Head;
