<<<<<<< Updated upstream
import React, { useState, useEffect } from "react";
import axios from "axios";
=======
import React, { useState, useContext } from "react";
>>>>>>> Stashed changes
import { Link } from "react-router-dom";
import "../User/style.css";
import { StateContext } from "../MyProvider"; // Import context từ MyProvider
function Main() {
  const [showModal, setShowModal] = useState(false);
<<<<<<< Updated upstream
  const [userName, setUserName] = useState("Người dùng");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Lấy dữ liệu từ localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.EMAIL) {
      getUserIdByEmail(user.EMAIL, (userId) => {
        getUserInfo(userId, (userInfo) => {
          setUserName(userInfo.NAME); // Thông tin người dùng có thuộc tính 'name'
          setIsLoggedIn(true);
        });
      });
    }
  }, []);

  const getUserIdByEmail = (email, callback) => {
    axios
      .get(`http://localhost:3000/api/get-userid-byEmail/${email}`)
      .then((response) => {
        callback(response.data.USERID); // Giả sử phản hồi chứa USERID
      })
      .catch((error) => {
        console.error("Error fetching USERID:", error);
      });
  };

  const getUserInfo = (userId, callback) => {
    axios
      .get(`http://localhost:3000/api/user-info/${userId}`)
      .then((response) => {
        callback(response.data); // Giả sử phản hồi chứa thông tin người dùng
      })
      .catch((error) => {
        console.error("Error fetching user info:", error);
      });
  };
=======
  const { state, setState } = useContext(StateContext); // Sử dụng context từ MyProvider
>>>>>>> Stashed changes

  const showUserForm = () => {
    setShowModal(true);
    document.body.classList.add("modal-active"); // Thêm class để ngăn cuộn trang khi modal hiển thị
  };

  const hideUserForm = () => {
    setShowModal(false);
    document.body.classList.remove("modal-active"); // Loại bỏ class để cho phép cuộn trang khi modal ẩn đi
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("overlay")) {
      hideUserForm();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserName("Người dùng");
    hideUserForm();
  };

  return (
    <div className={`Main ${showModal ? "modal-active" : ""}`}>
      {isLoggedIn ? (
        <div onClick={showUserForm} className="user">
          <img
            style={{ height: "70px", borderRadius: "50%" }}
            src="https://t4.ftcdn.net/jpg/03/49/49/79/360_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg"
            alt="User Avatar"
          />
          <span
            style={{
              marginRight: "2px",
              marginLeft: "10px",
              fontWeight: "700",
            }}
          >
            {userName}
          </span>
        </div>
      ) : (
        <Link to="/login" className="login-button">
          Đăng nhập
        </Link>
      )}
      {showModal && (
        <div className="overlay" onClick={handleOverlayClick}></div>
      )}
      {showModal && (
        <div className="modal">
          <div
            style={{
              alignItems: "center",
              textAlign: "center",
            }}
            className="modal-content"
          >
            <Link to="/user/info" style={{ margin: "15px 0" }}>
              Xem thông tin
            </Link>
            <Link to="/changepassword" style={{ margin: "15px 0" }}>
              Thay đổi mật khẩu
            </Link>
<<<<<<< Updated upstream
            <Link to="/" onClick={handleLogout} style={{ margin: "15px 0" }}>
=======
            <Link to="/login" style={{ margin: "15px 0" }}>
>>>>>>> Stashed changes
              Đăng xuất
            </Link>
            <span
              style={{ backgroundColor: "red", padding: "3px" }}
              className="close"
              onClick={hideUserForm}
            >
              &times;
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Main;
