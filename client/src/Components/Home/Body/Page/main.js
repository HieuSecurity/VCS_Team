import React, { useState, useEffect } from "react";

function Main() {
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
          <li style={{ fontSize: "18px" }}>Trang trước</li>

          <li>1</li>
          <li>2</li>
          <li>3</li>

          <li>4</li>
          <li>5</li>
          <li style={{ fontSize: "18px" }}>Trang sau</li>
        </ul>
      </div>
    </div>
  );
}

export default Main;
