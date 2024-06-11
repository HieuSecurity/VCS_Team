import React, { useState, useEffect } from "react";
import axios from "axios";
import "./style.css"; // Import CSS for styling
import Slogan from "../../../Slogan/slogan";
import Back from "../../../Back/back";

const Main = () => {
  const [selectedIssue, setSelectedIssue] = useState(""); // State để lưu trữ vấn đề được chọn
  const [customIssue, setCustomIssue] = useState(""); // State để lưu trữ nội dung của vấn đề tùy chỉnh
  const [errorMessage, setErrorMessage] = useState(""); // State để lưu trữ thông báo lỗi
  const [postUserId, setPostUserId] = useState(null); // State để lưu trữ USERID của người đăng bài viết

  useEffect(() => {
    const fetchPostUserId = async () => {
      try {
        const newsId = localStorage.getItem("newsID");
        const response = await axios.get(`http://localhost:3000/api/get-post-byNewsId/${newsId}`);
        setPostUserId(response.data.USERID);
      } catch (error) {
        console.error("Error fetching post user ID:", error);
      }
    };

    fetchPostUserId();
  }, []);

  const handleReportSubmit = async (event) => {
    event.preventDefault(); // Ngăn chặn hành vi mặc định của biểu mẫu

    // Kiểm tra xem lý do đã được chọn hoặc nhập vào chưa
    if (!selectedIssue || (selectedIssue === "Vấn đề khác" && !customIssue)) {
      alert("Vui lòng chọn hoặc nhập lý do.");
      return;
    }

//    console.log("Lý do đã chọn: ", selectedIssue);
//    console.log("Lý do đã nhập: ", customIssue);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const newsId = localStorage.getItem("newsID");

      if (!user || !user.EMAIL || !newsId) {
        alert("Thông tin người dùng hoặc bài viết không hợp lệ.");
        return;
      }

      const response = await axios.get(`http://localhost:3000/api/get-userid-byEmail/${user.EMAIL}`);
      const userId = response.data.USERID;
//      console.log("UserId của người tạo report: ", userId);

      const checkReportResponse = await axios.get(`http://localhost:3000/api/check-report-yet/${userId}/${newsId}`);
//      console.log("Dữ liệu từ check report yet: ", checkReportResponse.data);
      if (checkReportResponse.data.reported) {
        alert("Bạn đã báo cáo bài viết này.");
        return;
      }

      const reportData = {
        USERID: userId,
        NEWSID: newsId,
        ISSUE: selectedIssue === "Vấn đề khác" ? customIssue : selectedIssue,
      };
//      console.log("Dữ liệu tạo báo cáo: ", reportData)

      await axios.post("http://localhost:3000/api/create-report", reportData);
      alert("Báo cáo đã được gửi thành công.");

      // Tạo thông báo cho người dùng với nội dung phù hợp
      const notificationData = {
        newsid: newsId,
        content: `Bài viết có mã số ${newsId} của bạn đã bị ai đó cáo báo!`,
        reason: selectedIssue === "Vấn đề khác" ? customIssue : selectedIssue,
        category: "Bài viết",
      };
//      console.log("UserID của người bị báo cáo: ", postUserId);
//      console.log("nội dung tạo thông báo: ", notificationData);

      await axios.post("http://localhost:3000/api/create-notification", notificationData);

      // Sau khi hoàn thành, chuyển hướng về trang bài viết và xóa newsID từ localStorage
      window.location.href = "/";
      localStorage.removeItem("newsID");
    } catch (error) {
      console.error("Error sending report:", error);
      alert("Đã xảy ra lỗi khi gửi báo cáo. Vui lòng thử lại sau.");
    }
  };

  const handleCancel = () => {
    const newsId = localStorage.getItem("newsID");
    window.location.href = `/detail/${newsId}`; // Chuyển hướng về trang chi tiết của bài viết
    localStorage.removeItem("newsID"); // Sau đó xóa newsID khỏi localStorage
  };

  return (
    <div className="MainReport">
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
                value="Thông tin sai sự thật, lừa đảo hoặc gian lận"
                checked={selectedIssue === "Thông tin sai sự thật, lừa đảo hoặc gian lận"}
                onChange={() => setSelectedIssue("Thông tin sai sự thật, lừa đảo hoặc gian lận")}
              />
              Thông tin sai sự thật, lừa đảo hoặc gian lận
            </label>
            <label>
              <input
                type="radio"
                value="Nội dung nhạy cảm, quấy rối"
                checked={selectedIssue === "Nội dung nhạy cảm, quấy rối"}
                onChange={() => setSelectedIssue("Nội dung nhạy cảm, quấy rối")}
              />
              Nội dung nhạy cảm, quấy rối
            </label>
            <label>
              <input
                type="radio"
                value="Nội dung mang tính bạo lực, khủng bố, thù ghét hoặc gây phiền toái"
                checked={selectedIssue === "Nội dung mang tính bạo lực, khủng bố, thù ghét hoặc gây phiền toái"}
                onChange={() => setSelectedIssue("Nội dung mang tính bạo lực, khủng bố, thù ghét hoặc gây phiền toái")}
              />
              Nội dung mang tính bạo lực, khủng bố, thù ghét hoặc gây phiền toái
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
                value="Tự tử hoặc gây thương tích"
                checked={selectedIssue === "Tự tử hoặc gây thương tích"}
                onChange={() => setSelectedIssue("Tự tử hoặc gây thương tích")}
              />
              Tự tử hoặc gây thương tích
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
          <button
            style={{ display: "inline-block", width: "150px", marginLeft: "25px"}}
            type="button"
            onClick={handleCancel}
          >
            Hủy
          </button>
        </form>
      </div>
    </div>
  );
};

export default Main;
