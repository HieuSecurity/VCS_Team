import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import "./payment.css"; // Import CSS file for styling

const PostTable = () => {
  const [payments, setPayments] = useState([]);
  const [originalPayments, setOriginalPayments] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const adminEmail = user ? user.EMAIL : null; // Lấy EMAIL thay vì ADMINID
  const [reason, setReason] = useState(""); // Lý do từ chối hoặc xóa bài viết
  const [searchId, setSearchId] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const formatDate = (dateString) => {
    return format(parseISO(dateString), "yyyy/MM/dd HH:mm:ss");
  };
  const formatMoney = (amount) => {
    return amount
      .toLocaleString("en-US", { style: "currency", currency: "USD" })
      .replace(/\$/, "")
      .replace(/\.00$/, "");
  };

  // Function to render icon based on payment state
  const renderIcon = (state, payment) => {
    switch (state) {
      case "Chờ duyệt":
        return (
          <div className="icons" style={{ display: "flex" }}>
            <FontAwesomeIcon
              icon={faTimes}
              title="Từ chối"
              className="icon"
              style={{
                color: "red",
                cursor: "pointer",
                marginRight: "10px",
                backgroundColor: "white",
              }}
              onClick={() => confirmReject(payment)}
            />
            <FontAwesomeIcon
              icon={faCheck}
              title="Duyệt"
              className="icon"
              style={{
                color: "green",
                cursor: "pointer",
                backgroundColor: "white",
              }}
              onClick={() => confirmApprove(payment)}
            />
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              title="Lỗi"
              className="icon"
              style={{
                color: "orange",
                cursor: "pointer",
                backgroundColor: "white",
              }}
              onClick={() => confirmError(payment)}
            />
          </div>
        );
      case "Thành công":
        return (
          <FontAwesomeIcon
            icon={faCheck}
            title="Đã duyệt"
            style={{ color: "green" }}
          />
        );
      case "Không thành công":
        return (
          <FontAwesomeIcon
            icon={faTimes}
            title="Không thành công"
            style={{ color: "red" }}
          />
        );
      default:
        return null;
    }
  };

  // Confirm approve action
  const confirmApprove = (payment) => {
    if (window.confirm("Bạn có chắc muốn duyệt thanh toán này?")) {
      handleApprove(payment);
    }
  };

  // Confirm reject action
  const confirmReject = (payment) => {
    if (window.confirm("Bạn có chắc muốn hủy thanh toán này?")) {
      const reasonInput = prompt("Nhập lý do hủy giao dịch:");
      if (reasonInput) {
        setReason(reasonInput);
        handleReject(payment, reasonInput);
      }
    }
  };

  // Confirm error action
  const confirmError = (payment) => {
    if (
      window.confirm("Bạn có chắc muốn thông báo giao dịch lỗi tới người dùng?")
    ) {
      const errorInput = prompt("Nhập lỗi:");
      if (errorInput) {
        setReason(errorInput);
        handleError(payment, errorInput);
      }
    }
  };

  // Handle approve action
  const handleApprove = async (payment) => {
    try {
      // Update payment state
      await axios.put(
        `http://localhost:3000/api/update-paymentState/${payment.PAYID}`,
        {
          state: "Thành công",
          ADMINEMAIL: adminEmail,
        }
      );

      // Update news state
      await axios.post(`http://localhost:3000/api/update-newsState`, {
        newsid: payment.NEWSID,
        state: "Hoạt động",
      });

      // Update timestart timeend
      await axios.post(`http://localhost:3000/api/update-news-detail`, {
        newsid: payment.NEWSID,
      });

      // Create notification
      await axios.post(`http://localhost:3000/api/create-notification`, {
        newsid: payment.NEWSID,
        content: `Thanh toán có mã số ${payment.PAYID} đã hoàn tất. Bài đăng ${payment.NEWSID} đã được hiển thị.`,
        reason: "", // Không có lý do khi đồng ý
        category: "Thanh toán",
      });

      // Update local state or fetch payments again
      fetchPayments();
    } catch (error) {
      console.error("Error approving payment:", error);
    }
  };

  // Handle reject action
  const handleReject = async (payment, reason) => {
    try {
      // Update payment state
      await axios.put(
        `http://localhost:3000/api/update-paymentState/${payment.PAYID}`,
        {
          state: "Không thành công",
          ADMINEMAIL: adminEmail,
        }
      );

      // Update news state
      await axios.post(`http://localhost:3000/api/update-newsState`, {
        newsid: payment.NEWSID,
        state: "Bị từ chối",
      });

      // Create notification
      await axios.post(`http://localhost:3000/api/create-notification`, {
        newsid: payment.NEWSID,
        content: `Thanh toán có mã số ${payment.PAYID} đã bị từ chối.`,
        reason: reason, // Lý do từ chối
        category: "Thanh toán",
      });

      // Create notification
      await axios.post(`http://localhost:3000/api/create-notification`, {
        newsid: payment.NEWSID,
        content: `Bài đăng ${payment.NEWSID} bị từ chối`,
        reason: `Thanh toán mã số ${payment.PAYID} không thành công`, // Lý do từ chối
        category: "Thanh toán",
      });

      // Update local state or fetch payments again
      fetchPayments();
    } catch (error) {
      console.error("Error rejecting payment:", error);
    }
  };

  // Handle error action
  const handleError = async (payment, errorInput) => {
    try {
      // Create notification
      await axios.post(`http://localhost:3000/api/create-notification`, {
        newsid: payment.NEWSID,
        content: `Thanh toán có mã số ${payment.PAYID} bị lỗi: ${errorInput}`,
        reason: "", // Không có lý do khi thông báo lỗi
        category: "Thanh toán",
      });

      // Update local state or fetch payments again
      fetchPayments();
    } catch (error) {
      console.error("Error notifying payment error:", error);
    }
    alert("Gửi thông báo thành công.");
  };

  // Fetch payments
  const fetchPayments = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/payment");
      setPayments(response.data);
      setOriginalPayments(response.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  // Sort payments
  const sortedPayments = [...payments].sort((a, b) => {
    // Đặt các bài đăng chờ duyệt lên đầu, sắp xếp theo thời gian
    if (a.STATE === "Chờ duyệt" && b.STATE !== "Chờ duyệt") {
      return -1;
    }
    if (b.STATE === "Chờ duyệt" && a.STATE !== "Chờ duyệt") {
      return 1;
    }
    if (a.STATE === "Chờ duyệt" && b.STATE === "Chờ duyệt") {
      return parseISO(b.TIME) - parseISO(a.TIME);
    }
    // Sắp xếp những bài đăng còn lại theo thời gian
    return parseISO(b.TIME) - parseISO(a.TIME);
  });

  const handleSearch = () => {
    // Lấy giá trị tìm kiếm, bỏ khoảng trắng đầu và cuối, và chuyển thành chữ thường
    const trimmedSearchId = searchId.trim();
  
    const filteredData = [];
  
    for (let i = 0; i < originalPayments.length; i++) {
      const payment = originalPayments[i];
  
      // Chuyển các trường thông tin của người dùng thành chữ thường để so sánh
      const payIdStr = payment.PAYID.toString();
      const newsIdStr = payment.NEWSID.toString();
      // Kiểm tra nếu searchId hoặc searchContact không rỗng
      const matchId = trimmedSearchId
        ? payIdStr === trimmedSearchId ||
          newsIdStr === trimmedSearchId
        : true;
  
      if (matchId) {
        filteredData.push(payment);
      }
    }
    setPayments(filteredData);
  };

  return (
    <div className="table-container">
      <h1>Thông tin thanh toán tại Phongtro123</h1>
      <table className="table">
          <thead>
          <tr>
              <th style={{width: "100%"}}>
                Mã thanh toán/ Mã bài viết
                <input 
                  type="text" 
                  value={searchId} 
                  onChange={(e) => setSearchId(e.target.value)} 
                  placeholder="Tìm kiếm mã ID" 
                />
                <FontAwesomeIcon 
                icon={faSearch} 
                onClick={handleSearch} 
                style={{ cursor: "pointer", marginLeft: "20px"}} 
              />
              </th>
            </tr>
          </thead>
        </table>
      <table className="table">
        <thead>
          <tr>
            <th>Mã thanh toán</th>
            <th>Mã bài đăng</th>
            <th>Khách hàng</th>
            <th>Số tiền</th>
            <th>Thời gian thanh toán</th>
            <th>Admin</th>
            <th>Trạng thái</th>
            <th>Chức năng</th>
          </tr>
        </thead>
        <tbody>
          {sortedPayments.map((payment) => (
            <tr
              key={payment.PAYID}
              style={{
                backgroundColor:
                  payment.STATE === "Chờ duyệt" ? "#16c784" : "transparent",
                fontWeight: payment.STATE === "Chờ duyệt" ? "bold" : "",
              }}
            >
              <td>{payment.PAYID}</td>
              <td>{payment.NEWSID}</td>
              <td>{payment.USERNAME}</td>
              <td>{formatMoney(payment.PRICE)}</td>
              <td>{formatDate(payment.TIME)}</td>
              <td>{payment.ADMINNAME}</td>
              <td>{payment.STATE}</td>
              <td>{renderIcon(payment.STATE, payment)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PostTable;
