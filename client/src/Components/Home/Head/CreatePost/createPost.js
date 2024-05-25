import { Link } from "react-router-dom";

  function CreatePost() {
    return (
      <div className="CreatePost">
        <Link style={{ textDecoration: "none" }} to="/createpost">
          Đăng tin
        </Link>
      </div>
    );
}
export default CreatePost;
