import React, { useState, useEffect } from "react";
import axios from "axios";
import "./user.css";

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
      <h1>Thông tin người dùng tại Phongtro123</h1>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Mã ID</th>
              <th>Tên</th>
              <th>Giới tính</th>
              <th>Ngày sinh</th>
              <th>Số Điện Thoại</th>
              <th>Email</th>
              <th>Bài viết</th>
              <th>Trạng Thái</th>
              <th className="function-cell">Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {userData.map((user) => (
              <tr key={user.id}>
                <td>{user.USERID}</td>
                <td>{user.NAME}</td>
                <td>{user.SEX}</td>
                <td>{user.DOB}</td>
                <td>{user.PHONE}</td>
                <td>{user.EMAIL}</td>
                <td>{user.PASSWORD}</td>
                <td>{user.NEWSCOUNT}</td>
                <td>{user.STATUS}</td>
                <td>
                  <button
                    className="detail-link update-button"
                    onClick={() => handleEdit(user)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {editingUser && (
          <div className="edit-form">
            <h2>Chỉnh sửa thông tin người dùng</h2>
            <input
              type="text"
              name="fullName"
              value={editingUser.fullName}
              onChange={handleChange}
            />
            <input
              type="text"
              name="birthDate"
              value={editingUser.birthDate}
              onChange={handleChange}
            />
            <input
              type="text"
              name="gender"
              value={editingUser.gender}
              onChange={handleChange}
            />
            <input
              type="text"
              name="phoneNumber"
              value={editingUser.phoneNumber}
              onChange={handleChange}
            />
            <input
              type="text"
              name="email"
              value={editingUser.email}
              onChange={handleChange}
            />
            <input
              type="text"
              name="address"
              value={editingUser.address}
              onChange={handleChange}
            />
            <input
              type="text"
              name="status"
              value={editingUser.status}
              onChange={handleChange}
            />
            <button onClick={saveEdit}>Lưu</button>
            <button onClick={cancelEdit}>Hủy</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Main;
