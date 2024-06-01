import React, { useState, useEffect } from "react";
import axios from "axios";
import "./payment.css"; // Import CSS file for styling
import { format, parseISO } from "date-fns";
import { Link, useParams } from "react-router-dom";

const PostTable = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy đối tượng user từ localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.EMAIL) {
          // Lấy USERID từ EMAIL
          const userIdResponse = await axios.get(`http://localhost:3000/api/get-userid-byEmail/${user.EMAIL}`);
          const USERID = userIdResponse.data.USERID;

          // Lấy các bài viết của người dùng từ USERID
          const postsResponse = await axios.get(`http://localhost:3000/api/get-posts-byUserid/${USERID}`);

          // Duyệt qua từng bài viết để lấy thông tin thanh toán
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

          // Chờ tất cả các yêu cầu hoàn thành
          const paymentResponses = await Promise.all(promises);

          // Lấy danh sách thanh toán từ các phản hồi
          setPayments(paymentResponses.flat()); // Định dạng mảng các mảng
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
      <h1>THÔNG TIN THANH TOÁN</h1>
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
