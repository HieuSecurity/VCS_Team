import { Link } from "react-router-dom";

function CreateReport() {
  const handleClick = () => {
    // Kiểm tra nếu có thông tin đăng nhập trong localStorage
    if (localStorage.getItem("loggedIn")) {
      // Đã đăng nhập, điều hướng đến trang createPost
      window.location.href = "/report";
    } else {
      // Chưa đăng nhập, hiển thị thông báo
      alert("Bạn cần phải đăng nhập trước khi báo cáo !!!");
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
        Báo cáo
      </div>
    </div>
  );
}

export default CreateReport;
