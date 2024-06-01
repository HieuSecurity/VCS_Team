import Slogan from "../Slogan/slogan";
import "../DetailPost/detail.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTags,
  faRulerCombined,
  faClock,
  faHashtag,
  faMoneyBill1,
} from "@fortawesome/free-solid-svg-icons";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";
import Back from "../Back/back";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
import React, { useEffect, useState } from "react";

function Detail() {
  const { id } = useParams();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [detailData, setDetailData] = useState(null); // State để lưu trữ dữ liệu chi tiết
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchData();
    fetchImages();
  }, [id]);

  function formatMoney(amount) {
    // Kiểm tra nếu amount không phải là một số
    if (typeof amount !== "number" || isNaN(amount)) {
      return "0 đồng"; // Trả về một giá trị mặc định khi amount không hợp lệ
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
    if (!dateString) return ""; // Kiểm tra nếu dateString không tồn tại

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; // Kiểm tra nếu date không hợp lệ

    return date.toISOString().slice(0, 10);
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/detail/${id}`
      );
      setDetailData(response.data);
    } catch (error) {
      console.error("Error fetching detail data:", error);
    }
  };

  const fetchImages = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/images/${id}`
      );
      setImages(response.data.images);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const handleImageUpload = async (event) => {
    const formData = new FormData();
    for (const file of event.target.files) {
      formData.append("images", file);
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/api/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          data: {
            newsid: id,
          },
        }
      );

      // Handle the response here
      console.log(response.data); // Log the response data
      alert("Images uploaded successfully"); // Show an alert to the user
    } catch (error) {
      console.error("Error uploading images: ", error);
      alert("An error occurred while uploading images"); // Show an alert to the user in case of error
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === images.length - 1 ? 0 : prevSlide + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? images.length - 1 : prevSlide - 1
    );
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
      <div
        className="container_form"
        style={{ height: "100%", backgroundColor: "white" }}
      >
        <div class="container-posts" /*style={{ border: "1px solid red" }}*/>
          <div
            class="left-part left-part-detail"
            style={{
              width: "600px",
              justifyContent: "center",
              alignItems: "center",
              display: "block",
            }}
          >
            <div className="slideshow-container">
              <div className="black-bar left-bar"></div>
              <div className="black-bar right-bar"></div>
              {images.map((image, index) => (
                <div
                  key={index}
                  className={index === currentSlide ? "slide active" : "slide"}
                  style={{ display: index === currentSlide ? "block" : "none" }}
                >
                  <img
                    src={`http://localhost:3000/uploads/${image}`}
                    alt={`Image ${index + 1}`}
                    style={{
                      width: "600px",
                      height: "450px",
                      marginBottom: "10px",
                      borderRadius: "10px",
                      overflow: "auto",
                    }}
                  />
                </div>
              ))}
              {images.length > 1 && (
                <>
                  <a className="prev" onClick={prevSlide}>
                    &#10094;
                  </a>
                  <a className="next" onClick={nextSlide}>
                    &#10095;
                  </a>
                </>
              )}
            </div>

            <div className="detail-title">
              <p className="detail-title-text" style={{ color: "#E13427" }}>
                {detailData.title}
              </p>
            </div>

            <div>
              <span
                style={{
                  fontSize: "25px",
                  fontWeight: "1000",
                }}
              >
                {"Địa chỉ: " +
                  detailData.specificaddress +
                  ", " +
                  detailData.district +
                  ", TP.HCM"}
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
                  // borderRight: "2px solid red",
                  textAlign: "center",
                }}
              >
                <FontAwesomeIcon
                  icon={faMoneyBill1}
                  style={{ marginRight: "10px" }}
                />
                {formatMoney(detailData.price)}/tháng
              </p>
              <p
                style={{
                  padding: "0px",
                  margin: "5px",
                  color: "black",
                  fontSize: "27px",
                  fontWeight: "500",
                  // borderRight: "2px solid red",
                  textAlign: "center",
                }}
              >
                <FontAwesomeIcon
                  icon={faRulerCombined}
                  style={{ marginRight: "3px", fontSize: "15px" }}
                />
                {detailData.acreage}m2
              </p>
              <p
                style={{
                  padding: "10px",
                  margin: "5px",
                  color: "black",
                  fontSize: "25px",
                  fontWeight: "500",
                  // borderRight: "2px solid red",
                  textAlign: "center",
                }}
              >
                <FontAwesomeIcon
                  icon={faHashtag}
                  style={{ marginRight: "1px", fontSize: "20px" }}
                />
                {detailData.newsid}
              </p>
            </div>

            <div>
              <p
                style={{
                  fontSize: "25px",
                  fontWeight: "900",
                  margin: "5px",
                  padding: "5px",
                  // margin: "10px 0",
                  // borderRight: "2px solid red",
                }}
              >
                Thông tin mô tả
              </p>
              <div
                style={{
                  backgroundColor: "white",
                  textAlign: "left",
                  marginLeft: "18px",
                  display: "block",
                  alignItems: "center",
                  fontSize: "18px",
                  justifyContent: "flex-start",
                  margin: "10px 0",
                  whiteSpace: "pre-wrap",
                }}
              >
                <p style={{ fontWeight: "initial" }}>{detailData.describe}</p>
              </div>
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
              ></div>
              <div
                style={{
                  backgroundColor: "white",
                  textAlign: "center",
                  marginLeft: "18px",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "18px",
                  justifyContent: "flex-start",
                  margin: "10px 0",
                }}
              >
                <span style={{ marginRight: "55px" }}>Mã tin : </span>
                <p style={{ fontWeight: "initial" }}>{detailData.newsid}</p>
              </div>

              <div
                style={{
                  backgroundColor: "white",
                  textAlign: "center",
                  marginLeft: "18px",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "18px",
                  justifyContent: "flex-start",
                  margin: "10px 0",
                }}
              >
                <span style={{ marginRight: "25px" }}>Ngày đăng : </span>
                <p style={{ fontWeight: "initial" }}>
                  {formatDate(detailData.timestart)}
                </p>
              </div>
              <div
                style={{
                  backgroundColor: "white",
                  textAlign: "center",
                  marginLeft: "18px",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "18px",
                  justifyContent: "flex-start",
                  margin: "10px 0",
                }}
              >
                <span style={{ marginRight: "7px" }}>Ngày hết hạn : </span>
                <p style={{ fontWeight: "initial" }}>
                  {formatDate(detailData.timeend)}
                </p>
              </div>
            </div>
            <div>
              <p
                style={{
                  fontSize: "25px",
                  fontWeight: "900",
                  margin: "5px",
                  padding: "5px",
                  // margin: "10px 0",
                  // borderRight: "2px solid red",
                }}
              >
                Thông tin liên hệ
              </p>
              <div
                style={{
                  backgroundColor: "white",
                  textAlign: "left",
                  marginLeft: "18px",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "18px",
                  justifyContent: "flex-start",
                  margin: "10px 0",
                }}
              >
                <span style={{ marginRight: "50px" }}>Liên lệ : </span>
                <p style={{ fontWeight: "initial" }}>{detailData.name}</p>
              </div>
              <div
                style={{
                  backgroundColor: "white",
                  marginLeft: "18px",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "18px",
                  justifyContent: "flex-start",
                  margin: "10px 0",
                }}
              >
                <span style={{ marginRight: "25px" }}>Điện thoại : </span>
                <p style={{ fontWeight: "initial" }}>{detailData.phone}</p>
              </div>
            </div>
          </div>
          <div style={{ height: "00px" }} class="right-part right-part-detail ">
            <div className="des">
              <img
                style={{ width: "100px", height: "100px" }}
                src="https://t4.ftcdn.net/jpg/03/49/49/79/360_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg"
              />
              <p
                style={{
                  fontSize: "25px",
                  margin: "5px",
                  fontWeight: 900,
                }}
              ></p>
              <button style={{ fontSize: "23px" }}>{detailData.name}</button>
              <button style={{ fontSize: "25px" }}>
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
