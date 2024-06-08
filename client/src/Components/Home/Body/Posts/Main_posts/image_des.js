// import React, { useState, useEffect } from "react";
// import "../Main_posts/main_posts.css";
// import { Link } from "react-router-dom";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faArrowAltCircleUp } from "@fortawesome/free-solid-svg-icons";
// import axios from "axios";
// import Search from "../../Search/search";
// import { format, parseISO } from "date-fns";

// function Image_des() {
//   const [data, setData] = useState({ results: [], total: 0 });
//   const [sortBy, setSortBy] = useState("default");
//   const [selectedDistrict, setSelectedDistrict] = useState("");

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleSortByChange = (type) => {
//     setSortBy(type);
//     if (type === "default") {
//       fetchData();
//     } else if (type === "newest") {
//       fetchLatestPosts();
//     }
//   };

//   const formatDate = (dateString) => {
//     return dateString ? format(parseISO(dateString), "yyyy/MM/dd") : "null";
//   };

//   const fetchData = () => {
//     axios
//       .get("http://localhost:3000/api/get-posts")
//       .then((response) => {
//         const filteredData = response.data.results.filter(
//           (post) => post.STATE === "Hoạt động"
//         );
//         setData({ results: filteredData, total: filteredData.length });
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//   };


//   const [showScrollButton, setShowScrollButton] = useState(false);
//   useEffect(() => {
//     const handleScrollTop = () => {
//       if (window.scrollY > 200) {
//         setShowScrollButton(true);
//       } else {
//         setShowScrollButton(false);
//       }
//     };

//     window.addEventListener("scroll", handleScrollTop);

//     return () => {
//       window.removeEventListener("scroll", handleScrollTop);
//     };
//   }, []);

//   const handleScrollTop = () => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const fetchLatestPosts = () => {
//     axios
//       .get("http://localhost:3000/api/get-posts")
//       .then((response) => {
//         // Filter posts with STATE === "Hoạt động"
//         const filteredData = response.data.results.filter(
//           (post) => post.STATE === "Hoạt động"
//         );

//         // Sort posts by TIME in descending order (most recent first)
//         filteredData.sort((a, b) => new Date(b.TIME) - new Date(a.TIME));

//         // Select the 10 most recent posts
//         const latestPosts = filteredData.slice(0, 10);

//         setData({ results: latestPosts, total: latestPosts.length });
//       })
//       .catch((error) => {
//         console.error("Error fetching latest posts:", error);
//       });
//   };

//   const formatMoney = (amount) => {
//     if (amount < 1000000) {
//       return (amount / 1000).toFixed(0) + " ngàn";
//     } else if (amount >= 1000000000) {
//       return (amount / 1000000000).toFixed(1) + " tỷ";
//     } else if (amount >= 1000000) {
//       return (amount / 1000000).toFixed(1) + " triệu";
//     } else {
//       return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//     }
//   };

//   const handleSearch = (selectedDistrict) => {
//     setSelectedDistrict(selectedDistrict);
//     if (selectedDistrict === "all") {
//       axios
//         .get(`http://localhost:3000/api/get-posts`)
//         .then((response) => {
//           const filteredData = response.data.results.filter(
//             (post) => post.STATE === "Hoạt động"
//           );
//           setData({ results: filteredData, total: filteredData.length });
//           setSortBy("default");
//         })
//         .catch((error) => {
//           console.error("Error fetching data:", error);
//         });
//     } else if (selectedDistrict !== "all") {
//       axios
//         .get(
//           `http://localhost:3000/api/search-posts-location?district=${selectedDistrict}`
//         )
//         .then((response) => {
//           const filteredData = response.data.results.filter(
//             (post) => post.STATE === "Hoạt động"
//           );
//           setData({ results: filteredData, total: filteredData.length });
//           setSortBy("default");
//         })
//         .catch((error) => {
//           console.error("Error fetching data:", error);
//         });
//     }
//   };

//   return (
//     <div className="container_form" style={{ height: "100%" }}>
//       <Search onSearch={handleSearch} />
//       <div className="sort" style={{ fontSize: "25px" }}>
//         <p style={{ fontSize: "22px", padding: "10px" }}>Sắp xếp : </p>
//         <span
//           className={sortBy === "default" ? "active" : ""}
//           onClick={() => handleSortByChange("default")}
//           style={{ fontSize: "22px", fontWeight: "bold" }}
//         >
//           Tất cả
//         </span>
//         <span
//           className={sortBy === "newest" ? "active" : ""}
//           onClick={() => handleSortByChange("newest")}
//           style={{ fontSize: "22px", fontWeight: "bold" }}
//         >
//           Mới nhất
//         </span>
//       </div>
//       <span
//         className="total_result"
//         style={{ fontSize: "30px", fontWeight: 700, marginLeft: "18px" }}
//       >
//         Tổng kết quả:
//         <h5
//           style={{
//             color: "red",
//             fontSize: "35px",
//             marginLeft: "5px",
//             textAlign: "center",
//             alignItems: "center",
//           }}
//         >
//           {data.total}
//         </h5>
//       </span>

//       {data.results.map((item) => (
//         <Link
//           key={item.NEWSID}
//           style={{ textDecoration: "none", color: "black" }}
//           to={{
//             pathname: `/detail/${item.NEWSID}`,
//             state: { selectedItem: item },
//           }}
//         >
//           <div
//             className="container-posts"
//             style={{
//               border: "5px solid #ccc",
//               margin: "30px 0",
//               boder: "none",
//             }}
//           >
//             <div
//               className="left-part"
//               style={{
//                 flex: 2,
//                 width: "100%",
//                 justifyContent: "center",
//                 alignItems: "center",
//               }}
//             >
//               <img
//                 src={`http://localhost:3000/uploads/${item.image}`}
//                 style={{
//                   width: "600px",
//                   justifyContent: "center",
//                   alignItems: "center",
//                   height: "450px",
//                   borderRadius: "5px",
//                 }}
//               />
//             </div>
//             <div
//               className="right-part"
//               style={{
//                 textAlign: "left",
//                 flex: 3,
//                 left: "0",
//               }}
//             >
//               <div style={{ padding: "5px", margin: "5px" }}>
//                 <p style={{ color: "#E13427", fontSize: "28px" }}>
//                   {item.TITLE}
//                 </p>

//                 <div
//                   className="item-separator"
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-evenly",
//                     fontSize: "23px",
//                     fontWeight: "700",
//                     listStyle: "none",
//                   }}
//                 >
//                   <li className="price" style={{ color: "#16c784" }}>
//                     {formatMoney(item.PRICE)} đồng/tháng
//                   </li>
//                   <li className="acreage">{item.ACREAGE} m2</li>
//                   <li className="district">{item.district}</li>
//                 </div>
//                 <span
//                   style={{
//                     fontWeight: "700",
//                     fontSize: "25px",
//                     margin: "5px",
//                     padding: "5px",
//                     display: "block",
//                   }}
//                 ></span>
//                 <span
//                   style={{
//                     fontWeight: "700",
//                     fontSize: "25px",
//                     padding: "10px",
//                     marginTop: "200px",
//                   }}
//                 ></span>
//                 <div
//                   className="img-name"
//                   style={{
//                     marginTop: "30px",
//                     alignContent: "center",
//                     alignItems: "center",
//                     display: "flex",
//                     marginLeft: "50px",
//                   }}
//                 >
//                   <img
//                     src="https://t4.ftcdn.net/jpg/03/49/49/79/360_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg"
//                     style={{
//                       borderRadius: "50%",
//                       width: "100px",
//                       marginRight: "10px",
//                       height: "100px",
//                       marginLeft: "-30px",
//                     }}
//                   />
//                   <span
//                     style={{
//                       fontSize: "25px",
//                       fontWeight: "900",
//                       color: "#f83859",
//                     }}
//                   >
//                     {item.NAME}
//                   </span>
//                   <span
//                     style={{
//                       fontSize: "25px",
//                       fontWeight: "900",
//                       color: "rgb(22, 199, 132)",
//                       marginLeft: "50px",
//                     }}
//                   >
//                     {formatDate(item.TIMESTART)}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </Link>
//       ))}

//       {showScrollButton && (
//         <button id="scroll-top-btn" onClick={handleScrollTop}>
//           <FontAwesomeIcon icon={faArrowAltCircleUp} />
//         </button>
//       )}
//     </div>
//   );
// }

// export default Image_des;

import React, { useState, useEffect, useMemo } from "react";
import "../Main_posts/main_posts.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleUp } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Search from "../../Search/search";
import { format, parseISO } from "date-fns";
import moment from "moment";

const ImageDes = () => {
  const [data, setData] = useState({ results: [], total: 0 });
  const [sortBy, setSortBy] = useState("default");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollButton(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const fetchData = async (sort = "default", district = "") => {
    try {
      let url = "http://localhost:3000/api/get-posts";
      if (district && district !== "all") {
        url = `http://localhost:3000/api/search-posts-location?district=${district}`;
      }

      const response = await axios.get(url);
      let posts = response.data.results;







      // Update post state if TIMEEND > current time
      const currentTime = moment();
      for (let post of posts) {
        if (moment(post.TIMEEND).isBefore(currentTime) && post.STATE !== "Hết hạn") {
          await axios.get(`http://localhost:3000/api/newState-Post/${post.NEWSID}`);
        }
      }

      // Re-fetch posts after updating states
      const updatedResponse = await axios.get(url);
      let filteredData = updatedResponse.data.results.filter(
        (post) => post.STATE === "Hoạt động"
      );

      shuffleArray(filteredData); // Xáo trộn bài viết để hiển thị các bài khác nhau khi load page

      if (sort === "newest") {
        filteredData.sort((a, b) => new Date(b.TIME) - new Date(a.TIME));
        filteredData = filteredData.slice(0, 10);
      }

      setData({ results: filteredData, total: filteredData.length });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchLatestPosts = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/get-posts");
      const filteredData = response.data.results
        .filter(post => post.STATE === "Hoạt động")
        .sort((a, b) => new Date(b.TIMESTART) - new Date(a.TIMESTART))
        .slice(0, 10);
      setData({ results: filteredData, total: filteredData.length });
    } catch (error) {
      console.error("Error fetching latest posts:", error);
    }
  };

  const handleSortByChange = type => {
    setSortBy(type);
    type === "default" ? fetchData() : fetchLatestPosts();
  };

  const handleSearch = (selectedDistrict) => {
    setSelectedDistrict(selectedDistrict);
    if (selectedDistrict === "all") {
      axios
        .get(`http://localhost:3000/api/get-posts`)
        .then((response) => {
          const filteredData = response.data.results.filter(
            (post) => post.STATE === "Hoạt động"
          );
          setData({ results: filteredData, total: filteredData.length });
          setSortBy("default");
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    } else if (selectedDistrict !== "all") {
      axios
        .get(
          `http://localhost:3000/api/search-posts-location?district=${selectedDistrict}`
        )
        .then((response) => {
          const filteredData = response.data.results.filter(
            (post) => post.STATE === "Hoạt động"
          );
          setData({ results: filteredData, total: filteredData.length });
          setSortBy("default");
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  };

  const formatDate = dateString =>
    dateString ? format(parseISO(dateString), "yyyy/MM/dd") : "null";

  const formatMoney = amount => {
    if (amount < 1000000) return (amount / 1000).toFixed(0) + " ngàn";
    if (amount >= 1000000000) return (amount / 1000000000).toFixed(1) + " tỷ";
    return (amount / 1000000).toFixed(1) + " triệu";
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const memoizedData = useMemo(
    () => data.results.map(item => ({ ...item, formattedDate: formatDate(item.TIMESTART), formattedPrice: formatMoney(item.PRICE) })),
    [data.results]
  );

  const handlePageClick = (page) => {
    if (page === "previous" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (page === "next" && currentPage < Math.ceil(data.total / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    } else if (typeof page === "number") {
      setCurrentPage(page);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = memoizedData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="container_form" style={{ height: "100%" }}>
      <Search onSearch={handleSearch} />
      <div className="sort" style={{ fontSize: "25px" }}>
        <p style={{ fontSize: "22px", padding: "10px" }}>Sắp xếp : </p>
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
          {data.total}
        </h5>
      </span>

      {currentItems.map(item => (
        <Link
          key={item.NEWSID}
          style={{ textDecoration: "none", color: "black" }}
          to={`/detail/${item.NEWSID}`}
        >
          <div
            className="container-posts"
            style={{
              border: "5px solid #ccc",
              margin: "30px 0",
              border: "none",
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
                  width: "600px",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "450px",
                  borderRadius: "5px",
                }}
                alt={item.TITLE}
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
                    {item.formattedPrice} đồng/tháng
                  </li>
                  <li className="acreage">{item.ACREAGE} m2</li>
                  <li className="district">{item.district}</li>
                </div>
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
                    src="https://t4.ftcdn.net/jpg/03/49/49/79/360_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg"
                    style={{
                      borderRadius: "50%",
                      width: "100px",
                      marginRight: "10px",
                      height: "100px",
                      marginLeft: "-30px",
                    }}
                    alt={item.NAME}
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
                    {item.formattedDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}

      <div className="pagination" style={{ textAlign: "center", marginTop: "20px" }}>
        <ul style={{ display: "flex", justifyContent: "center", padding: 0, listStyle: "none" }}>
          <li
            style={{
              fontSize: "21px",
              cursor: "pointer",
              color: currentPage === 1 ? "grey" : "black",
              margin: "0 10px",
            }}
            onClick={() => handlePageClick("previous")}
          >
            Trang trước
          </li>
          {[...Array(Math.ceil(data.total / itemsPerPage)).keys()].map(page => (
            <li
              key={page + 1}
              style={{
                fontSize: "21px",
                cursor: "pointer",
                color: currentPage === page + 1 ? "white" : "black",
                backgroundColor: currentPage === page + 1 ? "#e13427" : "",
                margin: "0 10px",
                padding: "5px 10px",
              }}
              onClick={() => handlePageClick(page + 1)}
            >
              {page + 1}
            </li>
          ))}
          <li
            style={{
              fontSize: "21px",
              cursor: "pointer",
              color: currentPage === Math.ceil(data.total / itemsPerPage) ? "grey" : "black",
              margin: "0 10px",
            }}
            onClick={() => handlePageClick("next")}
          >
            Trang sau
          </li>
        </ul>
      </div>

      {showScrollButton && (
        <button id="scroll-top-btn" onClick={handleScrollTop} style={{ position: "fixed", bottom: "20px", right: "20px" }}>
          <FontAwesomeIcon icon={faArrowAltCircleUp} />
        </button>
      )}
    </div>
  );
};

export default ImageDes;
