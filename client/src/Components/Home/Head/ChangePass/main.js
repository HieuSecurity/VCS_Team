import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useHistory hook
import Back from "../../../Back/back.js"; //
import Slogan from "../../../Slogan/slogan";
import axios from "axios"; // Import Axios for making HTTP requests
import validator from "validator"; // Import thư viện validator

const Main = () => {
  const history = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    password1: "", // Thêm trường cho mật khẩu mới
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

    if (!validator.isLength(formData.password, { min: 6 })) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!validator.isLength(formData.password1, { min: 6 })) {
      newErrors.password1 = "Mật khẩu mới phải có ít nhất 6 ký tự";
    }
    if (formData.password !== formData.password1) {
      newErrors.password1 = "Mật khẩu mới không khớp";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      try {
        // Xóa các thông báo lỗi trước khi gửi đi
        setErrors({});

        const response = await axios.post(
          "http://localhost:3000/api/forgot-password",
          formData
        );
        if (response.status === 404) {
          alert("Tên hoặc Email không đúng!");
        }
        if (response.status === 200) {
          alert("Đã thay đổi mật khẩu thành công");
          history("/login");
        }
      } catch (error) {
        alert("Có lỗi xảy ra khi thay đổi mật khẩu");
      }
    }
  };

  return (
    <div className="Main">
      <Back />
      <Slogan />
      <div className="forgot-password-form-container">
        <h2>Thay đổi mật khẩu</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu hiện tại</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="password1">Mật khẩu mới</label>
            <input
              type="password"
              id="password1"
              name="password1"
              value={formData.password1}
              onChange={handleChange}
            />
            {errors.password1 && <p className="error">{errors.password1}</p>}
          </div>
          <button type="submit">Cập nhật</button>
        </form>
      </div>
    </div>
  );
};

export default Main;
