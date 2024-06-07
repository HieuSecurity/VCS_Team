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

import React, { useState, useEffect } from "react";
import "../Main_posts/main_posts.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleUp } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Search from "../../Search/search";
import { format, parseISO } from "date-fns";
import moment from "moment";

function Image_des() {
  const [data, setData] = useState({ results: [], total: 0 });
  const [sortBy, setSortBy] = useState("default");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

      if (sort === "newest") {
        filteredData.sort((a, b) => new Date(b.TIME) - new Date(a.TIME));
        filteredData = filteredData.slice(0, 10);
      }

      setData({ results: filteredData, total: filteredData.length });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSortByChange = (type) => {
    setSortBy(type);
    fetchData(type, selectedDistrict);
  };

  const formatDate = (dateString) => {
    return dateString ? format(parseISO(dateString), "yyyy/MM/dd") : "null";
  };

  const formatMoney = (amount) => {
    if (amount < 1000000) {
      return (amount / 1000).toFixed(0) + " ngàn";
    } else if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(1) + " tỷ";
    } else if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + " triệu";
    } else {
      return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  };

  const handleSearch = (district) => {
    setSelectedDistrict(district);
    fetchData(sortBy, district);
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container_form" style={{ height: "100%" }}>
      <Search onSearch={handleSearch} />
      <div className="sort" style={{ fontSize: "25px" }}>
        <p style={{ fontSize: "22px", padding: "10px" }}>Sắp xếp :</p>
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

      {data.results.map((item) => (
        <Link
          key={item.NEWSID}
          style={{ textDecoration: "none", color: "black" }}
          to={{
            pathname: `/detail/${item.NEWSID}`,
            state: { selectedItem: item },
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
                  width: "600px",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "450px",
                  borderRadius: "5px",
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
                ></span>
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

