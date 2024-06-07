import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";

function Main() {
  const [reportList, setReportList] = useState([]);
  const [sortedReportList, setSortedReportList] = useState([]);

  useEffect(() => {
    fetchReportList();
  }, []);

  useEffect(() => {
    sortReportList();
  }, [reportList]);

  const fetchReportList = () => {
    axios
      .get("http://localhost:3000/api/get-reportList")
      .then((response) => {
        setReportList(response.data);
      })
      .catch((error) => {
        console.error("Error fetching report list:", error);
      });
  };

  const sortReportList = () => {
    const sortedList = [...reportList].sort((a, b) => {
      return new Date(b.TIME) - new Date(a.TIME);
    });
    setSortedReportList(sortedList);
  };

  const formatDateTime = (dateTimeString) => {
    return dateTimeString
      ? format(parseISO(dateTimeString), "yyyy/MM/dd HH:mm:ss")
      : "null";
  };

  const handleReportClick = (reportId) => {
    axios
      .put(`http://localhost:3000/api/update-reportSeen/${reportId}`)
      .then((response) => {
        // Update the SEEN status locally
        const updatedReportList = sortedReportList.map((report) => {
          if (report.REPORTID === reportId) {
            return { ...report, SEEN: 1 };
          } else {
            return report;
          }
        });
        setSortedReportList(updatedReportList);
      })
      .catch((error) => {
        console.error("Error updating report seen status:", error);
      });
  };

  return (
    <div className="Main">
      <h1>Báo cáo</h1>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Mã ID</th>
              <th>Mã bài viết</th>
              <th>Người báo cáo</th>
              <th>Chủ bài đăng</th>
              <th>Thời gian</th>
              <th className="function-cell">Nội dung</th>
            </tr>
          </thead>
          <tbody>
            {sortedReportList.map((report) => (
              <tr
                key={report.REPORTID}
                style={{
                  backgroundColor: report.SEEN === 0 ? "#16c784" : "white",
                }}
              >
                <td>{report.REPORTID}</td>
                <td>
                  <Link
                    style={{ fontSize: "20px" }}
                    className="detail-link update-button"
                    to={`/detail/${report.NEWSID}`}
                    onClick={() => handleReportClick(report.REPORTID)}
                  >
                    {report.NEWSID}
                  </Link>
                </td>
                <td>{report.REPORTER}</td>
                <td>{report.POSTOWNER}</td>
                <td>{formatDateTime(report.TIME)}</td>
                <td>{report.CONTENT}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Main;
