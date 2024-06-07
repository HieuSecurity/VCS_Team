import React, { useState, useEffect } from "react";
import "../body.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
function Search({ onSearch }) {
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [districts, setDistricts] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState("");
  const [price, setPrice] = useState([]);
  const [selectedDientich, setSelectedDientich] = useState("");
  const [dientich, setDientich] = useState([]);

  useEffect(() => {
    // Fetch data from the API
    const fetchDistricts = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/hcmdistrict");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Sort districts by 'IDDISTRICT' before setting state
        const sortedDistricts = data.sort(
          (a, b) => a.IDDISTRICT - b.IDDISTRICT
        );
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
  const handlePriceChange = (event) => {
    console.log("Selected district:", event.target.value); // Log giá trị quận được chọn
    setSelectedPrice(event.target.value);
  };
  const handleDienTichChange = (event) => {
    console.log("Selected district:", event.target.value); // Log giá trị quận được chọn
    setSelectedDientich(event.target.value);
  };

  const handleSearchButtonClick = () => {
    if (selectedDistrict && selectedPrice && setSelectedDientich) {
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
        <option disabled value="" style={{ color: "red", fontSize: "25px" }}>
          Quận
        </option>
        {districts.map((district) => (
          <option key={district.IDDISTRICT} value={district.DISTRICT}>
            {district.DISTRICT}
          </option>
        ))}
      </select>
      <select
        className="select-district"
        value={selectedPrice}
        onChange={handlePriceChange}
      >
        <option disabled value="" style={{ color: "red", fontSize: "25px" }}>
          Giá
        </option>

        <option value={"Dưới 1 triệu"}>Dưới 1 triệu</option>
        <option value={"Từ 1 - 2 triệu"}>Từ 1 - 2 triệu</option>
        <option value={"Từ 2 - 3 triệu"}>Từ 2 - 3 triệu</option>
        <option value={"Từ 3 - 5 triệu"}>Từ 3 - 5 triệu</option>
        <option value={"Từ 5 - 7 triệu"}>Từ 5 - 7 triệu</option>
        <option value={"Từ 7 - 10 triệu"}>Từ 7 - 10 triệu</option>
        <option value={"Từ 10 - 15 triệu"}>Từ 10 đến 15 triệu</option>
        <option value={"Trên 15 triệu"}>Trên 15 triệu</option>
      </select>
      <select
        className="select-district"
        value={selectedDientich}
        onChange={handleDienTichChange}
      >
        <option disabled value="" style={{ color: "red", fontSize: "25px" }}>
          Diện Tích m2
        </option>

        <option value={"Dưới 20 "}>Dưới 20 </option>
        <option value={"Từ 20 - 30 "}>Từ 20 - 30 </option>
        <option value={"Từ 30 - 50 "}>Từ 30 - 50 </option>
        <option value={"Từ 50 - 70 "}>Từ 50 - 70 </option>
        <option value={"Từ 70 - 90 "}>Từ 70 - 90 </option>
        <option value={"Trên 90 "}>Trên 90 </option>
      </select>
      <button
        style={{ alignItems: "center", textAlign: "center" }}
        className="search-button"
        onClick={handleSearchButtonClick}
      >
        <FontAwesomeIcon
          style={{ marginRight: "5px" }}
          icon={faSearch}
        ></FontAwesomeIcon>
        Tìm kiếm
      </button>
    </div>
  );
}

export default Search;
