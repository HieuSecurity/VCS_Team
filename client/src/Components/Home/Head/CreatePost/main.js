import React, { useState } from "react";
import "./create.css"; // Import file CSS
import Back from "../../../Back/back";
import Slogan from "../../../Slogan/slogan";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Login from "../Login/login";

function PostForm() {
  const history = useNavigate();
  const [formData, setFormData] = useState({
    description: "",
    price: "",
    area: "",
    location: "",
    image: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const formDataToSend = new FormData(); // Create FormData object
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("area", formData.area);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("image", formData.image);
      // Send POST request to the API /api/create-post with form data
      const response = await axios.post(
        "http://localhost:3000/api/create-post",
        formData
      );
      setFormData({
        description: "",
        price: "",
        area: "",
        location: "",
        image: "",
      });
      alert("Đã đăng tin thành công");
    } catch (error) {
      console.error("Error:", error);
      alert("Đã xảy ra lỗi khi đăng tin");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setFormData(e.target.files[0]);
  };

  return (
    <div>
      <Back />
      <Slogan />
      <div className="post-form-container">
        <h2>Tạo bài đăng mới</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ maxWidth: "450px" }}>
            <label>Mô tả:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Giá:</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Diện tích:</label>
            <input
              type="number"
              name="area"
              value={formData.area}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Địa điểm:</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Hình ảnh:</label>
            <input
              type="file"
              name="image"
              onChange={handleImageChange}
              required
            />
          </div>
          <button type="submit">Đăng bài</button>
        </form>
      </div>
    </div>
  );
}

export default PostForm;
