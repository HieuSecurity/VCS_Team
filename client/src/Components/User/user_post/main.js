import React, { useState, useEffect } from "react";
import axios from "axios";
import "./post.css"; // Import CSS file for styling
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const PostTable = () => {
  const [posts, setPosts] = useState({ newPosts: [], allPosts: [] });
  const [reason, setReason] = useState(""); // Lý do từ chối hoặc xóa bài viết


  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/get-posts");
        const allPosts = response.data.results;
        const newPosts = allPosts.filter((post) => post.STATE !== "Đã xóa");
        const filteredPosts = allPosts.filter((post) => post.STATE !== "Đã xóa" );

        // Sắp xếp newPosts và allPosts theo mã bài đăng
        newPosts.sort((a, b) => a.NEWSID - b.NEWSID);
        filteredPosts.sort((a, b) => a.NEWSID - b.NEWSID);

        setPosts({ newPosts, allPosts: filteredPosts });
        
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);
  
  const handleDelete = (postId) => {
    const confirmMessage = "Bạn có chắc chắn muốn xóa bài đăng này không?";
    if (window.confirm(confirmMessage)) {
        handleAction(postId, "delete");
    }
  };

  const handleAction = (postId, action, reason = "") => {
    let url = "";
    let data = { reason };  

    switch (action) {
      case "hide":
        url = `http://localhost:3000/api/update-newsState`;
        data = { newsid: postId, state: action === "hide" ? "Đã ẩn" : ""};
        break;
      case "edit":
        url = `http://localhost:3000/api/update-newsState`;
        data = { newsid: postId, state: action === "edit" ? "Đã chỉnh sửa" : ""};
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
        // Tạo thông báo nếu là hành động hide hoặc edit hoặc delete
        if (action === "hide" || action === "edit" || action === "delete") {
          let content = "";
          if (action === "hide") {
            alert(`Bài viết có mã số ${postId} đã được ẩn`);
          } else if (action === "edit") {
            alert(`Bài viết có mã số ${postId} chỉnh sửa thành công`);
          } else if (action === "delete") {
            alert(`Bài viết có mã số ${postId} đã bị xóa `);
          }
        }
        window.location.reload(); // Tải lại trang để cập nhật thay đổi
      })
      .catch((error) => {
        console.error(`Lỗi khi thực hiện hành động ${action}:`, error);
        alert("Đã xảy ra lỗi. Vui lòng thử lại.");
      });
  };

  const formatDate = (dateString) => {
    return dateString ? format(parseISO(dateString), 'yyyy/MM/dd') : "null";
  };

    

  return (
    <div className="table-container">
      <h1 style={{ width: "700px" }}>Thông tin tất cả bài đăng !</h1>
      <table className="user-table">
        <thead>
          <tr>
            <th>Mã bài đăng </th>
            <th>Tiêu đề bài đăng</th>
            <th>Ngày hết hạn</th>
            <th>Trạng thái</th>
            <th className="function-cell">Chức năng</th>
          </tr>
        </thead>
        <tbody>
          {posts.allPosts.map((post) => (
            <tr key={post.USERID}>
              <td>{post.NEWSID}</td>
              <td>{post.TITLE}</td>
              <td>{formatDate(post.TIMESTART)}</td>
              <td>{post.STATE}</td>
              <td className="chuc-Nang">
                <Link className="detail-link update-button" to={`/detail/${post.NEWSID}`}>
                  Chi tiết
                </Link>
                <FontAwesomeIcon
                  icon={faTrashAlt}
                  className="action-icon delete-icon"
                  title="Xóa"
                  onClick={() => handleDelete(post.NEWSID)}
                />
              </td>
              {/* <td>
                <Link
                  to={`/detail/${post.id}`}
                  className="detail-link update-button"
                >
                  Chi tiết
                </Link>
              </td> */}
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PostTable;
