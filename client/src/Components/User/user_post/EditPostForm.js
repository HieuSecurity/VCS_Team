import React, { useEffect, useState } from 'react';
import "./create.css"; // Import file CSS
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "react-modal"; // Import Modal from react-modal

const EditPostForm = ({ postId, isOpen, onRequestClose }) => {
  const [formData, setFormData] = useState({
    title:"" ,
    describe: "" ,
    price: "" ,
    acreage: "" ,
    address: "" ,
    district: "" ,
    images: "" ,
    agreeTerms: false,
  });

  const [districts, setDistricts] = useState([]);
  const [priceList, setPriceList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch post details to populate the form
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/get-post-details/${postId}`); // Thay đổi đường dẫn API theo cấu trúc của bạn
        const postData = response.data;
        console.log("ở đây nè:", postData.specificaddress);
        setFormData({
          title: postData.title ,
          describe: postData.describe,
          price: postData.price ,
          acreage: postData.acreage ,
          address: postData.address ,
          district: postData.district ,
          images: postData.images ,
          agreeTerms: false,
        });
      } catch (error) {
        console.error("Error fetching post data:", error);
      }
    };



    // Fetch list of districts
    async function fetchDistricts() {
      try {
        const response = await axios.get("http://localhost:3000/api/hcmdistrict");
        setDistricts(response.data);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    }
    async function fetchPriceList() {
      try {
        const response = await axios.get("http://localhost:3000/api/get-pricelist"); // API endpoint
        setPriceList(response.data);
      } catch (error) {
        console.error("Error fetching price list:", error);
      }
    }

    fetchData();
    fetchDistricts();
    fetchPriceList();
  }, [postId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.agreeTerms) {
        alert("Vui lòng đồng ý với điều khoản và dịch vụ");
        return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("describe", formData.describe);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("acreage", formData.acreage);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("district", formData.district);

      // Đưa hình ảnh vào FormData
      formData.images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      const response = await axios.put(`http://localhost:3000/api/update-post/${postId}`, 
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data);
      alert("Đã chỉnh sửa bài đăng thành công");
      window.location.reload();
      onRequestClose(); // đóng cửa sổ chỉnh s
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Đã xảy ra lỗi khi chỉnh sửa bài đăng");
    }
  };
  
  

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    const newValue = type === "checkbox" ? checked : files ? files : value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: newValue,
    }));
  };

  const handleImageChange = (e) => {
    const imageFiles = Array.from(e.target.files); // Get the selected files
    if (imageFiles.length > 20) {
      alert("Bạn chỉ được chọn tối đa 20 ảnh");
      // Clear previous image selections
      e.target.value = null;
      setFormData((prevFormData) => ({
        ...prevFormData,
        images: [],
      }));
      return;
    }
    setFormData((prevFormData) => ({
      ...prevFormData,
      images: imageFiles, // Set the image files in the form data
    }));
  };

  const handleCancel = () => {
    onRequestClose(); // Close the modal on cancel
  };

  const formatMoney = (amount) => {
    return amount
      .toLocaleString("en-US", { style: "currency", currency: "USD" })
      .replace(/\$/, "")
      .replace(/\.00$/, "");
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Edit Post"
      className="edit-post-modal"
      overlayClassName="edit-post-modal-overlay"
    >
      <div className="post-form-container">
        <h2>Chỉnh sửa bài đăng</h2>
        <div className="edit-post-icons">
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex" }}>
            <div style={{ flex: 1 }}>
              <label>Tiêu đề bài đăng:</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>
          </div>
          <div style={{ display: "flex" }}>
            <div style={{ flex: 1 }}>
              <label>Mô tả:</label>
              <textarea
                name="describe"
                value={formData.describe}
                onChange={handleChange}
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
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Diện tích:</label>
              <input
                type="number"
                name="acreage"
                value={formData.acreage}
                onChange={handleChange}
                placeholder="mét"
              />
            </div>
          </div>
          <div style={{ display: "flex" }}>
            <div style={{ flex: 1 }}>
              <label>Địa điểm:</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Phường, xã"
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
              name="images"
              multiple
              onChange={handleImageChange}
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
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button type="submit">lưu</button>
            <button type="button" onClick={handleCancel}>Hủy</button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditPostForm;

