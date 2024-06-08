import React from "react";
import "./footer.css"; // Import CSS file
import { Link } from "react-router-dom";


function Footer() {
  return (
    <footer className="footer">
      <div className="grid">
        <div className="grid__row">
          <div className="grid__column-3">
            <h3 className="footer__heading">Tin tức</h3>
            <ul className="footer__list">
              <li className="footer__item">
              <Link to="/introduce" className="footer__item__link">
                  Giới thiệu
                </Link>
              </li>
              <li className="footer__item">
                <a href="/" className="footer__item__link">
                  Bài viết
                </a>
              </li>
              <li className="footer__item">
              <Link to="/recruitment" className="footer__item__link">
                  Tuyển dụng
                </Link>
              </li>
            </ul>
          </div>
          <div className="grid__column-3">
            <h3 className="footer__heading">Chăm sóc khách hàng</h3>
            <ul className="footer__list">
              <li className="footer__item">
                <a
                  href="https://phongtro123.com/chinh-sach-bao-mat"
                  className="footer__item__link"
                >
                  Chính sách bảo mật
                </a>
              </li>
              <li className="footer__item">
                <a href="https://phongtro123.com/quy-dinh-su-dung" className="footer__item__link">
                  Điều khoản sử dụng
                </a>
              </li>
              <li className="footer__item">
                <a
                  href="https://phongtro123.com/quy-dinh-dang-tin"
                  className="footer__item__link"
                >
                  Quy định đăng tin
                </a>
              </li>
              <li className="footer__item">
              <Link to="/priceList" className="footer__item__link">
                  Bảng giá đăng tin
                </Link>
              </li>
            </ul>
          </div>
          <div className="grid__column-3">
            <h3 className="footer__heading">Liên hệ</h3>
            <ul className="footer__list">
            <li className="footer__item">
                <a
                  href="https://mail.google.com/mail/u/0/#inbox?compose=new"
                  className="footer__item__link"
                >
                  <ion-icon
                    className="footer__item__icon"
                    name="logo-email"
                  ></ion-icon>
                  nguyenhieuxt23@gmail.com
                </a>
              </li>
              <li className="footer__item">
                <a
                  href="https://www.facebook.com/nguyenhieuxt23"
                  className="footer__item__link"
                >
                  <ion-icon
                    className="footer__item__icon"
                    name="logo-facebook"
                  ></ion-icon>
                  Facebook
                </a>
              </li>
              <li className="footer__item">
                <a
                  href="https://www.instagram.com/hieu1tuoi_/"
                  className="footer__item__link"
                >
                  <ion-icon
                    className="footer__item__icon"
                    name="logo-instagram"
                  ></ion-icon>
                  Instagram
                </a>
              </li>
              <li className="footer__item">
                <a
                  href="https://www.tiktok.com/@hieu1tuoi_"
                  className="footer__item__link"
                >
                  <ion-icon
                    className="footer__item__icon"
                    name="logo-tiktok"
                  ></ion-icon>
                  Tiktok
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="grid">
          <p>
            Copyright © 2024 Nhóm 6, D21CQAT01-N, Học viện Công nghệ Bưu chính
            Viễn thông – Cơ sở tại TP. Hồ Chí Minh
          </p>
          <p>Đề tài: Thiết kế phần mềm đăng bài thuê phòng trọ</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
