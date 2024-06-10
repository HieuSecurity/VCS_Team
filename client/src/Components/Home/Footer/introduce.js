import React from 'react';
import "./linkFooter.css";
import Slogan from "../../Slogan/slogan";
import Back from "../../Back/back";

function GioiThieu() {
    return (
        <div className="body-gioithieu">
        <Back style={{ marginTop: "50px" }} className="back" />
        <Slogan className="slogan" style={{ marginTop: "-50px" }} />
            <div className="gioithieu-info">
                <h1 className="tieude">GIỚI THIỆU</h1><br />
                <div className="gioithieu-noidung">
                <p>
                    Phongtro123.com tự hào là trang web đứng top 1 google về từ khóa: cho thuê phòng trọ, thuê phòng trọ, phòng trọ hồ chí minh
                    với lưu lượng truy cập (traffic) cao nhất trong
                    lĩnh vực.
                    </p>
                    <p>
                    Phongtro123.com tự hào có lượng dữ liệu bài đăng lớn nhất trong lĩnh vực cho thuê phòng trọ với hơn 70.000 tin trên hệ thống
                    và tiếp tục tăng.
                    </p>
                    <p>
                    Phongtro123.com tự hào có số lượng người dùng lớn nhất trong lĩnh vực cho thuê phòng
                    trọ với hơn 300.000 khách truy cập và hơn 2.000.000 lượt pageview mỗi tháng.
                    </p>
                    <p>Với mong muốn xây dựng một trang web thật PRO chuyên cung cấp thông tin nhà trọ phòng trọ cho mọi người, khi mà 
                        ngày nay nhu cầu nhà trọ phòng trọ ngày càng tăng ở các thành phố lớn nhất là sTP. Hồ Chí Minh.</p>
                    <p>Đối với cách tiếp cận thông tin truyền thống đã không được truyền đến mọi người một cách kịp thời đúng lúc.</p>
                    <p>Chính vì nắm bắt được tình hình thực tế đó mà chúng tôi đã thành lập website Phongtro123.com với mong muốn trở 
                        thành một kênh truyền thông phổ biến nhà trọ, phòng trọ hữu ích cho mọi người.</p>
                    <p>Nếu trước đây việc cho thuê nhà, cho thuê phòng trọ đều dán giấy đăng quảng cáo ở các nơi công cộng rất là mất 
                        vẽ mỹ quang đô thị. Thì ngày nay các bạn có thể đăng tin trên đây rất tiện lợi, với phương tiện truyền thông được 
                        phổ biến rộng rãi tin đăng của bạn sẽ được hàng ngàn người biết đến.</p>
                    <p>Website ra đời sẽ góp phần giải quyết được các vấn đề thuê trọ hiện nay, và giúp mọi người tìm kiếm nhà trọ, 
                        chỗ ở phù hợp và dễ dàng. Hy vọng Phongtro123.com sẽ là địa chỉ quen thuộc cho mọi người.</p>
                    <p>Website với giao diện thân thiện dễ sử dụng và hướng đến người dùng, các chuyên mục được phân 
                        chia rất rõ ràng và tim kiếm tin đăng rất chi tiết.</p>
                    <p>Các dịch vụ chính:</p>
                    <p>- Đăng thông tin quảng cáo cho thuê phòng trọ</p>
                    <p>Chúng tôi luôn cố gắng đem lại những thông tin nhanh chóng và chính xác cho mọi người. 
                        Rất mong nhận được sự ủng hộ giúp đỡ của mọi người cùng nhau xây dựng một kênh thông tin truyền thông về nhà trọ.</p>
                
                </div>
            </div>
        </div>
    );
}

export default GioiThieu;
