import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./admin.css";
import Back from "../Back/back";
import Slogan from "../Slogan/slogan";
import MainInfo from "../Admin/admin_info/main";
import MainUser from "../Admin/admin_user/main";
import MainPost from "../Admin/admin_post/main";
import MainReport from "../Admin/admin_report/main";

import MainPayment from "../Admin/admin_payment/main";

const ButtonRow = () => {
  const [activeButton, setActiveButton] = useState(null);
  const [loadedFromLocalStorage, setLoadedFromLocalStorage] = useState(false);
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
    updatePathWithoutReloading(`/admin/${newPath}`);
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
          Quản trị viên
        </button>
        <button
          className={`user-button ${activeButton === "user" ? "active" : ""}`}
          onClick={() => handleButtonClick("user")}
        >
          Người dùng
        </button>
        <button
          className={`post-button ${activeButton === "post" ? "active" : ""}`}
          onClick={() => handleButtonClick("post")}
        >
          Bài đăng
        </button>
        <button
          className={`report-button ${
            activeButton === "report" ? "active" : ""
          }`}
          onClick={() => handleButtonClick("report")}
        >
          Báo cáo
        </button>
        <button
          className={`payment-button ${
            activeButton === "payment" ? "active" : ""
          }`}
          onClick={() => handleButtonClick("payment")}
        >
          Thanh toán
        </button>
      </div>
      <div className="tab-content">
        {activeButton === "info" && (
          <div className="info-tab-content">
            <MainInfo />
          </div>
        )}
        {activeButton === "user" && (
          <div className="user-tab-content">
            <MainUser />
          </div>
        )}
        {activeButton === "post" && (
          <div className="post-tab-content">
            {" "}
            <MainPost />
          </div>
        )}
        {activeButton === "report" && (
          <div className="report-tab-content">
            {" "}
            <MainReport />
          </div>
        )}
        {activeButton === "payment" && (
          <div className="payment-tab-content">
            {" "}
            <MainPayment />
          </div>
        )}
      </div>
    </div>
  );
};

export default ButtonRow;
