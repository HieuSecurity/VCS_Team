import { Link } from "react-router-dom";

function CreatePost() {
  return (
    <div
      style={{ marginRight: "20px", backgroundColor: "#dc3545" }}
      className="CreatePost"
    >
      <Link style={{ textDecoration: "none", color: "#fff" }} to="/createpost">
        Đăng tin
      </Link>
    </div>
  );
}
export default CreatePost;
