import React, { useState } from "react";
import axios from "axios";
import "./style.css"; // Import CSS for styling
import Slogan from "../../../Slogan/slogan";
import Back from "../../../Back/back";

const Main = () => {
  const [selectedIssue, setSelectedIssue] = useState(""); // State để lưu trữ vấn đề được chọn
  const [customIssue, setCustomIssue] = useState(""); // State để lưu trữ nội dung của vấn đề tùy chỉnh
  const handleReportSubmit = async () => {
    // Xử lý khi người dùng gửi báo cáo
    console.log("Vấn đề báo cáo:", selectedIssue);
    if (selectedIssue === "Vấn đề khác") {
      console.log("Nội dung vấn đề tùy chỉnh:", customIssue);
    }
    // Đặt logic để gửi dữ liệu báo cáo lên server ở đây
  };

  return (
    <div className="Main">
      <Back style={{ marginTop: "50px" }} className="back" />
      <Slogan className="slogan" style={{ marginTop: "-50px" }} />
      <div style={{ marginBottom: "-200px" }} className="report-section">
        <form onSubmit={handleReportSubmit}>
          <h2
            style={{
              fontSize: "35px",
              fontWeight: 900,
              textAlign: "left",
              color: "red",
            }}
          >
            Báo cáo vấn đề
          </h2>
          <div className="radio-options">
            <label>
              <input
                type="radio"
                value="Ảnh không đúng"
                checked={selectedIssue === "Ảnh không đúng"}
                onChange={() => setSelectedIssue("Ảnh không đúng")}
              />
              Ảnh không đúng
            </label>
            <label>
              <input
                type="radio"
                value="Nội dung nhạy cảm"
                checked={selectedIssue === "Nội dung nhạy cảm"}
                onChange={() => setSelectedIssue("Nội dung nhạy cảm")}
              />
              Nội dung nhạy cảm
            </label>
            <label>
              <input
                type="radio"
                value="Khủng bố"
                checked={selectedIssue === "Khủng bố"}
                onChange={() => setSelectedIssue("Khủng bố")}
              />
              Khủng bố
            </label>
            <label>
              <input
                type="radio"
                value="Spam"
                checked={selectedIssue === "Spam"}
                onChange={() => setSelectedIssue("Spam")}
              />
              Spam
            </label>
            <label>
              <input
                type="radio"
                value="Bạo lực"
                checked={selectedIssue === "Bạo lực"}
                onChange={() => setSelectedIssue("Bạo lực")}
              />
              Bạo lực
            </label>
            <label>
              <input
                type="radio"
                value="Vấn đề khác"
                checked={selectedIssue === "Vấn đề khác"}
                onChange={() => setSelectedIssue("Vấn đề khác")}
              />
              Vấn đề khác
            </label>
          </div>
          {selectedIssue === "Vấn đề khác" && (
            <div className="custom-issue">
              <label>Nội dung vấn đề:</label>
              <input
                type="text"
                value={customIssue}
                onChange={(e) => setCustomIssue(e.target.value)}
              />
            </div>
          )}
          <button
            style={{ display: "inline-block", width: "150px" }}
            type="submit"
          >
            Gửi báo cáo
          </button>
        </form>
      </div>
    </div>
  );
};

export default Main;
