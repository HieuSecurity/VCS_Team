import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useHistory hook
import Back from "../../../Back/back.js";
import Slogan from "../../../Slogan/slogan";
import axios from "axios"; // Import Axios for making HTTP requests
import validator from "validator"; // Import thư viện validator

const Main = () => {
  const history = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    otp: "", // Thêm trường cho OTP
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

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (step === 1) {
      const user = JSON.parse(localStorage.getItem("user"));
      console.log(user);

      if (formData.newPassword !== formData.confirmNewPassword) {
        newErrors.confirmNewPassword = "Mật khẩu mới không khớp";
      }
      else if (formData.currentPassword !== user.PASSWORD) {
        console.log(formData.currentPassword)
        console.log(user.PASSWORD)
        newErrors.currentPassword = "Mật khẩu hiện tại không đúng";
      }
      else if (!validatePassword(formData.newPassword)) {
        newErrors.newPassword =
          "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt";
      }
    } else if (step === 2) {
      if (formData.otp !== "123456") {
        newErrors.otp = "Mã OTP không hợp lệ";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      try {
        // Xóa các thông báo lỗi trước khi gửi đi
        setErrors({});

        if (step === 1) {
          setStep(2);
        } else if (step === 2) {
          const user = JSON.parse(localStorage.getItem("user"));
          const response = await axios.post("http://localhost:3000/api/update-password", {
            email: user.EMAIL,
            newPassword: formData.newPassword,
          });

          if (response.status === 200) {
            alert("Đã thay đổi mật khẩu thành công");
            history("/");
          }
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
          {step === 1 && (
            <>
              <div className="form-group">
                <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
                {errors.currentPassword && (
                  <p className="error">{errors.currentPassword}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">Mật khẩu mới</label>
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
                <label htmlFor="confirmNewPassword">Nhập lại mật khẩu mới</label>
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
              <label htmlFor="otp">Mã OTP đã gửi về email</label>
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
