import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, parseISO } from "date-fns";
import "./info.css";

function Main() {
  const [userData, setUserData] = useState([]);
  const [editingUser, setEditingUser] = useState(null); // State để lưu trữ thông tin người dùng đang được chỉnh sửa

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")); // Lấy đối tượng user từ localStorage
    if (user && user.EMAIL) {
      axios
        .get(`http://localhost:3000/api/get-userid-byEmail/${user.EMAIL}`)
        .then((response) => {
          const userId = response.data.USERID;
          fetchData(userId);
        })
        .catch((error) => {
          console.error("Error fetching user ID:", error);
        });
    }
  }, []);

  const fetchData = (userId) => {
    axios
      .get(`http://localhost:3000/api/user-info/${userId}`)
      .then((response) => {
        // Gói dữ liệu trong một mảng
        setUserData([response.data]);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  // Function để mở form chỉnh sửa
  const handleEdit = (user) => {
    // Chuyển đổi ngày tháng sang định dạng ISO string trước khi hiển thị
    const formattedUser = {
      ...user,
      DOB: format(parseISO(user.DOB), "yyyy-MM-dd"),
    };
    setEditingUser(formattedUser);
  };

  // Function để đóng form chỉnh sửa
  const cancelEdit = () => {
    setEditingUser(null);
  };

  // Function để gửi dữ liệu chỉnh sửa
  const saveEdit = () => {
    // Chuyển đổi ngày tháng từ định dạng `yyyy/mm/dd` sang `yyyy-mm-dd`
    const editedUser = {
      ...editingUser,
      DOB: editingUser.DOB.replace(/\//g, "-"),
    };

    // Validate số điện thoại trước khi lưu
    if (!validatePhoneNumber(editedUser.PHONE)) {
      alert(
        "Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại có 10 chữ số bắt đầu bằng số 0."
      );
      return;
    }

    // Gửi dữ liệu chỉnh sửa lên server
    axios
      .put(
        `http://localhost:3000/api/update-userinfo/${editingUser.USERID}`,
        editedUser
      )
      .then(() => {
        // Cập nhật lại state userData sau khi chỉnh sửa
        fetchData(editingUser.USERID);
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
    // Cập nhật state chỉ khi hợp lệ
    setEditingUser({ ...editingUser, [name]: value });
  };

  const validatePhoneNumber = (phoneNumber) => {
    // Sử dụng biểu thức chính quy để kiểm tra định dạng số điện thoại
    // Ví dụ đơn giản: Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0
    const phonePattern = /^0\d{9}$/;
    return phonePattern.test(phoneNumber);
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "null";
      const parsedDate = parseISO(dateString);
      return format(parsedDate, "yyyy/MM/dd");
    } catch (error) {
      console.error("Error parsing date:", error);
      return "Invalid Date";
    }
  };

  return (
    <div className="Main">
      <h1>Thông tin người dùng !</h1>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Mã ID</th>
              <th>Họ và Tên</th>
              <th>Ngày Sinh</th>
              <th>Giới Tính</th>
              <th>Số Điện Thoại</th>
              <th>Email</th>
              <th>Địa chỉ</th>
              <th className="function-cell">Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {userData.map((user) => (
              <tr key={user.USERID}>
                <td>{user.USERID}</td>
                <td>{user.NAME}</td>
                <td>{formatDate(user.DOB)}</td>
                <td>{user.SEX}</td>
                <td>{user.PHONE}</td>
                <td>{user.EMAIL}</td>
                <td>{user.ADDRESS}</td>
                <td>
                  <button
                    className="detail-link update-button"
                    onClick={() => handleEdit(user)}
                  >
                    Sửa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {editingUser && (
          <div className="edit-form">
            <h2>Chỉnh sửa thông tin người dùng</h2>
            <div className="form-group">
              <label>Họ và Tên:</label>
              <input
                type="text"
                name="NAME"
                value={editingUser.NAME}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Ngày Sinh (mm/dd/yyyy):</label>
              <input
                type="date"
                name="DOB"
                value={editingUser.DOB}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Giới Tính:</label>
              <input
                type="text"
                name="SEX"
                value={editingUser.SEX}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Số Điện Thoại:</label>
              <input
                type="text"
                name="PHONE"
                value={editingUser.PHONE}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Địa chỉ:</label>
              <input
                type="text"
                name="ADDRESS"
                value={editingUser.ADDRESS}
                onChange={handleChange}
              />
            </div>
            <button onClick={saveEdit}>Lưu</button>
            <button onClick={cancelEdit}>Hủy</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Main;
