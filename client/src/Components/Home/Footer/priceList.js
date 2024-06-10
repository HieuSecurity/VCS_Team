import React from 'react';
import './linkFooter.css'; // Import CSS file
import Slogan from "../../Slogan/slogan";
import Back from "../../Back/back";

function PriceList() {
    return (
        <div className="price-list">
            <Back style={{ marginTop: "50px" }} className="back" />
            <Slogan className="slogan" style={{ marginTop: "-50px" }} />
            <h2 className="price-list__heading">Bảng giá đăng tin</h2>
            <table className="price-list__table">
                <thead>
                    <tr>
                        <th>Loại tin</th>
                        <th>Thời gian đăng</th>
                        <th>Giá</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Tin thường</td>
                        <td>15 ngày</td>
                        <td>330.000 VNĐ (22.000 VNĐ/ngày)</td>
                    </tr>
                    <tr>
                        <td>Tin thường</td>
                        <td>30 ngày</td>
                        <td>600.000 VNĐ (20.000 VNĐ/ngày)</td>
                    </tr>
                    <tr>
                        <td>Tin thường</td>
                        <td>60 ngày</td>
                        <td>1.140.000 VNĐ (19.000 VNĐ/ngày)</td>
                    </tr>
                    <tr>
                        <td>Tin thường</td>
                        <td>90 ngày</td>
                        <td>1.620.000 VNĐ (18.000 VNĐ/ngày)</td>
                    </tr>
                    <tr>
                        <td>Tin thường</td>
                        <td>180 ngày</td>
                        <td>3.060.000 VNĐ (17.000 VNĐ/ngày)</td>
                    </tr>
                    <tr>
                        <td>Tin thường</td>
                        <td>365 ngày</td>
                        <td>5.475.000 VNĐ (15.000 VNĐ/ngày)</td>
                    </tr>
                </tbody>
            </table>
            <p className="price-list__note">* Giá trên đã bao gồm VAT</p>
        </div>
    );
}

export default PriceList;
