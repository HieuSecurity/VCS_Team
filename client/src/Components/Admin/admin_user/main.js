import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import "./user.css";

function Main() {
  const [userData, setUserData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [searchContact, setSearchContact] = useState("");

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
      const usersData = users.map(user => user.data);
      // Sắp xếp theo USERID
    usersData.sort((a, b) => b.USERID - a.USERID);
      setUserData(usersData);
      setOriginalData(usersData); // Lưu trữ dữ liệu gốc
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

  const handleSearch = () => {
    // Lấy giá trị tìm kiếm, bỏ khoảng trắng đầu và cuối, và chuyển thành chữ thường
    const trimmedSearchId = searchId.trim().toLowerCase();
    const trimmedSearchContact = searchContact.trim().toLowerCase();
  
    const filteredData = [];
  
    for (let i = 0; i < originalData.length; i++) {
      const user = originalData[i];
  
      // Chuyển các trường thông tin của người dùng thành chữ thường để so sánh
      const userIdStr = user.USERID.toString().toLowerCase();
      const userEmail = user.EMAIL.toLowerCase();
      const userPhone = user.PHONE.toLowerCase();
      const userName = user.NAME.toLowerCase();
  
      // Kiểm tra nếu searchId hoặc searchContact không rỗng
      const matchId = trimmedSearchId ? userIdStr === trimmedSearchId : true;
      const matchContact = trimmedSearchContact
        ? userEmail.includes(trimmedSearchContact) ||
          userPhone.includes(trimmedSearchContact) ||
          userName.includes(trimmedSearchContact)
        : true;
  
      if (matchId && matchContact) {
        filteredData.push(user);
      }
    }
    setUserData(filteredData);
  };
  
  
  

  return (
    <div className="Main">
      <h1>Thông tin người dùng tại Phongtro123</h1>
      <div className="table-container">
      <table className="table">
          <thead>
          <tr>
              <th  style={{width: "35%"}}>
                Mã ID
                <input 
                  type="text" 
                  value={searchId} 
                  onChange={(e) => setSearchId(e.target.value)} 
                  placeholder="Tìm kiếm mã ID" 
                />
              </th>
              <th style={{width: "65%"}}>
                Email/Số điện thoại/Tên
                <input 
                  type="text" 
                  value={searchContact} 
                  onChange={(e) => setSearchContact(e.target.value)} 
                  placeholder="Tìm kiếm" 
                />
                <FontAwesomeIcon 
                  icon={faSearch} 
                  onClick={handleSearch} 
                  style={{ cursor: "pointer", marginLeft: "20px"}} 
                />
              </th>
            </tr>
          </thead>
        </table>
      </div>
      
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th style={{textAlign:"center"}}>Mã ID</th>
              <th style={{textAlign:"center"}}>Tên</th>
              <th style={{textAlign:"center"}}>Giới tính</th>
              <th style={{textAlign:"center"}}>Ngày sinh</th>
              <th style={{textAlign:"center"}}>Số Điện Thoại</th>
              <th style={{textAlign:"center"}}>Email</th>
              <th style={{textAlign:"center"}}>Số bài viết</th>
              <th style={{textAlign:"center"}}>Trạng Thái</th>
              <th className="function-cell" style={{textAlign:"center"}}>Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {userData.map((user) => (
              <tr key={user.USERID}>
                <td style={{textAlign:"center"}}>{user.USERID}</td>
                <td style={{textAlign:"center"}}>{user.NAME}</td>
                <td style={{textAlign:"center"}}>{user.SEX}</td>
                <td style={{textAlign:"center"}}>{formatDate(user.DOB)}</td>
                <td style={{textAlign:"center"}}>{user.PHONE}</td>
                <td style={{textAlign:"center"}}>{user.EMAIL}</td>
                <td style={{textAlign:"center"}}>{user.NEWSCOUNT}</td>
                <td style={{textAlign:"center"}}>{user.STATUS}</td> 
                <td style={{textAlign:"center"}}>
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
