import CreatePost from "./CreatePost/createPost";
import Login from "./Login/login";
import Title from "./Title/title";
import "../homeCSS/home.css";
function Head() {
  return (
    <div className="Head">
      <div className="login_create">
        <Login className="Login" />
        <CreatePost className="CreatePost" />
        123{" "}
      </div>
      <Title />
    </div>
  );
}

export default Head;
