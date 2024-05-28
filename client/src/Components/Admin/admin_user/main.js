import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, parseISO } from "date-fns";
import "./user.css";

function Main() {
  const [userData, setUserData] = useState([]);

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

  const handleStatusChange = (user) => {
    const newStatus = user.STATUS === "Hoạt động" ? "Khóa" : "Hoạt động";
    const confirmMessage = user.STATUS === "Hoạt động" 
      ? "Bạn có chắc muốn khóa người dùng này?" 
      : "Bạn có chắc muốn mở khóa người dùng này?";

    if (window.confirm(confirmMessage)) {
      axios
        .put(`http://localhost:3000/api/update-user-state`, { EMAIL: user.EMAIL, STATUS: newStatus })
        .then(() => {
          // Cập nhật lại state userData sau khi chỉnh sửa
          fetchUserIds();
        })
        .catch((error) => {
          console.error("Error updating user:", error);
        });
    }
  };
  
  const formatDate = (dateString) => {
    return dateString ? format(parseISO(dateString), 'yyyy/MM/dd') : "null";
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
              <th>Số bài viết</th>
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
                <td>{formatDate(user.DOB)}</td>
                <td>{user.PHONE}</td>
                <td>{user.EMAIL}</td>
                <td>{user.NEWSCOUNT}</td>
                <td>{user.STATUS}</td>
                <td>
                  <button
                    className="detail-link update-button"
                    onClick={() => handleStatusChange(user)}
                  >
                    {user.STATUS === "Hoạt động" ? "Khóa" : "Mở khóa"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Main;
