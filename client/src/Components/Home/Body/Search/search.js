import React, { useState } from "react";
import "../body.css";

function Search({ onSearch }) {
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const handleDistrictChange = (event) => {
    setSelectedDistrict(event.target.value);
  };

  const handleSearchButtonClick = () => {
    if (selectedDistrict) {
      onSearch(selectedDistrict);
    } else {
      alert("Vui lòng chọn để tìm kiếm !");
    }
  };

  return (
    <div className="search-container">
      <select
        className="select-district"
        value={selectedDistrict}
        onChange={handleDistrictChange}
      >
        <option value="" style={{ color: "red", fontSize: "25px" }}>
          -- Tìm theo Quận --
        </option>
        <option value="Quận 1">Quận 1</option>
        <option value="Quận 2">Quận 2</option>
        <option value="Quận 3">Quận 3</option>
        <option value="Quận 4">Quận 4</option>
        <option value="Quận 5">Quận 5</option>
        <option value="Quận 6">Quận 6</option>
        <option value="Quận 7">Quận 7</option>
        <option value="Quận 8">Quận 8</option>
        <option value="Quận 9">Quận 9</option>
        <option value="Quận 10">Quận 10</option>
        <option value="Quận 11">Quận 11</option>
        <option value="Quận 12">Quận 12</option>
        <option value="Gò Vấp">Gò Vấp</option>
        <option value="Phú Nhuận">Phú Nhuận</option>
        <option value="Tân Bình">Tân Bình</option>
        <option value="Tân Phú">Tân Phú</option>
        <option value="Bình Tân">Bình Tân</option>
        <option value="Bình Thạnh">Bình Thạnh</option>
        {/* Add more options as needed */}
      </select>
      <button className="search-button" onClick={handleSearchButtonClick}>
        Tìm kiếm
      </button>
    </div>
  );
}

export default Search;
