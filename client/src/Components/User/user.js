import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Back from "../Back/back";
import Slogan from "../Slogan/slogan";
import MainInfo from "../User/user_info/main";
import MainPost from "../User/user_post/main";
import MainPayment from "../User/user_payment/main";
import MainNotification from "../User/user_notification/main";
import { format, parseISO } from "date-fns";

const User = () => {
  const [activeButton, setActiveButton] = useState(null);
  const [loadedFromLocalStorage, setLoadedFromLocalStorage] = useState(false);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
  const [unseenNotificationsCount, setUnseenNotificationsCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (!loadedFromLocalStorage) {
      const savedActiveButton = localStorage.getItem("activeButton");
      if (savedActiveButton) {
        setActiveButton(savedActiveButton);
      } else {
        setActiveButton("info");
        localStorage.setItem("activeButton", "info");
      }
      setLoadedFromLocalStorage(true);
    }

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
  }, [loadedFromLocalStorage]);

  useEffect(() => {
    const path = location.pathname.split("/")[2];
    if (path) {
      setActiveButton(path);
    }
  }, [location.pathname]);

  const updatePathWithoutReloading = (newPath) => {
    window.history.pushState({}, "", newPath);
  };

  const handleButtonClick = (newPath) => {
    setActiveButton(newPath);
    localStorage.setItem("activeButton", newPath);
    updatePathWithoutReloading(`/user/${newPath}`);
  };


  const fetchNotifications = (userId) => {
    axios
      .get(`http://localhost:3000/api/get-notification-byUserID/${userId}`)
      .then((response) => {
        const notifications = response.data;
        const sortedNotifications = notifications.sort((a, b) => parseISO(b.TIME) - parseISO(a.TIME)).slice(0, 15);
        const unseenCount = sortedNotifications.filter(notification => notification.SEEN === 0).length;
        console.log(unseenCount > 14)
        if (unseenCount === 0) {
          setUnseenNotificationsCount("");
        } else if (unseenCount > 14) {
          setUnseenNotificationsCount("15+");
        } else {
          setUnseenNotificationsCount(unseenCount);
        }
      })
      .catch((error) => {
        console.error("Error fetching notifications:", error);
      });
  };

  return (
    <div>
      <Back />
      <Slogan />
      <div className="button-row">
        <button
          className={`admin-button ${activeButton === "info" ? "active" : ""}`}
          onClick={() => handleButtonClick("info")}
        >
          Thông tin cá nhân
        </button>
        <button
          className={`post-button ${activeButton === "post" ? "active" : ""}`}
          onClick={() => handleButtonClick("post")}
        >
          Bài đăng
        </button>
        <button
          className={`payment-button ${activeButton === "payment" ? "active" : ""}`}
          onClick={() => handleButtonClick("payment")}
        >
          Thanh toán
        </button>
        <button
          className={`payment-button ${activeButton === "notification" ? "active" : ""}`}
          onClick={() => handleButtonClick("notification")}
        >
          Thông báo
          {<span style={{color:"red"}}>{unseenNotificationsCount}</span>}
        </button>
      </div>
      <div className="tab-content">
        {activeButton === "info" && (
          <div className="info-tab-content">
            <MainInfo />
          </div>
        )}

        {activeButton === "post" && (
          <div className="post-tab-content">
            <MainPost />
          </div>
        )}
        {activeButton === "payment" && (
          <div className="payment-tab-content">
            <MainPayment />
          </div>
        )}
        {activeButton === "notification" && (
          <div className="notification-tab-content">
            <MainNotification />
          </div>
        )}
      </div>
    </div>
  );
};

export default User;
