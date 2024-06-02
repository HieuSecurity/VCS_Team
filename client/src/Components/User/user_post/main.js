import React, { useState, useEffect } from 'react';
import axios from "axios";
import "./post.css"; // Import CSS file for styling
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faEdit, faEyeSlash, faEye } from "@fortawesome/free-solid-svg-icons"; // Import icon ẩn
import EditPostForm from "./EditPostForm";

const PostTable = () => {
  const [posts, setPosts] = useState({ newPosts: [], allPosts: [] });
  const [editingPost, setEditingPost] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchPosts();
    }, 5000); // Refresh data every 5 seconds

    return () => clearInterval(interval);
  }, []);
  
  const handleEdit = (postId) => {
    setEditingPost(postId);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.EMAIL) {
      axios
        .get(`http://localhost:3000/api/get-userid-byEmail/${user.EMAIL}`)
        .then((response) => {
          const userId = response.data.USERID;
          fetchPosts(userId);
        })
        .catch((error) => {
          console.error("Error fetching user ID:", error);
          setError("Đã xảy ra lỗi khi lấy USERID");
          setLoading(false);
        });
    } else {
      setError("Không tìm thấy email trong localStorage");
      setLoading(false);
    }
  }, []);

  const fetchPosts = (userId) => {
    axios
      .get(`http://localhost:3000/api/get-posts-byUserid/${userId}`)
      .then((response) => {
        const allPosts = response.data;
        const newPosts = allPosts.filter((post) => post.STATE !== "Đã xóa");
        const filteredPosts = allPosts.filter((post) => post.STATE !== "Đã xóa");

        newPosts.sort((a, b) => a.NEWSID - b.NEWSID);
        filteredPosts.sort((a, b) => a.NEWSID - b.NEWSID);

        setPosts({ newPosts, allPosts: filteredPosts });
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
        setError("Đã xảy ra lỗi khi lấy thông tin bài viết");
        setLoading(false);
      });
  };

  const handleDelete = (postId) => {
    const confirmMessage = "Bạn có chắc chắn muốn xóa bài đăng này không?";
    if (window.confirm(confirmMessage)) {
      handleAction(postId, "delete");
    }
  };

  const handleHide = (postId) => {
    const confirmMessage = "Bạn có chắc chắn muốn ẩn bài đăng này không?";
    if (window.confirm(confirmMessage)) {
      handleAction(postId, "hide");
    }
  };

  const handleUnhide = (postId) => {
    const confirmMessage = "Bạn có chắc chắn muốn bỏ ẩn bài đăng này không?";
    if (window.confirm(confirmMessage)) {
      handleAction(postId, "unhide");
    }
  };

  const handleAction = (postId, action) => {
    let url = "";
    let data = {};

    switch (action) {
      case "hide":
        url = `http://localhost:3000/api/update-newsState`;
        data = { newsid: postId, state: "Đã ẩn" };
        break;
      case "unhide":
        url = `http://localhost:3000/api/update-newsState`;
        data = { newsid: postId, state: "Hoạt động" };
        break;
      case "edit":
        url = `http://localhost:3000/api/update-newsState`;
        data = { newsid: postId, state: "Đã chỉnh sửa" };
        break;
      case "delete":
        url = `http://localhost:3000/api/update-newsState`;
        data = { newsid: postId, state: "Đã xóa" };
        break;
      default:
        return;
    }

    axios
      .post(url, data)
      .then((response) => {
        if (action === "hide") {
          alert(`Bài viết có mã số ${postId} đã được ẩn`);
        } else if (action === "edit") {
          alert(`Bài viết có mã số ${postId} chỉnh sửa thành công`);
        } else if (action === "delete") {
          alert(`Bài viết có mã số ${postId} đã bị xóa`);
        }
        window.location.reload();
      })
      .catch((error) => {
        console.error(`Lỗi khi thực hiện hành động ${action}:`, error);
        alert("Đã xảy ra lỗi. Vui lòng thử lại.");
      });
  };

  const formatDate = (dateString) => {
    return dateString ? format(parseISO(dateString), 'yyyy/MM/dd') : "null";
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="table-container">
      <h1 style={{ width: "700px" }}>Thông tin tất cả bài đăng !</h1>
      <table className="user-table">
        <thead>
          <tr>
            <th>Mã bài đăng</th>
            <th>Tiêu đề bài đăng</th>
            <th>Ngày hết hạn</th>
            <th>Trạng thái</th>
            <th className="function-cell">Chức năng</th>
          </tr>
        </thead>
        <tbody>
          {posts.allPosts.map((post) => (
            <tr key={post.NEWSID}>
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
                <FontAwesomeIcon
                  icon={faEdit}
                  className="action-icon edit-icon"
                  title="Chỉnh sửa"
                  onClick={() => handleEdit(post.NEWSID)}
                />
                {post.STATE === "Hoạt động" && (
                  <FontAwesomeIcon
                    icon={faEyeSlash}
                    className="action-icon hide-icon"
                    title="Ẩn"
                    onClick={() => handleHide(post.NEWSID)}
                  />
                )}
                {post.STATE === "Đã ẩn" && (
                  <FontAwesomeIcon
                    icon={faEye}
                    className="action-icon unhide-icon"
                    title="Bỏ ẩn"
                    onClick={() => handleUnhide(post.NEWSID)}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingPost && <EditPostForm postId={editingPost} isOpen={true} onRequestClose={() => setEditingPost(null)} />}
    </div>
  );
};

export default PostTable;
