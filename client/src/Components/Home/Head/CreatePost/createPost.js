import { Link } from "react-router-dom";

function CreatePost() {
  const handleClick = () => {
    // Kiểm tra nếu có thông tin đăng nhập trong localStorage
    if (localStorage.getItem("loggedIn")) {
      // Đã đăng nhập, điều hướng đến trang createPost
      window.location.href = "/createPost";
    } else {
      // Chưa đăng nhập, hiển thị thông báo
      alert("Bạn cần phải đăng nhập trước khi đăng tin !!!");
    }
  };

  return (
    <div
      style={{
        marginRight: "20px",
        backgroundColor: "#dc3545",
        padding: "10px",
        borderRadius: "5px",
      }}
      className="CreatePost"
    >
      {/* Sử dụng onClick để kiểm tra đăng nhập trước khi điều hướng */}
      <div
        onClick={handleClick}
        style={{ textDecoration: "none", color: "#fff", cursor: "pointer" }}
      >
        Đăng tin
      </div>
    </div>
  );
}

export default CreatePost;
