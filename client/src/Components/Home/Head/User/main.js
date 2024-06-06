import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import "../User/style.css";
import axios from "axios";
import { StateContext } from "../MyProvider"; // Import context từ MyProvider

function Main() {
  const [showModal, setShowModal] = useState(false);
  const { state, setState } = useContext(StateContext); // Sử dụng context từ MyProvider
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.EMAIL) {
      setRole(user.ROLE);
      if (user.ROLE === 1) {
        axios
          .get(`http://localhost:3000/api/get-adminId-byEmail/${user.EMAIL}`)
          .then((response) => {
            const adminId = response.data.ADMINID;
            axios
              .get(`http://localhost:3000/api/get-adminInfo-byId/${adminId}`)
              .then((response) => {
                setUserName(response.data.NAME);
              })
              .catch((error) => {
                console.error("Error fetching admin info:", error);
              });
          })
          .catch((error) => {
            console.error("Error fetching admin ID:", error);
          });
      } else {
        axios
          .get(`http://localhost:3000/api/get-userid-byEmail/${user.EMAIL}`)
          .then((response) => {
            const userId = response.data.USERID;
            axios
              .get(`http://localhost:3000/api/user-info/${userId}`)
              .then((response) => {
                setUserName(response.data.NAME);
              })
              .catch((error) => {
                console.error("Error fetching user info:", error);
              });
          })
          .catch((error) => {
            console.error("Error fetching user ID:", error);
          });
      }
    }
  }, []);

  const handleLogout = () => {
    // Xóa dữ liệu từ localStorage khi đăng xuất
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("user");
    setState(false);
  };

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

  const infoLink = role === 1 ? "/admin/info" : "/user/info";
  const infoLabel = role === 1 ? "Quản lý" : "Xem thông tin";

  return (
    <div className={`Main ${showModal ? "modal-active" : ""}`}>
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
      {showModal && <div className="overlay" onClick={handleOverlayClick}></div>}
      {showModal && (
        <div className="modal">
          <div
            style={{
              alignItems: "center",
              textAlign: "center",
            }}
            className="modal-content"
          >
            <Link to={infoLink} style={{ margin: "15px 0" }}>
              {infoLabel}
            </Link>
            <Link to="/changepassword" style={{ margin: "15px 0" }}>
              Thay đổi mật khẩu
            </Link>
            <Link to="/" style={{ margin: "15px 0" }} onClick={handleLogout}>
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
