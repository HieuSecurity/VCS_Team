import React, { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import axios from "axios";
import "./StatisticsTable.css"; // Import CSS file
import Slogan from "../../Slogan/slogan";
import Back from "../../Back/back";

const StatisticsTable = () => {
  const [statistics, setStatistics] = useState(null); // State for statistics

  useEffect(() => {
    fetchStatistics();
  }, []);

  // const formatDate = (dateString) => {
  //   return dateString ? format(parseISO(dateString), 'yyyy/MM/dd') : "N/A";
  // };

  const formatMoney = (amount) => {
    return amount
      .toLocaleString("en-US", { style: "currency", currency: "USD" })
      .replace(/\$/, "")
      .replace(/\.00$/, "");
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/payment-statistics");
      const sortedStatistics = response.data.statistics.sort((a, b) => {
        // Sort in descending order based on year and month
        return b.year - a.year || b.month - a.month;
      });
      setStatistics(sortedStatistics);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  return (
    <div className="statistics-container">
      <Back style={{ marginTop: "50px" }} className="back" />
      <Slogan className="slogan" style={{ marginTop: "-50px" }} />
      <h2>Thống kê doanh thu</h2>
      {statistics && (
        <table className="statistics-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Tổng bài đăng</th>
              <th>Tổng doanh thu</th>
            </tr>
          </thead>
          <tbody>
          {statistics.map(stat => (
              <tr key={`${stat.year}-${stat.month}`}>
                <td>{`${stat.year}/${stat.month}`}</td>
                <td>{stat.totalPosts}</td>
                <td>{formatMoney(stat.totalProfit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StatisticsTable;
