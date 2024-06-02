import React, { useState } from "react";
import axios from "axios";
import "./style.css"; // Import CSS for styling
import Slogan from "../../../Slogan/slogan"
import Back from "../../../Back/back"

const Main = () => {
  const [report, setReport] = useState({
    title: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name,value)
    setReport({ ...report, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Đã gửi báo cáo")    
  };

  return (
    <div className="Main">
      <Back style={{marginTop:"50px"}} className="back" />
      <Slogan className="slogan" style={{ marginTop: "-50px" }} />

    <form className="report-form" onSubmit={handleSubmit}>
      <h2>Báo cáo</h2>
    
      <div className="form-group">
        <label htmlFor="title">Tiêu đề:</label>
        <input
          type="text"
          id="title"
          name="title"
          value={report.title}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="description">Mô tả:</label>
        <textarea
          id="description"
          name="description"
          value={report.description}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Gửi phiếu báo cáo</button>
    </form>
    </div>
   
  );
};

export default Main;
