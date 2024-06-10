import React, { useState, useEffect } from "react";
import axios from "axios";
import "./post.css"; // Import file CSS cho kiểu dáng
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import {
  faCheck,
  faTimes,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

const PostTable = () => {
  const [posts, setPosts] = useState({ newPosts: [], allPosts: [] });
  const [originalPosts, setOriginalPosts] = useState({ newPosts: [], allPosts: [] })
  const [reason, setReason] = useState(""); // Lý do từ chối hoặc xóa bài viết
  const { id } = useParams();
  const [searchId, setSearchId] = useState('');
  const [searchContact, setSearchContact] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/get-posts");
        const allPosts = response.data.results;
        const newPosts = allPosts.filter((post) => post.STATE === "Chờ duyệt");
        const filteredPosts = allPosts.filter(
          (post) => post.STATE !== "Chờ duyệt"
        );

        // Sắp xếp newPosts và allPosts theo mã bài đăng
        newPosts.sort((a, b) => a.NEWSID - b.NEWSID);
        filteredPosts.sort((a, b) => a.NEWSID - b.NEWSID);

        setPosts({ newPosts, allPosts: filteredPosts });
        setOriginalPosts({ newPosts, allPosts: filteredPosts });
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
    const adminEmail = JSON.parse(localStorage.getItem("user")).EMAIL; // Lấy adminEmail từ localStorages
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
        data = {
          newsid: postId,
          state: action === "approve" ? "Chờ thanh toán" : "Bị từ chối",
        };
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
        // Tạo thông báo nếu là hành động approve hoặc reject hoặc delete
        if (
          action === "approve" ||
          action === "reject" ||
          action === "delete"
        ) {
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
            reason,
            category: "Bài viết",
          };

          axios
            .post(
              "http://localhost:3000/api/create-notification",
              notificationData
            )
            .then((response) => {
              console.log("Tạo thông báo thành công");
            })
            .catch((error) => {
              console.error("Lỗi khi tạo thông báo:", error);
            });
        }

        window.location.reload(); // Tải lại trang để cập nhật thay đổi
      })
      .catch((error) => {
        console.error(`Lỗi khi thực hiện hành động ${action}:`, error);
        alert("Đã xảy ra lỗi. Vui lòng thử lại.");
      });
  };

  const handleSearch = () => {
    // Lấy giá trị tìm kiếm, bỏ khoảng trắng đầu và cuối, và chuyển thành chữ thường
    const trimmedSearchId = searchId.trim().toLowerCase();
    const trimmedSearchContact = searchContact.trim().toLowerCase();
  
    const filteredNewPosts = [];
    const filteredAllPosts = [];
  
    // Duyệt qua newPosts và lọc các bài viết thỏa mãn điều kiện tìm kiếm
    for (let i = 0; i < originalPosts.newPosts.length; i++) {
      const post = originalPosts.newPosts[i];
      const postIdStr = post.NEWSID.toString().toLowerCase();
      const postUser = post.NAME.toLowerCase();
      const postAddress = post.district.toLowerCase();
  
      const matchId = trimmedSearchId ? postIdStr === trimmedSearchId: true;
      const matchContact = trimmedSearchContact ?
        postUser.includes(trimmedSearchContact) || postAddress.includes(trimmedSearchContact) :
        true;
  
      if (matchId && matchContact) {
        filteredNewPosts.push(post);
      }
    }
  
    // Duyệt qua allPosts và lọc các bài viết thỏa mãn điều kiện tìm kiếm
    for (let i = 0; i < originalPosts.allPosts.length; i++) {
      const post = originalPosts.allPosts[i];
      const postIdStr = post.NEWSID.toString().toLowerCase();
      const postUser = post.NAME.toLowerCase();
      const postAddress = post.district.toLowerCase();
  
      const matchId = trimmedSearchId ? postIdStr === trimmedSearchId : true;
      const matchContact = trimmedSearchContact ?
        postUser.includes(trimmedSearchContact) || postAddress.includes(trimmedSearchContact) :
        true;
  
      if (matchId && matchContact) {
        filteredAllPosts.push(post);
      }
    }
  
    setPosts({ newPosts: filteredNewPosts, allPosts: filteredAllPosts });
  };
  
  

  return (
    <div className="table-container">
      <h1 style={{ width: "700px", fontWeight: "700", fontSize: "30px" }}>
        Bài đăng mới !
      </h1>
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
            <tr key={post.NEWSID}>
              <td>{post.NEWSID}</td>
              <td>{post.district}</td>
              <td>{post.TITLE}</td>
              <td>{post.NAME}</td>
              <td>{post.POSTDURATION} ngày</td>
              <td>{post.STATE}</td>
              <td className="chuc-Nang" style={{ textAlign: "center" }}>
                <Link
                  className="detail-link update-button"
                  to={`/detail/${post.NEWSID}`}
                >
                  Chi tiết
                </Link>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                  className="icons"
                >
                  <FontAwesomeIcon
                    style={{ fontSize: "25px", backgroundColor: "#ccc" }}
                    icon={faTimes}
                    className="action-icon reject-icon"
                    title="Từ chối"
                    onClick={() => handleReject(post.NEWSID)}
                  />
                  <FontAwesomeIcon
                    style={{ fontSize: "25px", backgroundColor: "#ccc" }}
                    icon={faCheck}
                    className="action-icon approve-icon"
                    title="Duyệt"
                    onClick={() =>
                      handleApprove(post.NEWSID, post.POSTDURATION)
                    }
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h1 style={{ width: "700px", fontWeight: "700", fontSize: "30px" }}>
        Thông tin tất cả bài đăng !
      </h1>
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
                Địa chỉ/Tên người đăng
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
            <tr key={post.NEWSID}>
              <td>{post.NEWSID}</td>
              <td>{post.district}</td>
              <td>{post.TITLE}</td>
              <td>{post.NAME}</td>
              <td>{post.POSTDURATION} ngày</td>
              <td>{post.STATE}</td>
              <td className="chuc-Nang ">
                <Link
                  className="detail-link update-button"
                  to={`/detail/${post.NEWSID}`}
                >
                  Chi tiết
                </Link>
                {post.STATE === "Hoạt động" && (
                  <FontAwesomeIcon
                    style={{ marginLeft: "-15px" }}
                    icon={faTrashAlt}
                    className="action-icon delete-icon"
                    title="Xóa"
                    onClick={() => handleDelete(post.NEWSID)}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PostTable;
