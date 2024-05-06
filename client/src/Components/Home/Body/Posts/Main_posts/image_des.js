import React, { useState, useEffect } from "react";
import "../Main_posts/main_posts.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleUp } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
function Image_des() {
  const [data, setData] = useState([]);
  const [sortBy, setSortBy] = useState("default"); // Trạng thái của loại sắp xếp
  console.log(data);

  useEffect(() => {
    // Hàm gọi API khi component được render
    fetchData();
  }, []);

  // Hàm để gọi API
  const fetchData = () => {
    axios
      .get("http://localhost:3000/api/posts")
      .then((response) => {
        // Lưu trữ dữ liệu vào state
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };
  const [showScrollButton, setShowScrollButton] = useState(false);
  useEffect(() => {
    const handleScrollTop = () => {
      if (window.scrollY > 200) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener("scroll", handleScrollTop);

    return () => {
      window.removeEventListener("scroll", handleScrollTop);
    };
  }, []);
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleSortByChange = (type) => {
    setSortBy(type);
  };
  const formatMoney = (amount) => {
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
      return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Định dạng lại số tiền với dấu phẩy ngăn cách hàng nghìn
    }
  };
  return (
    <div className="container_form" style={{ height: "100%" }}>
      <span
        className="total_result"
        style={{ fontSize: "25px", fontWeight: 700 }}
      >
        Tổng 124.152 kết quả
      </span>
      <div className="sort">
        <p>Sắp xếp: </p>
        {/* Thêm className active cho nút mặc định */}
        <span
          className={sortBy === "default" ? "active" : ""}
          onClick={() => handleSortByChange("default")}
        >
          Mặc định
        </span>
        <span
          className={sortBy === "newest" ? "active" : ""}
          onClick={() => handleSortByChange("newest")}
        >
          Mới nhất
        </span>
      </div>
      {data.map((item) => (
        <Link
          key={item.newsid}
          style={{ textDecoration: "none", color: "black" }}
          to={{
            pathname: `/detail/${item.newsid}`,
            state: { selectedItem: item }, // Truyền dữ liệu của thẻ qua trang chi tiết
          }}
        >
          <div
            class="container-posts"
            style={{
              border: "5px solid #ccc",
              margin: "30px 0",
              boder: "none",
            }}
          >
            <div
              class="left-part"
              style={{
                flex: 2,
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src="https://tse4.mm.bing.net/th?id=OIP.XtlXmrujgxcWTyVw8iThMgHaE7&pid=Api&P=0&h=220"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              />
            </div>
            <div
              class="right-part "
              style={{
                textAlign: "left",
                flex: 3,
                left: "0",
              }}
            >
              <div style={{ padding: "5px", margin: "5px" }}>
                <p style={{ color: "#E13427", fontSize: "28px" }}>
                  {item.title}
                </p>

                <div
                  className="item-separator"
                  style={{
                    display: "flex",
                    justifyContent: "space-evenly",
                    fontSize: "23px",
                    fontWeight: "700",
                    listStyle: "none",
                  }}
                >
                  <li className="price" style={{ color: "#16c784" }}>
                    {formatMoney(item.price)} đồng/tháng
                    {/* Chuyển đổi số tiền thành dạng tiền tệ Việt Nam */}
                  </li>
                  <li className="area">{item.area} m2</li>
                  <li className="location">{item.location} </li>
                </div>
                <span
                  style={{
                    fontWeight: "700",
                    fontSize: "25px",
                    margin: "5px",
                    padding: "5px",
                    display: "block",
                  }}
                ></span>
                <span
                  style={{
                    fontWeight: "700",
                    fontSize: "25px",
                    padding: "10px",
                    marginTop: "200px",
                  }}
                >
                  {item.description}
                </span>
                <div
                  className="img-name"
                  style={{
                    marginTop: "30px",
                    alignContent: "center",
                    alignItems: "center",
                    display: "flex",
                    marginLeft: "50px",
                  }}
                >
                  <img
                    src="https://tse4.mm.bing.net/th?id=OIP.XtlXmrujgxcWTyVw8iThMgHaE7&pid=Api&P=0&h=220"
                    style={{
                      borderRadius: "50%",
                      width: "150px",
                      marginRight: "30px",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "25px",
                      fontWeight: "900",
                      color: "#f83859",
                    }}
                  >
                    {item.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}

      <div className="page">
        <span className="separator"></span>
        <ul className="pagination">
          <li>Trang trước</li>

          <li>1</li>
          <li>2</li>
          <li>3</li>
          <li>...</li>
          <li>Trang sau</li>
        </ul>
        <span className="separator"></span>
      </div>
      {showScrollButton && (
        <button id="scroll-top-btn" onClick={handleScrollTop}>
          <FontAwesomeIcon icon={faArrowAltCircleUp} />
        </button>
      )}
    </div>
  );
}

export default Image_des;
