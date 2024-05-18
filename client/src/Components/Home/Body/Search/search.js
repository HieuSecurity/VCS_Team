import React, { useState, useEffect } from "react";
import "../body.css";

function Search({ onSearch }) {
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    // Fetch data from the API
    const fetchDistricts = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/hcmdistrict");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched districts:", data); // Log dữ liệu trả về từ API

        // Sort districts by 'IDDISTRICT' before setting state
        const sortedDistricts = data.sort((a, b) => a.IDDISTRICT - b.IDDISTRICT);
        setDistricts(sortedDistricts);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    };

    fetchDistricts();
  }, []);

  const handleDistrictChange = (event) => {
    console.log("Selected district:", event.target.value); // Log giá trị quận được chọn
    setSelectedDistrict(event.target.value);
  };

  const handleSearchButtonClick = () => {
    if (selectedDistrict) {
      onSearch(selectedDistrict);
    } else {
      alert("Vui lòng chọn để tìm kiếm!");
    }
  };

  return (
    <div className="search-container">
      <select
        className="select-district"
        value={selectedDistrict}
        onChange={handleDistrictChange}
      >
        <option value="all" style={{ color: "black", fontSize: "25px" }}>
          -- Tìm theo Quận --
        </option>
        {districts.map((district) => (
          <option key={district.IDDISTRICT} value={district.DISTRICT}>
            {district.DISTRICT}
          </option>
        ))}
      </select>
      <button className="search-button" onClick={handleSearchButtonClick}>
        Tìm kiếm
      </button>
    </div>
  );
}

export default Search;
