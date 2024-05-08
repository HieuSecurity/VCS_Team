import React, { useState } from "react";
import axios from "axios";
import "./login.css"; // Import CSS file for styling
import Back from "../../../Back/back";
import Slogan from "../../../Slogan/slogan";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Main = () => {
  const history = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState(""); // State để lưu trạng thái thông báo lỗi

  // Xử lý sự kiện khi người dùng thay đổi giá trị trong các trường input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Xử lý sự kiện khi người dùng nhấn nút Đăng nhập
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Gửi yêu cầu POST đến API /api/login với thông tin đăng nhập từ formData
      const response = await axios.post(
        "http://localhost:3000/api/login",
        formData
      );
      console.log(response.data.user.role);
      // Nếu đăng nhập thành công, chuyển hướng đến trang admin hoặc user tùy thuộc vào vai trò của người dùng
      if (response.status === 200) {
        const { role } = response.data.user;
        console.log(role === 1);
        if (role == 1) {
          history("/admin");
        } else {
          history("/user");
        }
      }
    } catch (error) {
      // Nếu xảy ra lỗi, hiển thị thông báo lỗi
      if (error.response && error.response.status === 403) {
        // Kiểm tra nếu tài khoản bị khóa
        alert("Tài khoản đã bị khóa. Vui lòng liên hệ Admin!!!"); // Thiết lập thông báo lỗi
      } else {
        alert("Tài khoản hoặc mật khẩu không chính xác !");
      }
    }
  };

  return (
    <div className="Main">
      <Back className="back" />
      <Slogan className="slogan" style={{ marginTop: "-50px" }} />
      <div className="login-form-container">
        <h2>Đăng nhập</h2>
        {error && <p className="error">{error}</p>}{" "}
        {/* Hiển thị thông báo lỗi (nếu có) */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="button-group">
            <button type="submit">Đăng nhập</button>
            <div className="login-links" style={{ marginTop: "30px" }}>
              <Link to="/signup">Đăng ký</Link>
              <span> | </span>
              <Link to="/forgot">Quên tài khoản</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Main;
