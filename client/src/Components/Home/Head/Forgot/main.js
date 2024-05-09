import React, { useState } from "react";
import "./forgot.css"; // Import CSS file for styling
import { useNavigate } from "react-router-dom"; // Import useHistory hook
import Back from "../../../Back/back.js"; //
import Slogan from "../../../Slogan/slogan";
import axios from "axios"; // Import Axios for making HTTP requests
import validator from "validator"; // Import thư viện validator

const Main = () => {
  const history = useNavigate(); // Sử dụng useHistory hook để điều hướng
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!validator.isLength(formData.username, { min: 3 })) {
      newErrors.username = "Tên người dùng phải có ít nhất 3 ký tự";
    }
    if (!validator.isEmail(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!validator.isLength(formData.password, { min: 6 })) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/forgot-password",
          formData
        ); 
        if (response.status === 404) {
          alert("Tên hoặc Email không đúng!");
        }
        if (response.status === 200) {
          alert("Đã thay đổi mật khẩu thành công");
          history("/login"); // Điều hướng đến trang đăng nhập
        }
      } catch (error) {
        alert(error);
        alert("Có lỗi xảy ra khi thay đổi mật khẩu");
      }
    }
  };

  return (
    <div className="Main">
      <Back />
      <Slogan />
      <div className="forgot-password-form-container">
        <h2>Quên mật khẩu</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Tên người dùng:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <p className="error">{errors.username}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu mới:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>
          <button type="submit">Gửi yêu cầu</button>
        </form>
      </div>
    </div>
  );
};

export default Main;
