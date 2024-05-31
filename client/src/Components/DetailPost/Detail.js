import Slogan from "../Slogan/slogan";
import "../DetailPost/detail.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";
import Back from "../Back/back";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
import React, {useEffect, useState} from "react";

function Detail() {
  const { id } = useParams();
  const [detailData, setDetailData] = useState(null); // State để lưu trữ dữ liệu chi tiết
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchData();
    fetchImages();
  }, [id]);

  function formatMoney(amount) {
    // Kiểm tra nếu amount không phải là một số
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '0 đồng'; // Trả về một giá trị mặc định khi amount không hợp lệ
    }
  
    // Nếu số tiền nhỏ hơn 1 triệu
    if (amount < 1000000) {
      return (amount / 1000).toFixed(0) + " ngàn";
    }
    // Chia số tiền cho 1 tỷ để kiểm tra nếu nó lớn hơn 1 tỷ
    else if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(1) + " tỷ";
    }
    // Chia số tiền cho 1 triệu để kiểm tra nếu nó lớn hơn 1 triệu
    else if (amount >= 1000000) {
      return (amount / 1000000).toFixed(2) + " triệu";
    } else {
      return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " đồng";
    }
  }
  

  const formatDate = (dateString) => {
    if (!dateString) return ''; // Kiểm tra nếu dateString không tồn tại
  
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Kiểm tra nếu date không hợp lệ
  
    return date.toISOString().slice(0, 10);
  };
  
  const fetchData = async () => {
    try {
      // Gọi API để lấy dữ liệu chi tiết
      const response = await axios.get(
        `http://localhost:3000/api/detail/${id}`
      );
      setDetailData(response.data); // Lưu dữ liệu vào state
    } catch (error) {
      console.error("Error fetching detail data:", error);
    }
  };

  const fetchImages = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/images/${id}`);
      setImages(response.data.images);
    } catch (error){
      console.error("Error fetching images: ", error);
    }
  };

  const handleImageUpload = async (event) => {
    const formData = new FormData();
    for (const file of event.target.files){
      formData.append('images', file);
    }
  
    try {
      const response = await axios.post(`http://localhost:3000/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: {
          newsid: id
        }
      });
  
      // Handle the response here
      console.log(response.data); // Log the response data
      alert('Images uploaded successfully'); // Show an alert to the user
    } catch (error) {
      console.error("Error uploading images: ", error);
      alert('An error occurred while uploading images'); // Show an alert to the user in case of error
    }
  };
  
  if (!detailData) {
    return <div>Loading...</div>; // Hiển thị thông báo loading trong quá trình lấy dữ liệu
  }

  return (
    <div className="Detail">
      <div className="head">
        <Back />
        <Slogan />
      </div>
      <div className="container_form" style={{ height: "100%" }}>
        <div class="container-posts" style={{ border: "1px solid red" }}>
          <div
            class="left-part left-part-detail"
            style={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {images.map((image, index) => (
              <img
                key = {index}
                style = {{width: "100%", height: "380ox", marginBottom: "10px"}}
                src={`http://localhost:3000/uploads/${image}`}
                alt={`Image ${index + 1}`}
              />
            ))}
            <div
              style={{
                margin: "10px 0",
                display: "flex",
                justifyContent: "center", // căn giữa theo chiều ngang
                alignItems: "center", // căn giữa theo chiều dọc
              }}
            >
              <span
                style={{
                  textAlign: "center",
                  color: "#E13427",
                  fontSize: "32px",
                  fontWeight: "1000",
                  borderBottom: "2px solid blue",
                }}
              >
                {detailData.title}
              </span>
            </div>

            <div>
              <span
                style={{
                  fontSize: "25px",
                  fontWeight: "1000",
                }}
              >
                {"Địa chỉ: " + detailData.specificaddress + ", " +detailData.district + ", TP.HCM"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p
                style={{
                  padding: "10px",
                  margin: "5px",
                  color: "#16c784",
                  fontSize: "27px",
                  fontWeight: "800",
                  borderRight: "2px solid red",
                  textAlign: "center",
                }}
              >
                {formatMoney(detailData.price)}/tháng
              </p>
              <p
                style={{
                  padding: "10px",
                  margin: "5px",
                  color: "#16c784",
                  fontSize: "27px",
                  fontWeight: "800",
                  borderRight: "2px solid red",
                  textAlign: "center",
                }}
              >
                {" "}
                {detailData.acreage} m2
              </p>
              <p
                style={{
                  padding: "10px",
                  margin: "5px",
                  color: "#16c784",
                  fontSize: "27px",
                  fontWeight: "800",
                  borderRight: "2px solid red",
                  textAlign: "center",
                }}
              >
                {"Mã tin: " + detailData.newsid}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "25px",
                  fontWeight: "900",
                  margin: "5px",
                  padding: "5px",
                }}
              >
                Đặc điểm tin đăng{" "}
              </p>
              <div
                style={{
                  backgroundColor: "white",
                  textAlign: "left",
                  display: "block",
                  alignItems: "center",
                  fontSize: "18px",
                  justifyContent: "flex-start",
                  margin: "10px 0",
                }}
              >
                <li style={{textAlign: "left",}}>Mô tả : </li>
                <p>{detailData.describe}</p>
              </div>
              <div
                style={{
                  backgroundColor: "white",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "18px",
                  justifyContent: "flex-start",
                  margin: "10px 0",
                }}
              >
                <li>Ngày đăng :</li>
                <p>{formatDate(detailData.timestart)}</p>
              </div>
              <div
                style={{
                  backgroundColor: "white",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "18px",
                  justifyContent: "flex-start",
                  margin: "10px 0",
                }}
              >
                <li>Ngày hết hạn : </li>
                <p>{formatDate(detailData.timeend)}</p>
              </div>
            </div>
            <div>
              <p
                style={{
                  fontSize: "25px",
                  fontWeight: "900",
                  margin: "5px",
                  padding: "5px",
                  margin: "10px 0",
                  borderRight: "2px solid red",
                }}
              >
                Thông tin liên hệ
              </p>
              <div
                style={{
                  backgroundColor: "white",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "18px",
                  justifyContent: "flex-start",
                  margin: "10px 0",
                }}
              >
                <li style={{ textAlign: "left" }}>Liên lệ : </li>
                <p>{detailData.name}</p>
              </div>
              <div
                style={{
                  backgroundColor: "white",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "18px",
                  justifyContent: "flex-start",
                  margin: "10px 0",
                }}
              >
                <li style={{ textAlign: "left" }}>Điện thoại : </li>
                <p>{detailData.phone}</p>
              </div>
            </div>
          </div>
          <div class="right-part right-part-detail ">
            <div className="des">
              <img
                style={{ with: "80px", height: "80px", marginTop: "50px" }}
                src="https://tse4.mm.bing.net/th?id=OIP.XtlXmrujgxcWTyVw8iThMgHaE7&pid=Api&P=0&h=220"
              />
              <p
                style={{
                  fontSize: "25px",
                  margin: "5px",
                  fontWeight: 900,
                }}
              ></p>
              <button>
                {detailData.name}
              </button>
              <button>
                <FontAwesomeIcon
                  icon={faPhone}
                  style={{ marginRight: "10px" }}
                />
                {detailData.phone}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Detail;