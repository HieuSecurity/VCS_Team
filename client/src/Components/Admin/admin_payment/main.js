import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, parseISO } from "date-fns";
import "./payment.css"; // Import CSS file for styling

const PostTable = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/payment");
        setPayments(response.data);
      } catch (error) {
        console.error("Error fetching payments:", error);
      }
    };

    fetchPayments();
  }, []);

  const formatDate = (dateString) => {
    return format(parseISO(dateString), "yyyy/MM/dd HH:mm:ss");
  };

  const formatMoney = (amount) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }).replace(/\$/, '').replace(/\.00$/, '');
  };

  return (
    <div className="table-container">
      <h1>Thông tin thanh toán tại Phongtro123</h1>
      <table className="payment-table">
        <thead>
          <tr>
            <th>Mã thanh toán</th>
            <th>Mã bài đăng</th>
            <th>Khách hàng</th>
            <th>Số tiền</th>
            <th>Thời gian thanh toán</th>
            <th>Admin</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.paymentId}>
              <td>{payment.PAYID}</td>
              <td>{payment.NEWSID}</td>
              <td>{payment.USERNAME}</td>
              <td>{formatMoney(payment.PRICE)}</td>
              <td>{formatDate(payment.TIME)}</td>
              <td>{payment.ADMINNAME}</td>
              <td>{payment.STATE}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PostTable;
