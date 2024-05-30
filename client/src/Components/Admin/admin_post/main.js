import React, { useState, useEffect } from "react";
import axios from "axios";
import "./post.css"; // Import file CSS cho kiểu dáng
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const PostTable = () => {
  const [posts, setPosts] = useState({ newPosts: [], allPosts: [] });
  const [reason, setReason] = useState(""); // Lý do từ chối hoặc xóa bài viết
  const { id } = useParams();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/posts");
        const allPosts = response.data.results;
        const newPosts = allPosts.filter((post) => post.state === "Chờ duyệt");
        const filteredPosts = allPosts.filter((post) => post.state !== "Chờ duyệt");

        // Sắp xếp newPosts và allPosts theo mã bài đăng
        newPosts.sort((a, b) => a.newsid - b.newsid);
        filteredPosts.sort((a, b) => a.newsid - b.newsid);

        setPosts({ newPosts, allPosts: filteredPosts });
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  const handleReject = (postId) => {
    const confirmMessage = "Bạn có chắc chắn muốn từ chối bài đăng này không?";
    if (window.confirm(confirmMessage)) {
      const reasonInput = prompt("Nhập lý do từ chối bài đăng:");
      if (reasonInput) {
        setReason(reasonInput);
        handleAction(postId, "reject", reasonInput);
      }
    }
  };

  const handleDelete = (postId) => {
    const confirmMessage = "Bạn có chắc chắn muốn xóa bài đăng này không?";
    if (window.confirm(confirmMessage)) {
      const reasonInput = prompt("Nhập lý do xóa bài đăng:");
      if (reasonInput) {
        setReason(reasonInput);
        handleAction(postId, "delete", reasonInput);
      }
    }
  };

  const handleApprove = (postId, postDuration) => {
    const confirmMessage = "Bạn có chắc chắn muốn duyệt bài đăng này không?";
    const adminEmail = JSON.parse(localStorage.getItem('user')).EMAIL; // Lấy adminEmail từ localStorages
    if (window.confirm(confirmMessage)) {
      axios
        .post("http://localhost:3000/api/create-payment", {
          NEWSID: postId,
          POSTDURATION: postDuration,
          ADMINEMAIL: adminEmail, // adminEmail
        })
        .then((response) => {
          alert("Tạo phiếu thanh toán thành công!");
          handleAction(postId, "approve");
        })
        .catch((error) => {
          console.error("Error creating payment:", error);
          alert("Đã xảy ra lỗi. Vui lòng thử lại.");
        });
    }
  };

  const handleAction = (postId, action, reason = "") => {
    let url = "";
    let data = { reason };
  
    switch (action) {
      case "reject":
      case "approve":
        url = `http://localhost:3000/api/update-newsState`;
        data = { newsid: postId, state: action === "approve" ? "Chờ thanh toán" : "Bị từ chối"};
        break;
      case "delete":
        url = `http://localhost:3000/api/update-newsState`;
        data = { newsid: postId, state: "Đã xóa"};
        break;
      default:
        return;
    }
  
    axios
      .post(url, data)
      .then((response) => {
        // Tạo thông báo nếu là hành động approve hoặc reject hoặc delete
        if (action === "approve" || action === "reject" || action === "delete") {
          let content = "";
          if (action === "approve") {
            content = `Bài viết có mã số ${postId} đã được phê duyệt`;
          } else if (action === "reject") {
            content = `Bài viết có mã số ${postId} đã bị từ chối`;
          } else if (action === "delete") {
            content = `Bài viết có mã số ${postId} đã bị xóa`;
          }
          
          const notificationData = {
            newsid: postId,
            content,
            reason
          };
  
          axios.post('http://localhost:3000/api/create-notification', notificationData)
            .then((response) => {
              console.log('Tạo thông báo thành công');
            })
            .catch((error) => {
              console.error('Lỗi khi tạo thông báo:', error);
            });
        }
  
        window.location.reload(); // Tải lại trang để cập nhật thay đổi
      })
      .catch((error) => {
        console.error(`Lỗi khi thực hiện hành động ${action}:`, error);
        alert("Đã xảy ra lỗi. Vui lòng thử lại.");
      });
  };
  

  return (
    <div className="table-container">
      <h1 style={{ width: "700px" }}>Bài đăng mới !</h1>
      <table className="user-table">
        <thead>
          <tr>
            <th>Mã bài đăng</th>
            <th>Địa chỉ</th>
            <th>Tiêu đề bài đăng</th>
            <th>Tên người dùng</th>
            <th>Thời hạn</th>
            <th>Trạng thái</th>
            <th className="function-cell">Chức năng</th>
          </tr>
        </thead>
        <tbody>
          {posts.newPosts.map((post) => (
            <tr key={post.newsid}>
              <td>{post.newsid}</td>
              <td>{post.district}</td>
              <td>{post.title}</td>
              <td>{post.name}</td>
              <td>{post.postduration} ngày</td>
              <td>{post.state}</td>
              <td>
                <Link className="detail-link update-button" to={`/detail/${post.newsid}`}>
                  Chi tiết
                </Link>
                <FontAwesomeIcon
                  icon={faTimes}
                  className="action-icon reject-icon"
                  title="Từ chối"
                  onClick={() => handleReject(post.newsid)}
                />
                <FontAwesomeIcon
                  icon={faCheck}
                  className="action-icon approve-icon"
                  title="Duyệt"
                  onClick={() => handleApprove(post.newsid, post.postduration)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h1 style={{ width: "700px" }}>Thông tin tất cả bài đăng !</h1>
      <table className="user-table">
        <thead>
          <tr>
            <th>Mã bài đăng</th>
            <th>Địa chỉ</th>
            <th>Tiêu đề bài đăng</th>
            <th>Tên người dùng</th>
            <th>Thời hạn</th>
            <th>Trạng thái</th>
            <th className="function-cell">Chức năng</th>
          </tr>
        </thead>
        <tbody>
          {posts.allPosts.map((post) => (
            <tr key={post.newsid}>
              <td>{post.newsid}</td>
              <td>{post.district}</td>
              <td>{post.title}</td>
              <td>{post.name}</td>
              <td>{post.postduration} ngày</td>
              <td>{post.state}</td>
              <td>
                <Link className="detail-link update-button" to={`/detail/${post.newsid}`}>
                  Chi tiết
                </Link>
                <FontAwesomeIcon
                  icon={faTrashAlt}
                  className="action-icon delete-icon"
                  title="Xóa"
                  onClick={() => handleDelete(post.newsid)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PostTable;
