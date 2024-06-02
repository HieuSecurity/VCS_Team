import React, { useState } from "react";
import "./forgot.css"; // Import CSS file for styling
import { useNavigate } from "react-router-dom"; // Import useHistory hook
import Back from "../../../Back/back.js";
import Slogan from "../../../Slogan/slogan";
import axios from "axios"; // Import Axios for making HTTP requests
import validator from "validator"; // Import thư viện validator

const Main = () => {
  const history = useNavigate(); // Sử dụng useHistory hook để điều hướng
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    newPassword: "",
    confirmNewPassword: "",
    otp: "",
  });

  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // Bước hiện tại của form

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

    if (step === 1) {
      if (!validator.isEmail(formData.email)) {
        newErrors.email = "Email không hợp lệ";
      }
      if (!validator.isLength(formData.newPassword, { min: 6 })) {
        newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        newErrors.confirmNewPassword = "Mật khẩu nhập lại không khớp";
      }
    } else if (step === 2) {
      if (!validator.isNumeric(formData.otp) || formData.otp !== "123456") {
        newErrors.otp = "Mã OTP không hợp lệ";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      try {
        if (step === 1) {
          // Kiểm tra tài khoản và mật khẩu mới
          const response = await axios.get(
            `http://localhost:3000/api/get-userid-byEmail/${formData.email}`);

          if (response.data && response.data.USERID) {
            setStep(2); // Chuyển sang bước 2
          } else {
            alert("Email không tồn tại trên hệ thống");
          }
        } else if (step === 2) {
          // Xác nhận mã OTP và cập nhật mật khẩu mới
          const response = await axios.post(
            "http://localhost:3000/api/update-password",
            {
              email: formData.email,
              newPassword: formData.newPassword,
            }
          );
          if (response.status === 200) {
            alert("Đã thay đổi mật khẩu thành công");
            history("/login"); // Điều hướng đến trang đăng nhập
          } else {
            alert("Có lỗi xảy ra khi thay đổi mật khẩu");
          }
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Có lỗi xảy ra khi thực hiện yêu cầu");
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
          {step === 1 && (
            <>
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
                <label htmlFor="newPassword">Mật khẩu mới:</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
                {errors.newPassword && (
                  <p className="error">{errors.newPassword}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="confirmNewPassword">Nhập lại mật khẩu mới:</label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                />
                {errors.confirmNewPassword && (
                  <p className="error">{errors.confirmNewPassword}</p>
                )}
              </div>
            </>
          )}
          {step === 2 && (
            <div className="form-group">
              <label htmlFor="otp">Mã OTP đã gửi về email (123456):</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
              />
              {errors.otp && <p className="error">{errors.otp}</p>}
            </div>
          )}
          <button type="submit">
            {step === 1 ? "Gửi yêu cầu" : "Xác nhận"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Main;
