import React, { useState, useEffect } from "react";
import axios from "axios";
import "./info.css";
import { Link } from "react-router-dom";

function Main() {
  const [userData, setUserData] = useState([]);
  const [editingUser, setEditingUser] = useState(null); // State để lưu trữ thông tin người dùng đang được chỉnh sửa

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios
      .get("http://localhost:3000/api/info")
      .then((response) => {
        setUserData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  // Function để mở form chỉnh sửa
  const handleEdit = (user) => {
    setEditingUser(user);
  };

  // Function để đóng form chỉnh sửa
  const cancelEdit = () => {
    setEditingUser(null);
  };

  // Function để gửi dữ liệu chỉnh sửa
  const saveEdit = () => {
    // Gửi dữ liệu chỉnh sửa lên server
    axios
      .put(`http://localhost:3000/api/info/${editingUser.id}`, editingUser)
      .then(() => {
        // Cập nhật lại state userData sau khi chỉnh sửa
        fetchData();
        // Đóng form chỉnh sửa
        cancelEdit();
      })
      .catch((error) => {
        console.error("Error updating user:", error);
      });
  };

  // Function để cập nhật giá trị của trường trong form chỉnh sửa
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingUser({ ...editingUser, [name]: value });
  };

  return (
    <div className="Main">
      <div className="post">
        <h2>Mã bài đăng: N21DCAT001</h2>
        <p>
          Nội dung : Bài đăng đã không được duyệt vì vi phạm nội dung bài đăng !
        </p>
        <Link
          to="/detail/6"
          style={{ fontSize: "20px", fontWeight: "800" }}
          className="update-button"
        >
          Xem chi tiết bài đăng
        </Link>
      </div>
    </div>
  );
}

export default Main;
