import Slogan from "../../Slogan/slogan";
import "../../DetailPost/detail.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";
import Back from "../../Back/back";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
function Detail() {
  const { id } = useParams();
  const [detailData, setDetailData] = useState(null); // State để lưu trữ dữ liệu chi tiết
  function formatMoney(amount) {
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
      return (amount / 1000000).toFixed(1) + " triệu";
    } else {
      return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " đồng"; // Định dạng lại số tiền với dấu phẩy ngăn cách hàng nghìn và thêm đơn vị đồng
    }
  }
  useEffect(() => {
    // Hàm gọi API khi component được render và id thay đổi
    fetchData();
  }, [id]);

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
            <img
              style={{ width: "100%", height: "380px" }}
              src="https://tse1.mm.bing.net/th?id=OIP.UEMBtc9YaGs3UGnaGAlhPwAAAA&pid=Api&P=0&h=220"
            />
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
                {detailData.address}
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
                }}
              >
                Hôm nay
              </p>
              <p
                style={{
                  padding: "10px",
                  margin: "5px",
                  color: "#16c784",
                  fontSize: "27px",
                  fontWeight: "800",
                  borderRight: "2px solid red",
                }}
              >
                #{detailData.newsid}
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
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "18px",
                  justifyContent: "flex-start",
                  margin: "10px 0",
                }}
              >
                <li>Mã tin : </li>
                <p>#{detailData.newsid}</p>
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
                <p>Thứ 6, 07:17 12/04/2024</p>
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
                <p>Thứ 6, 07:17 12/04/2024</p>
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
              <div
                style={{
                  backgroundColor: "white",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "18px",
                  justifyContent: "flex-start",
                  margin: "10px 0",
                  margin: "10px 0",
                }}
              >
                <li style={{ textAlign: "left" }}>Zalo : </li>
                <p>{detailData.phone}</p>
              </div>
            </div>
          </div>
          <div class="right-part right-part-detail">
            <div className="des">
              <img
                style={{ with: "80px", height: "80px", marginTop: "50px" }}
                src="https://phongtro123.com/images/default-user.png"
              />
              <p
                style={{
                  fontSize: "25px",
                  margin: "5px",
                  fontWeight: 900,
                }}
              >
                {detailData.name}
              </p>
              <button>
                <FontAwesomeIcon
                  icon={faPhone}
                  style={{ marginRight: "10px" }}
                />
                {detailData.phone}
              </button>
              <button>
                <FontAwesomeIcon
                  icon={faFacebook}
                  style={{ marginRight: "10px" }}
                />
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Detail;
