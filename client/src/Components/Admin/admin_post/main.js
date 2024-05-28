import React, { useState, useEffect } from "react";
import axios from "axios";
import "./post.css"; // Import CSS file for styling
import { Link, useParams } from "react-router-dom";

const PostTable = () => {
  const [posts, setPosts] = useState({ newPosts: [], allPosts: [] });
  const { id } = useParams();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/posts");
        const allPosts = response.data.results;
        const newPosts = allPosts.filter((post) => post.state === "Chờ duyệt");
        const filteredPosts = allPosts.filter((post) => post.state !== "Chờ duyệt");

        setPosts({ newPosts, allPosts: filteredPosts });
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

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
              <td>{post.state}</td>
              <td>
                <Link className="detail-link update-button" to={`/detail/${post.newsid}`}>
                  Chi tiết
                </Link>
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
              <td>{post.state}</td>
              <td>
                <Link className="detail-link update-button" to={`/detail/${post.newsid}`}>
                  Chi tiết
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PostTable;
