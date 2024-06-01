import React, { useState, useEffect } from "react";
import axios from "axios";
import "./info.css";
import { Link } from "react-router-dom";

function Main() {
  const [notifications, setNotifications] = useState([]);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.EMAIL) {
      axios
        .get(`http://localhost:3000/api/get-userid-byEmail/${user.EMAIL}`)
        .then((response) => {
          const userId = response.data.USERID;
          fetchNotifications(userId);
        })
        .catch((error) => {
          console.error("Error fetching user ID:", error);
        });
    }
  }, []);

  const fetchNotifications = (userId) => {
    axios
      .get(`http://localhost:3000/api/get-notification-byUserID/${userId}`)
      .then((response) => {
        setNotifications(response.data);
      })
      .catch((error) => {
        console.error("Error fetching notifications:", error);
      });
  };

  const getLink = (category, newsId) => {
    switch (category) {
      case "Thanh toán":
        return "/user/payment";
      case "Bài viết":
        return `/user/post`;
      default:
        return "/user";
    }
  };

  return (
    <div className="Main">
      {notifications.map((notification) => {
        const url = getLink(notification.CATEGORY, notification.NEWSID);

        return (
          <div key={notification.NOTIFICATIONID} className="post">
            <Link
              to={url}
              style={{ fontSize: "20px", fontWeight: "800" }}
              className="update-button"
            >
              {notification.CATEGORY}
            </Link>
            <p>Nội dung: {notification.CONTENT}</p>
            {notification.REASON && (
              <p style={{ color: "red" }}>Lý do: {notification.REASON}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Main;
