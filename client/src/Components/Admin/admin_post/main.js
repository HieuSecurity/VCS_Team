import React, { useState, useEffect } from "react";
import axios from "axios";
import "./post.css"; // Import CSS file for styling
import { Link, useParams } from "react-router-dom";
const PostTable = () => {
  const [posts, setPosts] = useState({ results: [], total: 0 });
  const { id } = useParams();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/posts");
        setPosts({
          results: response.data.results,
          total: response.data.total,
        });
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
            <th>Mã người dùng</th>
            <th>Tiêu đề bài đăng</th>
            <th>Tên người dùng</th>
            <th>Trạng thái</th>
            <th className="function-cell">Chức năng</th>
          </tr>
        </thead>
        <tbody>
          {posts.results.map((post) => (
            <tr key={post.id}>
              <td>{post.newsid}</td>
              <td>{post.newsid}</td>
              <td>{post.description}</td>
              <td>{post.price}</td>
              <td>{post.area}</td>
              <td className="">
                <Link
                  className="detail-link update-button"
                  to={`/detail/${post.newsid}`}
                >
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
            <th>Mã người dùng</th>
            <th>Tiêu đề bài đăng</th>
            <th>Tên người dùng</th>
            <th>Trạng thái</th>
            <th className="function-cell">Chức năng</th>
          </tr>
        </thead>
        <tbody>
          {posts.results.map((post) => (
            <tr key={post.id}>
              <td>{post.postId}</td>
              <td>{post.userId}</td>
              <td>{post.title}</td>
              <td>{post.username}</td>
              <td>{post.status}</td>
              <td className="">
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
