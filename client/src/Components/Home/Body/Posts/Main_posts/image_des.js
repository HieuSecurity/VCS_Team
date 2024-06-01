import React, { useState, useEffect } from "react";
import "../Main_posts/main_posts.css";
import { Link, useFetcher } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleUp } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Search from "../../Search/search";
import { format, parseISO } from "date-fns";

function Image_des() {
  const [data, setData] = useState({ results: [], total: 0 });
  const [sortBy, setSortBy] = useState("default");
  const [totalResults, setTotalResults] = useState(0);
  const [selectedDistrict, setSelectedDistrict] = useState(""); // Thêm state để lưu trữ giá trị Quận được chọn

  // Trạng thái của loại sắp xếp

  useEffect(() => {
    // Hàm gọi API khi component được render
    fetchData();
  }, []);

  // Hàm để gọi API
  const handleSortByChange = (type) => {
    setSortBy(type);
    if (type === "default") {
      // Call API for fetching all posts when "Tất cả" button is clicked
      fetchData();
    } else if (type === "newest") {
      // Call API for fetching latest posts when "Mới nhất" button is clicked
      fetchLatestPosts();
    }
  };

  const formatDate = (dateString) => {
    return dateString ? format(parseISO(dateString), "yyyy/MM/dd") : "null";
  };

  const fetchData = () => {
    axios
      .get("http://localhost:3000/api/get-posts")
      .then((response) => {
        // Lưu trữ dữ liệu vào state
        setData({ results: response.data.results, total: response.data.total });
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

  const fetchLatestPosts = () => {
    axios
      .get("http://localhost:3000/api/latest-posts")
      .then((response) => {
        setData({ results: response.data.results, total: response.data.total });
      })
      .catch((error) => {
        console.error("Error fetching latest posts:", error);
      });
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

  const handleSearch = (selectedDistrict) => {
    setSelectedDistrict(selectedDistrict);
    if (selectedDistrict === "all") {
      axios
        .get(`http://localhost:3000/api/get-posts`)
        .then((response) => {
          setData(response.data);
          setSortBy("default");
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    } else if (selectedDistrict) {
      axios
        .get(
          `http://localhost:3000/api/search-posts-location?district=${selectedDistrict}`
        )
        .then((response) => {
          setData(response.data);
          setSortBy("default");
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    } else {
    }
  };

  return (
    <div className="container_form" style={{ height: "100%" }}>
      <Search onSearch={handleSearch} />
      <div className="sort" style={{ fontSize: "25x" }}>
        <p style={{ fontSize: "22px", padding: "10px" }}>Sắp xếp : </p>
        {/* Thêm className active cho nút mặc định */}
        <span
          className={sortBy === "default" ? "active" : ""}
          onClick={() => handleSortByChange("default")}
          style={{ fontSize: "22px", fontWeight: "bold" }}
        >
          Tất cả
        </span>
        <span
          className={sortBy === "newest" ? "active" : ""}
          onClick={() => handleSortByChange("newest")}
          style={{ fontSize: "22px", fontWeight: "bold" }}
        >
          Mới nhất
        </span>
      </div>
      <span
        className="total_result"
        style={{ fontSize: "30px", fontWeight: 700, marginLeft: "18px" }}
      >
        Tổng kết quả:
        <h5
          style={{
            color: "red",
            fontSize: "35px",
            marginLeft: "5px",
            textAlign: "center",
            alignItems: "center",
          }}
        >
          {" "}
          {data.total}
        </h5>
      </span>

      {data.results.map((item) => (
        <Link
          key={item.NEWSID}
          style={{ textDecoration: "none", color: "black" }}
          to={{
            pathname: `/detail/${item.NEWSID}`,
            state: { selectedItem: item }, // Truyền dữ liệu của thẻ qua trang chi tiết
          }}
        >
          <div
            className="container-posts"
            style={{
              border: "5px solid #ccc",
              margin: "30px 0",
              boder: "none",
            }}
          >
            <div
              className="left-part"
              style={{
                flex: 2,
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={`http://localhost:3000/uploads/${item.image}`}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "600px",
                }}
              />
            </div>
            <div
              className="right-part"
              style={{
                textAlign: "left",
                flex: 3,
                left: "0",
              }}
            >
              <div style={{ padding: "5px", margin: "5px" }}>
                <p style={{ color: "#E13427", fontSize: "28px" }}>
                  {item.TITLE}
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
                    {formatMoney(item.PRICE)} đồng/tháng
                    {/* Chuyển đổi số tiền thành dạng tiền tệ Việt Nam */}
                  </li>
                  <li className="acreage">{item.ACREAGE} m2</li>
                  <li className="district">{item.district}</li>
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
                  {/*Chỗ này trước là mô tả nhưng mô tả nên để trong chi tiết bài đăng*/}
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
                      marginRight: "10px",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "25px",
                      fontWeight: "900",
                      color: "#f83859",
                    }}
                  >
                    {item.NAME}
                  </span>
                  <span
                    style={{
                      fontSize: "25px",
                      fontWeight: "900",
                      color: "rgb(22, 199, 132)",
                      marginLeft: "50px",
                    }}
                  >
                    {formatDate(item.TIMESTART)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}

      {showScrollButton && (
        <button id="scroll-top-btn" onClick={handleScrollTop}>
          <FontAwesomeIcon icon={faArrowAltCircleUp} />
        </button>
      )}
    </div>
  );
}

export default Image_des;
