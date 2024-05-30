import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, parseISO } from "date-fns";
import "./payment.css"; // Import CSS file for styling

const PostTable = () => {
  const [payments, setPayments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newPayment, setNewPayment] = useState({
    NEWSID: "",
    PRICE: "",
    TIME: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPayment((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const storedUserInfo = JSON.parse(localStorage.getItem("user"));
    const adminId = storedUserInfo ? storedUserInfo.ADMINID : null;

    const paymentData = {
      ...newPayment,
      ADMINID: adminId,
    };

    try {
      await axios.post("http://localhost:3000/api/create-payment", paymentData);
      setShowForm(false);
      setNewPayment({
        NEWSID: "",
        PRICE: "",
        TIME: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      });
      const response = await axios.get("http://localhost:3000/api/payment");
      setPayments(response.data);
    } catch (error) {
      console.error("Error creating payment:", error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setNewPayment({
      NEWSID: "",
      PRICE: "",
      TIME: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    });
  };

  return (
    <div className="table-container">
      <h1>Thông tin thanh toán tại Phongtro123</h1>
      <button className="create-payment-button" onClick={() => setShowForm(true)}>
        Tạo thanh toán
      </button>
      {showForm && (
        <div className="form-container">
          <h2>Tạo thanh toán mới</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="NEWSID">Mã bài đăng:</label>
              <input
                type="text"
                id="NEWSID"
                name="NEWSID"
                value={newPayment.NEWSID}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="PRICE">Số tiền:</label>
              <input
                type="number"
                id="PRICE"
                name="PRICE"
                value={newPayment.PRICE}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="TIME">Thời gian thanh toán:</label>
              <input
                type="datetime-local"
                id="TIME"
                name="TIME"
                value={newPayment.TIME}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-buttons">
              <button type="submit">Tạo mới</button>
              <button type="button" onClick={handleCancel}>Hủy</button>
            </div>
          </form>
        </div>
      )}
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
            <tr key={payment.PAYID}>
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
