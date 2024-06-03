import React, { useState, useEffect } from "react";
import axios from "axios";
import "./payment.css"; // Import CSS file for styling
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";

const PostTable = () => {
  const [payments, setPayments] = useState([]);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [paymentSummary, setPaymentSummary] = useState({ total: 0, count: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.EMAIL) {
          const userIdResponse = await axios.get(`http://localhost:3000/api/get-userid-byEmail/${user.EMAIL}`);
          const USERID = userIdResponse.data.USERID;
          const postsResponse = await axios.get(`http://localhost:3000/api/get-posts-byUserid/${USERID}`);

          const promises = postsResponse.data.map(async (post) => {
            const paymentResponse = await axios.get(`http://localhost:3000/api/get-payment-byNewsid/${post.NEWSID}`);
            if (paymentResponse.data.length > 0) {
              const adminId = paymentResponse.data[0].ADMINID;

              try {
                const adminInfoResponse = await axios.get(`http://localhost:3000/api/get-adminInfo-byId/${adminId}`);
                const adminName = adminInfoResponse.data.NAME;
                paymentResponse.data[0].adminName = adminName;
              } catch (error) {
                console.error("Error fetching admin info:", error);
                paymentResponse.data.adminName = "Unknown";
              }
            } else {
              console.log(`No payment info found for post ${post.NEWSID}`);
              paymentResponse.data.adminName = "Unknown";
            }
            return paymentResponse.data;
          });

          const paymentResponses = await Promise.all(promises);
          const flatPayments = paymentResponses.flat();

          // Sắp xếp các thanh toán theo thời gian từ gần nhất đến xa nhất
          flatPayments.sort((a, b) => new Date(b.TIME) - new Date(a.TIME));

          setPayments(flatPayments);

          // Tính toán tổng số tiền và số lần thanh toán
          const totalAmount = flatPayments.reduce((sum, payment) => sum + payment.PRICE, 0);
          setPaymentSummary({ total: totalAmount, count: flatPayments.length });

          // Đặt URL của ảnh QR code
          setQrCodeUrl("http://localhost:3000/api/get-qrThanhToan");
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    return dateString ? format(parseISO(dateString), 'yyyy/MM/dd HH:mm:ss') : "null";
  };

  const formatMoney = (amount) => {
    return amount.toLocaleString("en-US", { style: "currency", currency: "USD" }).replace(/\$/, "").replace(/\.00$/, "");
  };

  return (
    <div className="table-container">
      <div className="payment-summary">
        <div className="qr-code">
          <img src={qrCodeUrl} alt="QR Code" />
        </div>
        <div className="info">
          <h1>Thông tin thanh toán</h1>
          <p>STK: 1047589631</p>
          <p>Chủ tài khoản: NGUYEN QUANG HIEU</p>
          <p>Ngân hàng: Vietcombank</p>
          <p>Nội dung: Mã thanh toán</p>
          <p style={{color:"red"}}>Lưu ý: Nội dung là mã thanh toán (không phải mã bài đăng) chính xác với thông tin thanh toán dưới đây.</p>
          <p style={{color:"red"}}>Chúng tôi không chịu trách nhiệm với giao dịch không hợp lệ!</p>
        </div>
      </div>
      <table className="payment-table">
        <thead>
          <tr>
            <th>Mã thanh toán</th>
            <th>Mã bài đăng</th>
            <th>Số tiền</th>
            <th>Thời gian</th>
            <th>Trạng thái</th>
            <th>Người duyệt</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.PAYID}>
              <td>{payment.PAYID}</td>
              <td>
                <Link className="detail-link update-button" to={`/detail/${payment.NEWSID}`}>
                  {payment.NEWSID}
                </Link>
              </td>
              <td>{formatMoney(payment.PRICE)}</td>
              <td>{formatDate(payment.TIME)}</td>
              <td>{payment.STATE}</td>
              <td>{payment.adminName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PostTable;
