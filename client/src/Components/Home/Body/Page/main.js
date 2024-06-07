import React, { useState } from "react";
import "./style.css";

function Main() {
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageClick = (page) => {
    if (page === "previous" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (page === "next" && currentPage < 5) {
      setCurrentPage(currentPage + 1);
    } else if (typeof page === "number") {
      setCurrentPage(page);
    }
  };

  return (
    <div
      className="Page"
      style={{
        textAlign: "center",
        alignItems: "center",
        display: "flex",
        margin: "0 auto",
      }}
    >
      {/* Hiển thị các nút phân trang */}
      <div
        className="pagination"
        style={{
          textAlign: "center",
          alignItems: "center",
          display: "flex",
          margin: "0 auto",
        }}
      >
        <ul
          style={{ display: "flex", textAlign: "center", alignItems: "center" }}
        >
          <li
            style={{
              fontSize: "21px",
              cursor: "pointer",
              color: currentPage === 1 ? "black" : "black",
            }}
            onClick={() => handlePageClick("previous")}
          >
            Trang trước
          </li>

          {[1, 2, 3, 4, 5].map((page) => (
            <li
              key={page}
              style={{
                fontSize: "21px",
                cursor: "pointer",
                color: currentPage === page ? "white" : "black",
                backgroundColor: currentPage === page ? "#e13427" : "",
              }}
              onClick={() => handlePageClick(page)}
            >
              {page}
            </li>
          ))}

          <li
            style={{
              fontSize: "21px",
              cursor: "pointer",
              color: currentPage === 5 ? "black" : "black",
            }}
            onClick={() => handlePageClick("next")}
          >
            Trang sau
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Main;
