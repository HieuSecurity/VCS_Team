import React, { useEffect, useState } from "react";
import "./create.css"; // Import file CSS
import Back from "../../../Back/back";
import Slogan from "../../../Slogan/slogan";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Login from "../Login/login";
import { faBox } from "@fortawesome/free-solid-svg-icons";

function PostForm() {
  const history = useNavigate();
  const [formData, setFormData] = useState({
    description: "",
    price: "",
    area: "",
    location: "",
    image: "",
    district: "",
    agreeTerms: false,
  });

  // State để lưu danh sách các quận từ cơ sở dữ liệu
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    // Lấy danh sách các quận từ cơ sở dữ liệu
    async function fetchDistricts() {
      try {
        const response = await axios.get("http://localhost:3000/api/hcmdistrict"); // API endpoint
        setDistricts(response.data);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    }
    fetchDistricts();
  }, []); // Thực hiện fetch một lần duy nhất khi component được render

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("area", formData.area);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("image", formData.image);
      formDataToSend.append("district", formData.district);

      const response = await axios.post(
        "http://localhost:3000/api/create-post",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const postId = response.data.postId;
      console.log("Post created with ID:", postId);

      // Clear all form fields after successful posting
      setFormData({
        description: "",
        price: "",
        area: "",
        location: "",
        image: null,
        district: "",
      });
      document.getElementById("image-input").value = "";

      alert("Đã đăng tin thành công");
    } catch (error) {
      console.error("Error:", error);
      alert("Đã xảy ra lỗi khi đăng tin");
    }
  };

  const handleChange = (e) => {
    if (formData.agreeTerms) {
      alert("Vui lòng đồng ý với điều khoản và dịch vụ ");
      return;
    }
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const imageFile = e.target.files[0]; // Get the selected file
    console.log(imageFile);
    setFormData((prevFormData) => ({
      ...prevFormData,
      image: imageFile, // Set the image file in the form data
    }));
  };

  return (
    <div>
      <Back />
      <Slogan />
      <div className="post-form-container">
        <h2>Tạo bài đăng mới</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex" }}>
            <div style={{ flex: 1 }}>
              <label>Tiêu đề bài đăng:</label>
              <input
                type="text2"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                className="select-label">Thời hạn đăng bài:</label>
              <select
                id="post-duration"
                name="postDuration"
                value={formData.postDuration}
                onChange={handleChange}
                required
              >
                <option value="">Chọn khoảng thời gian</option>
                <option value="30"> 30 ngày - {30 * 20}K</option>
                <option value="90"> 90 ngày - {90 * 19}K</option>
                <option value="180">180 ngày - {180 * 17}K</option>
                <option value="365">365 ngày - {365 * 15}K</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex" }}>
            <div style={{ flex: 1 }}>
              <label>Mô tả:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div style={{ display: "flex" }}>
            <div style={{ flex: 1 }}>
              <label>Giá:</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="VND"
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Diện tích:</label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="mét"
                required
              />
            </div>
          </div>
          <div style={{ display: "flex" }}>
            <div style={{ flex: 1 }}>
              <label>Địa điểm:</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Phường, xã"
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Quận/Huyện:</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
              >
                <option value="">Chọn Quận/Huyện</option>
                {/* Dùng dữ liệu từ database để tạo các option */}
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.DISTRICT}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label>Hình ảnh:</label>
            <input
              id="image-input"
              type="file"
              name="image"
              onChange={handleImageChange}
              required
            />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              id="agreeTerms"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              required
            />
            <label htmlFor="agreeTerms" style={{ marginLeft: "10px" }}>
              Tôi đồng ý với điều khoản và dịch vụ
            </label>
          </div>
          <button type="submit">Gửi yêu cầu</button>
        </form>
      </div>


    </div>
  );
}

export default PostForm;
