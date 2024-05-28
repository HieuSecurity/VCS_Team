import React, { useState, useEffect } from "react";
import axios from "axios";
import "./user.css";

function Main() {
  const [userData, setUserData] = useState([]);
  const [editingUser, setEditingUser] = useState(null); // State để lưu trữ thông tin người dùng đang được chỉnh sửa

  useEffect(() => {
    fetchUserIds();
  }, []);

  const fetchUserIds = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/get-list-userID");
      const userIds = response.data;
      fetchUserData(userIds);
    } catch (error) {
      console.error("Error fetching user IDs:", error);
    }
  };

  const fetchUserData = async (userIds) => {
    try {
      const userPromises = userIds.map((user) => 
        axios.get(`http://localhost:3000/api/user-info/${user.USERID}`)
      );
      const users = await Promise.all(userPromises);
      setUserData(users.map(user => user.data));
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
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
      .put(`http://localhost:3000/api/listUser-info/${editingUser.USERID}`, editingUser)
      .then(() => {
        // Cập nhật lại state userData sau khi chỉnh sửa
        fetchUserIds();
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
              <tr key={user.USERID}>
                <td>{user.USERID}</td>
                <td>{user.NAME}</td>
                <td>{user.SEX}</td>
                <td>{user.DOB}</td>
                <td>{user.PHONE}</td>
                <td>{user.EMAIL}</td>
                <td>{user.NEWSCOUNT}</td>
                <td>{user.STATUS}</td>
                <td>
                  {user.STATUS === "hoat dong" ? (
                    <button
                      className="detail-link update-button"
                      onClick={() => handleEdit(user)}
                    >
                      Cấm
                    </button>
                  ) : (
                    <button
                      className="detail-link update-button"
                      onClick={() => handleEdit(user)}
                    >
                      Bỏ Cấm
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {editingUser && (
          <div className="edit-form">
            <h2>Chỉnh sửa trạng thái người dùng</h2>
            <p>Mã ID: {editingUser.USERID}</p>
            <p>Tên: {editingUser.NAME}</p>
            <p>
              Trạng Thái: 
              <select
                name="STATUS"
                value={editingUser.STATUS}
                onChange={handleChange}
              >
                <option value="active">Hoạt động</option>
                <option value="banned">Cấm</option>
              </select>
            </p>
            <button onClick={saveEdit}>Lưu</button>
            <button onClick={cancelEdit}>Hủy</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Main;
