const express = require("express");
const session = require("express-session");
const cors = require("cors");
const mysql = require("mysql");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const { start } = require("repl");
const app = express();
const PORT = process.env.PORT || 3000;
const { format, parseISO } = require("date-fns-tz"); // Import format và parseISO từ date-fns-tz
const moment = require('moment');
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
// Middleware để phục vụ các tệp tĩnh từ thư mục "images"
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use("/uploads", express.static("uploads"));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root", // Thay username bằng tên người dùng của bạn
  password: "", // Thay password bằng mật khẩu của bạn
  database: "webdangbai", // Thay database_name bằng tên cơ sở dữ liệu của bạn
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, "./uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: fileFilter,
});

// API to get an image
app.get("/image/:filename", (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.resolve(__dirname, "./uploads", filename);
  res.sendFile(imagePath);
});

// API để lấy ảnh QR code
app.get('/api/get-qrThanhToan', (req, res) => {
  const qrCodePath = path.join(__dirname, 'images', 'QRThanhToan.jpg');
  res.sendFile(qrCodePath);
});


app.post("/api/create-post", upload.array("images", 20), (req, res) => {
  const {
    userid,
    title,
    timestart,
    describe,
    price,
    acreage,
    address,
    district,
    postDuration,
   // Get userid from the request body
  } = req.body;
  const images = req.files; // Get the list of uploaded images from req.files
  const state = "Chờ duyệt";

  console.log("Received form data:", req.body);
  console.log("Received images:", req.files);

  connection.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    // Lấy IDDISTRICT từ database tương ứng với option người dùng chọn
    const getDistrictQuery =
      "SELECT IDDISTRICT FROM hcmdistrict WHERE DISTRICT = ?";
    connection.query(getDistrictQuery, [district], (error, districtResults) => {
      if (error) {
        console.error("Error querying district:", error);
        return connection.rollback(() => {
          res.status(500).json({ message: "Internal server error" });
        });
      }

      if (districtResults.length === 0) {
        return connection.rollback(() => {
          res.status(400).json({ message: "District not found" });
        });
      }

      const IDDISTRICT = districtResults[0].IDDISTRICT;

      // Insert post details into newslist table
      const insertNewslistQuery =
        "INSERT INTO newslist (USERID, title, acreage, price, address, state, postduration) VALUES (?, ?, ?, ?, ?, ?, ?)";
      connection.query(
        insertNewslistQuery,
        [userid, title, acreage, price, IDDISTRICT, state, postDuration],
        (error, newslistResults) => {
          if (error) {
            return connection.rollback(() => {
              console.error("Error executing INSERT into newslist", error);
              res.status(500).json({ message: "Internal server error" });
            });
          }

          const newslistId = newslistResults.insertId;

          // Insert post details into newsdetail table
          const insertNewsdetailQuery =
            "INSERT INTO newsdetail (newsid, specificaddress, `describe` ) VALUES (?, ?, ?)";
          connection.query(
            insertNewsdetailQuery,
            [newslistId, address, describe],
            (error, newsdetailResults) => {
              if (error) {
                return connection.rollback(() => {
                  console.error(
                    "Error executing INSERT into newsdetail",
                    error
                  );
                  res.status(500).json({ message: "Internal server error" });
                });
              }

              if (!images || images.length === 0) {
                // No images uploaded
                connection.commit((err) => {
                  if (err) {
                    return connection.rollback(() => {
                      console.error("Error committing transaction", err);
                      res
                        .status(500)
                        .json({ message: "Internal server error" });
                    });
                  }

                  res.status(200).json({
                    message: "Post created successfully",
                    postId: newslistId,
                  });
                });
              } else {
                // Images uploaded, insert them into the database
                const insertImageQuery =
                  "INSERT INTO image (newsid, image) VALUES (?, ?)";
                const promises = images.map((image) => {
                  const imageUrl = image.filename;
                  return new Promise((resolve, reject) => {
                    connection.query(
                      insertImageQuery,
                      [newslistId, imageUrl],
                      (error, imageResults) => {
                        if (error) {
                          reject(error);
                        } else {
                          resolve();
                        }
                      }
                    );
                  });
                });

                Promise.all(promises)
                  .then(() => {
                    connection.commit((err) => {
                      if (err) {
                        return connection.rollback(() => {
                          console.error("Error committing transaction", err);
                          res
                            .status(500)
                            .json({ message: "Internal server error" });
                        });
                      }

                      res.status(200).json({
                        message: "Post created successfully",
                        postId: newslistId,
                      });
                    });
                  })
                  .catch((error) => {
                    return connection.rollback(() => {
                      console.error("Error executing INSERT into image", error);
                      res
                        .status(500)
                        .json({ message: "Internal server error" });
                    });
                  });
              }
            }
          );
        }
      );
    });
  });
});


// API để cập nhật thông tin bài đăng
app.put("/api/update-post/:postId", upload.array("images", 20), (req, res) => {
  const postId = req.params.postId;
  const { title, timestart, describe, price, acreage, address, district } = req.body;
  const images = req.files; // Get the list of uploaded images from req.files
  console.log("Received form data:", req.body);
  console.log("Received images:", req.files);


  connection.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    // lấy IDDISTRICT từ database tương ứng với option người dùng chọn
    const getDistrictQuery =
      "SELECT IDDISTRICT FROM hcmdistrict WHERE DISTRICT = ?";
    connection.query(getDistrictQuery, [district], (error, districtResults) => {
      if (error) {
        console.error("Error querying district:", error);
        return connection.rollback(() => {
          res.status(500).json({ message: "Internal server error" });
        });
      }

      if (districtResults.length === 0) {
        return connection.rollback(() => {
          res.status(400).json({ message: "District not found" });
        });
      }

      const IDDISTRICT = districtResults[0].IDDISTRICT;


      // Update post details in newslist table
      const updateNewslistQuery =
        "UPDATE newslist SET title=?, acreage=?, price=?,address=? WHERE newsid=?";
      connection.query(
        updateNewslistQuery,
        [title, acreage, price, IDDISTRICT, postId],
        (error, newslistResults) => {
          if (error) {
            return connection.rollback(() => {
              console.error("Error executing UPDATE newslist", error);
              res.status(500).json({ message: "Internal server error" });
            });
          }

          // Update post details in newsdetail table
          const updateNewsdetailQuery =
            "UPDATE newsdetail SET specificaddress=?, `describe`=? WHERE newsid=?";
          connection.query(
            updateNewsdetailQuery,
            [address, describe, postId],
            (error, newsdetailResults) => {
              if (error) {
                return connection.rollback(() => {
                  console.error("Error executing UPDATE newsdetail", error);
                  res.status(500).json({ message: "Internal server error" });
                });
              }

              if (!images || images.length === 0) {
                // No images uploaded
                connection.commit((err) => {
                  if (err) {
                    return connection.rollback(() => {
                      console.error("Error committing transaction", err);
                      res
                        .status(500)
                        .json({ message: "Internal server error" });
                    });
                  }

                  res.status(200).json({
                    message: "Post updated successfully",
                    postId: postId,
                  });
                });
              } else {
                const deleteImageQuery = "DELETE FROM image WHERE NEWSID = ?";
                connection.query(deleteImageQuery, [postId], (error, results) => {
                  if (error) {
                    console.error("Error deleting image:", error);
                    return connection.rollback(() => {
                    res.status(500).json({ message: "Internal server error" });
                });
                }
                // Images uploaded, insert them into the database
                const insertImageQuery =
                  "INSERT INTO image (newsid, image) VALUES (?, ?)";
                const promises = images.map((image) => {
                  const imageUrl = image.filename;
                  return new Promise((resolve, reject) => {
                    connection.query(
                      insertImageQuery,
                      [postId, imageUrl],
                      (error, imageResults) => {
                        if (error) {
                          reject(error);
                        } else {
                          resolve();
                        }
                      }
                    );
                  });
                });

                Promise.all(promises)
                  .then(() => {
                    connection.commit((err) => {
                      if (err) {
                        return connection.rollback(() => {
                          console.error("Error committing transaction", err);
                          res
                            .status(500)
                            .json({ message: "Internal server error" });
                        });
                      }

                      res.status(200).json({
                        message: "Post updated successfully",
                        postId: postId,
                      });
                    });
                  })
                  .catch((error) => {
                    return connection.rollback(() => {
                      console.error("Error executing INSERT into image", error);
                      res
                        .status(500)
                        .json({ message: "Internal server error" });
                    });
                  });
      });
              }
            }
          );
        }
      );
      });
    });
});

//  cập nhật TIMESTART và TIMEEND theo thời điểm bài đăng đc hiển thị
app.post('/api/update-news-detail', (req, res) => {
  const { newsid } = req.body;

  // Query NEWSLIST để lấy POSTDURATION
  const queryNewsList = `SELECT POSTDURATION FROM NEWSLIST WHERE NEWSID = ?`;
  connection.query(queryNewsList, [newsid], (error, results) => {
    if (error) {
      console.error('Error querying NEWSLIST:', error);
      res.status(500).send('Internal Server Error');
      return;
    }

    if (results.length === 0) {
      res.status(404).send('NEWSID not found');
      return;
    }

    const postDuration = results[0].POSTDURATION;
    console.log("Thời hạn:", postDuration);

    // Tính toán TIMESTART và TIMEEND
    const timeStart = moment();
    console.log("Ngày hiện tại:", timeStart.format('YYYY-MM-DD HH:mm:ss'));

    const timeEnd = timeStart.clone().add(postDuration, 'days');
    console.log("Ngày hết hạn:", timeEnd.format('YYYY-MM-DD HH:mm:ss'));

    // Update NEWSDETAIL
    const queryUpdate = `UPDATE NEWSDETAIL SET TIMESTART = ?, TIMEEND = ? WHERE NEWSID = ?`;
    connection.query(queryUpdate, [timeStart.format('YYYY-MM-DD HH:mm:ss'), timeEnd.format('YYYY-MM-DD HH:mm:ss'), newsid], (err, result) => {
      if (err) {
        console.error('Error updating NEWSDETAIL:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
      console.log('NEWSDETAIL updated successfully');
      res.status(200).send('NEWSDETAIL updated successfully');
    });
  });
});

// cập nhật trạng thái bài đăng theo thời gian thực
app.get('/api/newState-Post/:newsId', async (req, res) => {
  const newsId = req.params.newsId;

  // Validate newsId
  if (isNaN(newsId)) {
    res.status(400).send('Invalid news ID');
    return;
  }

  try {
    // Lấy TIMEEND từ bảng NEWSDETAIL
    const query = 'SELECT TIMEEND FROM NEWSDETAIL WHERE NEWSID = ?';
    const results = await new Promise((resolve, reject) => {
      connection.query(query, [newsId], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });

    if (results.length === 0) {
      res.status(404).send('News not found');
      return;
    }

    const timeEnd = moment(results[0].TIMEEND);
    const currentTime = moment();

    // So sánh TIMEEND với thời gian hiện tại
    if (timeEnd < currentTime) {
      // Cập nhật STATE = "Hết hạn" 
      const updateQuery = 'UPDATE NEWSLIST SET STATE = ? WHERE NEWSID = ?';
      await new Promise((resolve, reject) => {
        connection.query(updateQuery, ['Hết hạn', newsId], (error, results) => {
          if (error) return reject(error);
          resolve(results);
        });
      });
      res.status(200).send('State updated successfully');
    } else {
      res.status(200).send('State remains unchanged');
    }
  } catch (error) {
    console.error('Error querying or updating database: ' + error.stack);
    res.status(500).send('Internal Server Error');
  }
});

app.get("/api/images/:newsid", (req, res) => {
  const newsid = req.params.newsid;
  const query = "SELECT IMAGE FROM image WHERE NEWSID = ?";

  connection.query(query, [newsid], (error, results) => {
    if (error) {
      return res.status(500).json({ message: "Error fetching images", error });
    }

    const imagePaths = results.map((row) => row.IMAGE);
    res.status(200).json({ images: imagePaths });
  });
});

app.post("/api/upload", upload.array("images", 10), async (req, res) => {
  const images = req.files;
  // Check if any file is uploaded
  if (!images || images.length === 0) {
    return res.status(400).json({ message: "No images uploaded" });
  }

  try {
    // Use a promise-based approach to handle database insertions
    const insertPromises = images.map((image) => {
      const insertQuery = "INSERT INTO image (NEWID, IMAGE) VALUES (?, ?)";
      return new Promise((resolve, reject) => {
        connection.query(
          insertQuery,
          [req.body.newsid, image.filename],
          (error, results) => {
            if (error) {
              console.error("Error inserting image:", error);
              reject(error);
            } else {
              resolve(results);
            }
          }
        );
      });
    });

    // Wait for all insertions to complete
    await Promise.all(insertPromises);

    const fileInfos = images.map((image) => ({
      filename: image.filename,
      path: image.path,
    }));

    // Send response after all insertions are successful
    res.status(200).json({
      message: "Images uploaded and inserted successfully.",
      files: fileInfos,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred during the upload and insert.",
      error,
    });
  }
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Missing email or password" });
  }

  const query = "SELECT * FROM account WHERE email = ? AND password = ?";
  connection.query(query, [email, password], (error, results) => {
    // Xử lý kết quả trạng thái hoạt động
    if (error) {
      console.error("Error executing query", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];
    if (user.STATE === "Khóa") {
      return res.status(403).json({ message: "Blocked account" });
    }

    res.status(200).json({ message: "Login successful", user });
  });
});

// API đổi mật khẩu
app.post("/api/update-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    /// Update mật khẩu mới trong cơ sở dữ liệu
    await connection.query("UPDATE account SET password = ? WHERE email = ?", [
      newPassword,
      email,
    ]);

    // Trả về phản hồi thành công
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API lấy thông tin bảng giá
app.get("/api/get-pricelist", (req, res) => {
  const sql = "SELECT * FROM pricelist";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching price list:", err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
    res.status(200).json(results);
  });
});

// API cập nhật trạng thái bài viết
app.post("/api/update-newsState", (req, res) => {
  const { newsid, state} = req.body;
  try {
    // Update trạng thái của tin tức
    const updateState = "UPDATE NEWSLIST SET STATE = ? WHERE NEWSID = ?";
    connection.query(updateState, [state, newsid], (error, results) => {
      if (error) {
        console.error("Lỗi khi cập nhật trạng thái tin tức:", error);
        return res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
      }
      console.log(`Cập nhật trạng thái tin tức ${newsid} thành công`);
      return res
        .status(200)
        .json({ message: "Cập nhật trạng thái tin tức thành công" });
    });

  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái tin tức:", error);
    return res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
  
});

app.post("/api/update-resetPost", (req, res) => {
  const { newsid, state, postduration} = req.body;
  try {
    // Update trạng thái của tin tức
    const updateState = "UPDATE NEWSLIST SET STATE = ?, POSTDURATION = ? WHERE NEWSID = ?";
    connection.query(updateState, [state, postduration, newsid], (error, results) => {
      if (error) {
        console.error("Lỗi khi cập nhật trạng thái tin tức:", error);
        return res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
      }
      console.log(`Cập nhật trạng thái tin tức ${newsid} thành công`);
      return res
        .status(200)
        .json({ message: "Cập nhật trạng thái tin tức thành công" });
    });

  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái tin tức:", error);
    return res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
  
});
//
app.get("/api/hcmdistrict", (req, res) => {
  const sql = "SELECT * FROM hcmdistrict";
  connection.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.json(result);
  });
});

// API lấy thông tin bài viết
app.get("/api/get-posts",  (req, res) => {
  // Thực hiện truy vấn SELECT để lấy tất cả bài đăng từ bảng NEWSLIST
  const selectNewslistQuery = "SELECT * FROM NEWSLIST";

  // Thực hiện truy vấn COUNT để tính tổng số bài đăng
  const countQuery = `SELECT COUNT(*) AS total FROM NEWSLIST`;

  // Thực hiện truy vấn để lấy số lượng kết quả
  connection.query(countQuery, (error, countResult) => {
    if (error) {
      console.error("Error counting:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    const total = countResult[0].total; // Lấy tổng số kết quả từ kết quả truy vấn COUNT

    // Thực hiện truy vấn SELECT để lấy danh sách bài đăng
    connection.query(selectNewslistQuery, async (error, newslistResults) => {
      if (error) {
        console.error("Error executing SELECT query", error);
        return res.status(500).json({ message: "Internal server error" });
      }

      try {
        // Duyệt qua từng bài đăng để thực hiện các truy vấn phụ
        const posts = await Promise.all(
          newslistResults.map(async (news) => {
            const newsid = news.NEWSID;
            const userId = news.USERID;
            const districtId = news.ADDRESS;

            // Truy vấn chi tiết bài đăng từ NEWSDETAIL
            const newsDetail = await new Promise((resolve, reject) => {
              connection.query(
                "SELECT * FROM NEWSDETAIL WHERE NEWSID = ?",
                [newsid],
                (error, results) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(results[0]);
                  }
                }
              );
            });

            // Truy vấn tên quận từ HCMDISTRICT
            const district = await new Promise((resolve, reject) => {
              connection.query(
                "SELECT DISTRICT FROM HCMDISTRICT WHERE IDDISTRICT = ?",
                [districtId],
                (error, results) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(results[0].DISTRICT);
                  }
                }
              );
            });

            // Truy vấn thông tin người dùng từ USERINFO
            const userInfo = await new Promise((resolve, reject) => {
              connection.query(
                "SELECT NAME, PHONE, AVATAR FROM USERINFO WHERE USERID = ?",
                [userId],
                (error, results) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(results[0]);
                  }
                }
              );
            });

            // Truy vấn hình ảnh từ bảng IMAGE
            const image = await new Promise((resolve, reject) => {
              connection.query(
                "SELECT IMAGE FROM IMAGE WHERE NEWSID = ? LIMIT 1",
                [newsid],
                (error, results) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(results[0] ? results[0].IMAGE : null);
                  }
                }
              );
            });

            // Kết hợp các thông tin lại thành một đối tượng
            return {
              ...news,
              ...newsDetail,
              district,
              ...userInfo,
              image, // Thêm đường dẫn hình ảnh
            };
          })
        );

        // Trả về dữ liệu và số lượng bài đăng
        res.status(200).json({ results: posts, total });
      } catch (error) {
        console.error("Error executing subqueries", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
  });
});

// API lấy bài viết bằng NEWSID
app.get('/api/get-post-byNewsId/:newsId', (req, res) => {
  const newsId = req.params.newsId;
  
  const sql = 'SELECT * FROM NEWSLIST WHERE NEWSID = ?';
  const values = [newsId];
  
  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error getting post by news ID:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    
    if (results.length === 0) {
      res.status(404).json({ message: 'Post not found' });
    } else {
      res.json(results[0]);
    }
  });
});

// lấy thông tin để hiển thị lên form chỉnh sửa bài đăng
app.get('/api/get-post-details/:newsId', (req, res) => {
  const newsId = req.params.newsId;
  
  const sqlList = 'SELECT TITLE, ACREAGE, PRICE, ADDRESS FROM NEWSLIST WHERE NEWSID = ?';
  const sqlDetail = 'SELECT SPECIFICADDRESS, `DESCRIBE` FROM NEWSDETAIL WHERE NEWSID = ?';
  const sqlImages = 'SELECT IMAGE FROM IMAGE WHERE NEWSID = ?';
  
  const values = [newsId];
  
  connection.query(sqlList, values, (err, listResults) => {
    if (err) {
      console.error('Error getting post details by news ID:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    
    if (listResults.length === 0) {
      res.status(404).json({ message: 'Post details not found' });
      return;
    }
    
    connection.query(sqlDetail, values, (err, detailResults) => {
      if (err) {
        console.error('Error getting post details by news ID:', err);
        res.status(500).json({ message: 'Internal server error' });
        return;
      }
      
      if (detailResults.length === 0) {
        res.status(404).json({ message: 'Post details not found' });
        return;
      }
      
      connection.query(sqlImages, values, (err, imageResults) => {
        if (err) {
          console.error('Error getting images by news ID:', err);
          res.status(500).json({ message: 'Internal server error' });
          return;
        }
        
        const postDetails = {
          title: listResults[0].TITLE,
          describe: detailResults[0].DESCRIBE,
          price: listResults[0].PRICE,
          acreage: listResults[0].ACREAGE,
          district: listResults[0].ADDRESS,
          address: detailResults[0].SPECIFICADDRESS,          
          images: imageResults.map(image => image.IMAGE)
        };
        console.log("List:", postDetails);
        res.json(postDetails);
      });
    });
  });
});


// API Lấy các bài viết của người dùng từ USERID
app.get("/api/get-posts-byUserid/:userid", (req, res) => {
  const { userid } = req.params;

  // Câu truy vấn đầu tiên để lấy danh sách bài viết
  const sql1 = `SELECT * FROM NEWSLIST WHERE USERID = ?`;

  connection.query(sql1, [userid], (err, newsListResult) => {
    if (err) {
      console.error("Error fetching user posts:", err);
      res.status(500).json({ error: "Error fetching user posts" });
      return;
    }

    // Nếu không có bài viết nào, trả về kết quả rỗng
    if (newsListResult.length === 0) {
      res.status(200).json([]);
      return;
    }

    // Lấy danh sách NEWSID từ kết quả đầu tiên
    const newsIds = newsListResult.map(post => post.NEWSID);

    // Câu truy vấn thứ hai để lấy giá trị TIMEEND từ bảng NEWSDETAIL
    const sql2 = `SELECT NEWSID, TIMEEND FROM NEWSDETAIL WHERE NEWSID IN (?)`;

    connection.query(sql2, [newsIds], (err, newsDetailResult) => {
      if (err) {
        console.error("Error fetching news details:", err);
        res.status(500).json({ error: "Error fetching news details" });
        return;
      }

      // Tạo một map từ NEWSID đến TIMEEND
      const timeendMap = {};
      newsDetailResult.forEach(detail => {
        timeendMap[detail.NEWSID] = detail.TIMEEND;
      });

      // Kết hợp kết quả từ hai câu truy vấn
      const finalResult = newsListResult.map(post => ({
        ...post,
        TIMEEND: timeendMap[post.NEWSID] || null // Nếu không tìm thấy TIMEEND, gán null
      }));

      res.status(200).json(finalResult);
    });
  });
});


// API Lấy các bài viết của người dùng từ email
app.get("/api/get-posts-byEmail/:email", (req, res) => {
  const email = req.params.email;

  // Câu query để lấy USERID từ bảng USERINFO dựa trên email
  const queryUserId = "SELECT USERID FROM USERINFO WHERE EMAIL = ?";

  // Thực hiện câu query để lấy USERID
  connection.query(queryUserId, [email], (error, results) => {
    if (error) {
      console.error("Error fetching USERID:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    if (results.length === 0) {
      res.status(404).send("User not found");
      return;
    }

    const userId = results[0].USERID;

    // Câu query để lấy các bài viết từ bảng NEWSLIST dựa trên USERID
    const queryPosts = "SELECT * FROM NEWSLIST WHERE USERID = ?";

    // Thực hiện câu query để lấy các bài viết
    connection.query(queryPosts, [userId], (err, posts) => {
      if (err) {
        console.error("Error fetching user posts:", err);
        res.status(500).json({ error: "Error fetching user posts" });
        return;
      }

      res.status(200).json(posts);
    });
  });
});

// API lọc bài đăng theo Quận
app.get("/api/search-posts-location", (req, res) => {
  const selectedDistrict = req.query.district;

  // Truy vấn SELECT từ NEWSLIST với điều kiện Quận
  const selectNewslistQuery = `
    SELECT NEWSID, USERID, TITLE, PRICE, ACREAGE, ADDRESS, STATE
    FROM 
      NEWSLIST
    WHERE 
      ADDRESS IN (SELECT IDDISTRICT FROM HCMDISTRICT WHERE DISTRICT LIKE '%${selectedDistrict}%')
  `;

  // Thực hiện truy vấn SELECT để lấy danh sách bài đăng với điều kiện Quận
  connection.query(selectNewslistQuery, async (error, newslistResults) => {
    if (error) {
      console.error("Error executing SELECT query", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    try {
      // Duyệt qua từng bài đăng để thực hiện các truy vấn phụ
      const posts = await Promise.all(
        newslistResults.map(async (news) => {
          const newsid = news.NEWSID;
          const userId = news.USERID;
          const districtId = news.ADDRESS;

          // Truy vấn chi tiết bài đăng từ NEWSDETAIL
          const newsDetail = await new Promise((resolve, reject) => {
            connection.query(
              "SELECT * FROM NEWSDETAIL WHERE NEWSID = ?",
              [newsid],
              (error, results) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(results[0]);
                }
              }
            );
          });

          // Truy vấn tên quận từ HCMDISTRICT
          const district = await new Promise((resolve, reject) => {
            connection.query(
              "SELECT DISTRICT FROM HCMDISTRICT WHERE IDDISTRICT = ?",
              [districtId],
              (error, results) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(results[0].DISTRICT);
                }
              }
            );
          });

          // Truy vấn thông tin người dùng từ USERINFO
          const userInfo = await new Promise((resolve, reject) => {
            connection.query(
              "SELECT NAME, PHONE, AVATAR FROM USERINFO WHERE USERID = ?",
              [userId],
              (error, results) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(results[0]);
                }
              }
            );
          });

          // Truy vấn hình ảnh từ bảng IMAGE
          const image = await new Promise((resolve, reject) => {
            connection.query(
              "SELECT IMAGE FROM IMAGE WHERE NEWSID = ? LIMIT 1",
              [newsid],
              (error, results) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(results[0] ? results[0].IMAGE : null);
                }
              }
            );
          });

          // Kết hợp các thông tin lại thành một đối tượng
          return {
            ...news,
            ...newsDetail,
            district,
            ...userInfo,
            image, // Thêm đường dẫn hình ảnh
          };
        })
      );

      // Lấy số lượng bài đăng
      const total = posts.length;

      // Trả về dữ liệu và số lượng bài đăng
      res.status(200).json({ results: posts, total });
    } catch (error) {
      console.error("Error executing subqueries", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
});

// API lọc bài đăng theo Quận, giá và diện tích
app.get("/api/search-posts", (req, res) => {
  const selectedDistrict = req.query.district;
  const priceFilter = req.query.price;
  const areaFilter = req.query.acreage;

  // Xây dựng truy vấn SQL chứa các điều kiện lọc
  let selectNewslistQuery = `
    SELECT NEWSLIST.NEWSID, NEWSLIST.USERID, NEWSLIST.TITLE, NEWSLIST.PRICE, 
          NEWSLIST.ACREAGE, NEWSLIST.ADDRESS, NEWSLIST.STATE, NEWSDETAIL.*
    FROM NEWSLIST
    INNER JOIN NEWSDETAIL ON NEWSLIST.NEWSID = NEWSDETAIL.NEWSID
    INNER JOIN HCMDISTRICT ON NEWSLIST.ADDRESS = HCMDISTRICT.IDDISTRICT
  `;

  // Biến để kiểm tra xem có áp dụng điều kiện WHERE chưa
  let whereClauseAdded = false;

  // Áp dụng bộ lọc quận nếu có
  if (selectedDistrict && selectedDistrict !== "all" && selectedDistrict !== "undefined") {
    selectNewslistQuery += `
      WHERE HCMDISTRICT.DISTRICT = '${selectedDistrict}'
    `;
    whereClauseAdded = true;
  }

  // Áp dụng bộ lọc giá nếu có
  if (priceFilter && priceFilter !== "all" && priceFilter !== "undefined") {
    selectNewslistQuery += `${whereClauseAdded ? " AND" : " WHERE"} `;
    switch (priceFilter) {
      case "1":
        selectNewslistQuery += `NEWSLIST.PRICE < 1000000`;
        break;
      case "2":
        selectNewslistQuery += `NEWSLIST.PRICE >= 1000000 AND NEWSLIST.PRICE < 2000000`;
        break;
      case "3":
        selectNewslistQuery += `NEWSLIST.PRICE >= 2000000 AND NEWSLIST.PRICE < 3000000`;
        break;
      case "4":
        selectNewslistQuery += `NEWSLIST.PRICE >= 3000000 AND NEWSLIST.PRICE < 5000000`;
        break;
      case "5":
        selectNewslistQuery += `NEWSLIST.PRICE >= 5000000 AND NEWSLIST.PRICE < 7000000`;
        break;
      case "6":
        selectNewslistQuery += `NEWSLIST.PRICE >= 7000000 AND NEWSLIST.PRICE < 10000000`;
        break;
      case "7":
        selectNewslistQuery += `NEWSLIST.PRICE >= 10000000 AND NEWSLIST.PRICE <= 15000000`;
        break;
      case "8":
        selectNewslistQuery += `NEWSLIST.PRICE > 15000000`;
        break;
      default:
        break;
    }
    whereClauseAdded = true;
  }

  // Áp dụng bộ lọc diện tích nếu có
  if (areaFilter && areaFilter !== "all" && areaFilter !== "undefined") {
    selectNewslistQuery += `${whereClauseAdded ? " AND" : " WHERE"} `;
    switch (areaFilter) {
      case "1":
        selectNewslistQuery += `NEWSLIST.ACREAGE < 20`;
        break;
      case "2":
        selectNewslistQuery += `NEWSLIST.ACREAGE >= 20 AND NEWSLIST.ACREAGE < 30`;
        break;
      case "3":
        selectNewslistQuery += `NEWSLIST.ACREAGE >= 30 AND NEWSLIST.ACREAGE < 50`;
        break;
      case "4":
        selectNewslistQuery += `NEWSLIST.ACREAGE >= 50 AND NEWSLIST.ACREAGE < 70`;
        break;
      case "5":
        selectNewslistQuery += `NEWSLIST.ACREAGE >= 70 AND NEWSLIST.ACREAGE < 90`;
        break;
      case "6":
        selectNewslistQuery += `NEWSLIST.ACREAGE > 90`;
        break;
      default:
        break;
    }
    whereClauseAdded = true;
  }

  // Thực hiện truy vấn SELECT để lấy danh sách bài đăng với các điều kiện lọc
  connection.query(selectNewslistQuery, async (error, newslistResults) => {
    if (error) {
      console.error("Error executing SELECT query", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    try {
      // Duyệt qua từng bài đăng để thực hiện các truy vấn phụ
      const posts = await Promise.all(
        newslistResults.map(async (news) => {
          const newsid = news.NEWSID;
          const userId = news.USERID;
          const districtId = news.ADDRESS;

          // Truy vấn tên quận từ HCMDISTRICT
          const district = await new Promise((resolve, reject) => {
            connection.query(
              "SELECT DISTRICT FROM HCMDISTRICT WHERE IDDISTRICT = ?",
              [districtId],
              (error, results) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(results[0].DISTRICT);
                }
              }
            );
          });

          // Truy vấn thông tin người dùng từ USERINFO
          const userInfo = await new Promise((resolve, reject) => {
            connection.query(
              "SELECT NAME, PHONE, AVATAR FROM USERINFO WHERE USERID = ?",
              [userId],
              (error, results) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(results[0]);
                }
              }
            );
          });

          // Truy vấn hình ảnh từ bảng IMAGE
          const image = await new Promise((resolve, reject) => {
            connection.query(
              "SELECT IMAGE FROM IMAGE WHERE NEWSID = ? LIMIT 1",
              [newsid],
              (error, results) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(results[0] ? results[0].IMAGE : null);
                }
              }
            );
          });

          // Kết hợp các thông tin lại thành một đối tượng
          return {
            ...news,
            district,
            ...userInfo,
            image, // Thêm đường dẫn hình ảnh
          };
        })
      );

      // Lấy số lượng bài đăng
      const total = posts.length;

      // Trả về dữ liệu và số lượng bài đăng
      res.status(200).json({ results: posts, total });
    } catch (error) {
      console.error("Error executing subqueries", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
});

app.post("/api/signup", (req, res) => {
  const { username, email, phone, password } = req.body;
  try {
    // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu hay không
    connection.query(
      "SELECT * FROM account WHERE email = ?",
      [email],
      (error, results) => {
        if (error) {
          console.error("Error checking existing user:", error);
          return res.status(500).json({ message: "Internal server error" });
        }

        if (results.length > 0) {
          return res.status(409).json({ message: "Email already exists" });
        }

        // Nếu email không tồn tại, tiến hành tạo tài khoản mới.
        // Insert new user into the database
        connection.query(
          "INSERT INTO account (email, state, password, role) VALUES (?, ?, ?, ?)",
          [email, "Hoạt động", password, 2],
          (error, results) => {
            if (error) {
              console.error("Error creating user:", error);
              return res.status(500).json({ message: "Internal server error" });
            }

            // Insert user information into the userinfo table
            connection.query(
              "INSERT INTO userinfo (name, phone, email) VALUES (?, ?, ?)",
              [username, phone, email],
              (error, results) => {
                if (error) {
                  console.error("Error inserting userinfo:", error);
                  return res
                    .status(500)
                    .json({ message: "Internal server error" });
                }

                res.status(201).json({ message: "User created successfully" });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Định nghĩa endpoint API để xử lý yêu cầu thay đổi mật khẩu
app.post("/api/forgot-password", async (req, res) => {
  try {
    // Lấy dữ liệu từ body của yêu cầu
    const { username, email, password } = req.body;
    // Kiểm tra xem email và tên người dùng có tồn tại trong cơ sở dữ liệu hay không
    const existingUser = await connection.query(
      "SELECT * FROM userinfo WHERE name = ? AND email = ?",
      [username, email]
    );

    // Nếu không tìm thấy người dùng với tên người dùng và email đã cung cấp, trả về lỗi 404
    if (existingUser.length === undefined || existingUser.length === null) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update mật khẩu mới trong cơ sở dữ liệu
    await connection.query("UPDATE account SET password = ? WHERE email = ?", [
      password,
      email,
    ]);

    // Trả về phản hồi thành công
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/detail/:id", (req, res) => {
  const postId = req.params.id;

  // Thực hiện truy vấn SELECT để lấy chi tiết của bài đăng với id tương ứng từ cả ba bảng newslist, newsdetail, và userinfo
  const selectQuery = `
    SELECT 
      newslist.userid,
      newslist.newsid,
      newslist.title,
      newsdetail.describe,
      newslist.price,
      newslist.acreage,
      newslist.address,
      hcmdistrict.district,
      newsdetail.specificaddress,
      image.image,
      newslist.price,
      newslist.acreage,
      newslist.address,
      newsdetail.describe,
      newsdetail.timestart,
      newsdetail.timeend,
      userinfo.phone,
      userinfo.name,
      userinfo.avatar,
      image.image
    FROM 
      newslist
    LEFT JOIN 
      newsdetail ON newslist.newsid = newsdetail.newsid
    LEFT JOIN 
      userinfo ON newslist.userid = userinfo.userid
    LEFT JOIN 
      hcmdistrict ON newslist.address = hcmdistrict.iddistrict
    LEFT JOIN 
      image ON newslist.newsid = image.newsid
    WHERE
      newslist.newsid = ?
  `;

  connection.query(selectQuery, [postId], (error, results) => {
    if (error) {
      console.error("Error executing SELECT query", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const responseData = results[0];

    res.status(200).json(responseData);
  });
});

// API GÌ ĐÂY ????
app.get("/api/search", (req, res) => {
  const { district } = req.query; // Get district from query parameters

  // Query to search for posts by district
  const searchQuery = `
    SELECT * FROM newslist
    WHERE location = ?
  `;

  // Query to count the total number of posts by district
  const countQuery = `
    SELECT COUNT(*) AS total FROM newslist
    WHERE location = ?
  `;

  // Execute the search query
  connection.query(searchQuery, [district], (error, results) => {
    if (error) {
      console.error("Error searching:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    // Execute the count query to get the total number of posts
    connection.query(countQuery, [district], (error, countResult) => {
      if (error) {
        console.error("Error counting:", error);
        return res.status(500).json({ message: "Internal server error" });
      }

      const total = countResult[0].total; // Get the total count from the result

      res.status(200).json({ results, total }); // Send results and total count as JSON response
    });
  });
});

// API để lấy ADMINID dựa trên email
app.get('/api/get-adminId-byEmail/:email', (req, res) => {
  const email = req.params.email;
  
  const query = 'SELECT ADMINID FROM ADMININFO WHERE EMAIL = ?';
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn:', err);
      res.status(500).send('Lỗi máy chủ');
      return;
    }

    if (results.length > 0) {
      res.json({ ADMINID: results[0].ADMINID });
    } else {
      res.status(404).send('Không tìm thấy ADMIN với email này');
    }
  });
});


// API lấy thông tin quản trị viên theo email
app.get("/api/admin-info/:email", (req, res) => {
  const email = req.params.email;
  const query = "SELECT * FROM admininfo WHERE EMAIL = ?";

  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error fetching admin data:", err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
    res.status(200).json(results);
  });
});

// API lấy thông tin quản trị viên bằng id
app.get("/api/get-adminInfo-byId/:adminId", (req, res) => {
  const adminId = req.params.adminId; // Đổi từ req.params.id thành req.params.adminId để lấy đúng adminId
  const query = "SELECT * FROM admininfo WHERE ADMINID = ?";

  connection.query(query, [adminId], (err, results) => {
    if (err) {
      console.error("Error fetching admin data:", err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ message: "Admin not found" });
      return;
    }

    const adminInfo = results[0]; // Lấy thông tin của admin đầu tiên (do adminId là duy nhất)

    // Gửi thông tin của admin về client
    res.status(200).json(adminInfo);
  });
});

// API lấy danh sách userID
app.get("/api/get-list-userID", (req, res) => {
  const userIdsQuery = "SELECT USERID FROM userinfo";

  connection.query(userIdsQuery, (err, results) => {
    if (err) {
      console.error("Error fetching user IDs:", err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
    res.status(200).json(results);
  });
});

// API lấy ID người dùng bằng email
app.get("/api/get-userid-byEmail/:email", (req, res) => {
  const email = req.params.email;

  const query = "SELECT USERID FROM USERINFO WHERE EMAIL = ?";
  connection.query(query, [email], (error, results) => {
    if (results.length === 0) {
      res.status(404).send("User not found");
      return;
    }

    if (error) {
      console.error("Error fetching USERID:", error);
      res.status(500).send("Internal Server Error");
      return;
    }


    const userId = results[0].USERID;
    res.json({ USERID: userId });
  });
});

// API lấy thông tin người dùng và tổng số bài đăng theo USERID
app.get("/api/user-info/:userid", (req, res) => {
  const userId = req.params.userid;

  // Truy vấn đầu tiên để lấy thông tin người dùng
  const userQuery = "SELECT * FROM userinfo WHERE USERID = ?";

  connection.query(userQuery, [userId], (err, userResults) => {
    if (err) {
      console.error("Error fetching user data:", err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    if (userResults.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const user = userResults[0];

    // Truy vấn thứ hai để đếm số lượng bài đăng của người dùng
    const newsCountQuery =
      "SELECT COUNT(*) AS NEWSCOUNT FROM newslist WHERE USERID = ?";

    connection.query(newsCountQuery, [userId], (err, newsCountResults) => {
      if (err) {
        console.error("Error fetching news count:", err);
        res.status(500).json({ message: "Internal server error" });
        return;
      }

      user.NEWSCOUNT = newsCountResults[0].NEWSCOUNT;

      // Truy vấn thứ ba để lấy trạng thái từ bảng account sử dụng email
      const email = user.EMAIL;
      const statusQuery = "SELECT state FROM account WHERE email = ?";

      connection.query(statusQuery, [email], (err, statusResults) => {
        if (err) {
          console.error("Error fetching user status:", err);
          res.status(500).json({ message: "Internal server error" });
          return;
        }

        if (statusResults.length === 0) {
          res.status(404).json({ message: "User status not found" });
          return;
        }

        user.STATUS = statusResults[0].state;
        res.status(200).json(user);
      });
    });
  });
});

// API cập nhật thông tin người dùng
app.put("/api/update-userinfo/:userId", (req, res) => {
  const userId = req.params.userId;
  const { NAME, DOB, SEX, PHONE, ADDRESS } = req.body;

  // Query SQL để cập nhật thông tin người dùng
  let sql = `
    UPDATE USERINFO
    SET NAME = ?, DOB = ?, SEX = ?, PHONE = ?, ADDRESS = ?
    WHERE USERID = ?
  `;
  let values = [NAME, DOB, SEX, PHONE, ADDRESS, userId];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating user: ", err);
      res.status(500).json({ success: false, message: "Error updating user" });
    } else {
      console.log("User updated successfully");
      res
        .status(200)
        .json({ success: true, message: "User updated successfully" });
    }
  });
});

// API cập nhật trạng thái tài khoản người dùng bằng email
app.put("/api/update-user-state", (req, res) => {
  const email = req.body.EMAIL;
  const newStatus = req.body.STATUS;

  const updateQuery = "UPDATE account SET state = ? WHERE email = ?";

  connection.query(updateQuery, [newStatus, email], (err, results) => {
    if (err) {
      console.error("Error updating user state:", err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "User state updated successfully" });
  });
});

// API tạo phiếu thanh toán
app.post("/api/create-payment", (req, res) => {
  const { NEWSID, POSTDURATION, ADMINEMAIL } = req.body;

  try {
    // Lấy ADMINID từ ADMINEMAIL
    const adminQuery = "SELECT ADMINID FROM ADMININFO WHERE EMAIL = ?";
    connection.query(adminQuery, [ADMINEMAIL], (error, adminResults) => {
      if (adminResults.length === 0) {
        return res.status(404).json({ error: "Admin not found" });
      }
      if (error) {
        console.error("Error querying admin:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

      const ADMINID = adminResults[0].ADMINID;

      // Lấy giá từ bảng giá
      const priceQuery = "SELECT PRICE FROM PRICELIST WHERE POSTDURATION = ?";
      connection.query(priceQuery, [POSTDURATION], (error, priceResults) => {
        if (priceResults.length === 0) {
          return res.status(404).json({ error: "Price not found" });
        }

        if (error) {
          console.error("Error querying price:", error);
          return res.status(500).json({ error: "Internal server error" });
        }

        const PRICE = priceResults[0].PRICE;

        // Tạo phiếu thanh toán
        const paymentQuery =
          "INSERT INTO PAYMENT (NEWSID, PRICE, ADMINID, STATE) VALUES (?, ?, ?, ?)";
        connection.query(
          paymentQuery,
          [NEWSID, PRICE, ADMINID, "Chờ duyệt"],
          (error, results) => {
            if (error) {
              console.error("Error creating payment:", error);
              return res.status(500).json({ error: "Internal server error" });
            }
            console.log("Payment created successfully");
            return res
              .status(201)
              .json({ message: "Payment created successfully" });
          }
        );
      });
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// API to fetch all payments with user and admin info
app.get("/api/payment", async (req, res) => {
  const query = "SELECT * FROM payment";
  try {
    connection.query(query, async (err, results) => {
      if (err) {
        console.error("Error fetching payments:", err);
        res.status(500).json({ message: "Failed to fetch payments" });
        return;
      }

      // Collecting all unique adminIds
      const adminIds = results
        .map((payment) => payment.ADMINID)
        .filter((adminId) => adminId != null);

      // Collecting all unique newsIds
      const newsIds = results
        .map((payment) => payment.NEWSID)
        .filter((newsId) => newsId != null);

      // Fetching admin names from admininfo table
      const adminInfoQuery = `SELECT ADMINID, NAME FROM admininfo WHERE ADMINID IN (${adminIds.join(
        ","
      )})`;
      const admins = await new Promise((resolve, reject) => {
        connection.query(adminInfoQuery, (err, adminResults) => {
          if (err) {
            console.error("Error fetching admin info:", err);
            reject(err);
            return;
          }
          resolve(adminResults);
        });
      });

      // Fetching userIds from newslist table based on newsIds
      const userIdQuery = `SELECT NEWSID, USERID FROM newslist WHERE NEWSID IN (${newsIds.join(
        ","
      )})`;
      const users = await new Promise((resolve, reject) => {
        connection.query(userIdQuery, (err, userResults) => {
          if (err) {
            console.error("Error fetching user info:", err);
            reject(err);
            return;
          }
          resolve(userResults);
        });
      });

      // Collecting all unique userIds
      const userIds = users.map((user) => user.USERID);

      // Fetching user names from userinfo table based on userIds
      const userInfoQuery = `SELECT USERID, NAME FROM userinfo WHERE USERID IN (${userIds.join(
        ","
      )})`;
      const userNames = await new Promise((resolve, reject) => {
        connection.query(userInfoQuery, (err, userNameResults) => {
          if (err) {
            console.error("Error fetching user names:", err);
            reject(err);
            return;
          }
          resolve(userNameResults);
        });
      });

      // Mapping adminIds to respective names
      const adminIdToNameMap = {};
      admins.forEach((admin) => {
        adminIdToNameMap[admin.ADMINID] = admin.NAME;
      });

      // Mapping newsIds to respective userIds
      const newsIdToUserIdMap = {};
      users.forEach((user) => {
        newsIdToUserIdMap[user.NEWSID] = user.USERID;
      });

      // Mapping userIds to respective names
      const userIdToNameMap = {};
      userNames.forEach((userName) => {
        userIdToNameMap[userName.USERID] = userName.NAME;
      });

      // Combining results with admin and user names
      const paymentsWithNames = results.map((payment) => {
        const ADMINNAME = adminIdToNameMap[payment.ADMINID];
        const USERID = newsIdToUserIdMap[payment.NEWSID];
        const USERNAME = userIdToNameMap[USERID];
        return {
          ...payment,
          ADMINNAME,
          USERNAME,
        };
      });

      res.status(200).json(paymentsWithNames);
    });
  } catch (error) {
    console.error("Error processing payments:", error);
    res.status(500).json({ message: "Failed to process payments" });
  }
});


// api để lập bảng thống kê doanh thu
app.get('/api/payment-statistics', (req, res) => {
  // Truy vấn SQL để lấy thông tin cần thiết từ bảng PAYMENT và trích xuất MONTH và YEAR từ cột TIME
  const query = `
    SELECT MONTH(TIME) AS payment_month, YEAR(TIME) AS payment_year, COUNT(*) AS totalPosts, SUM(PRICE) AS totalProfit
    FROM PAYMENT
    WHERE STATE = 'Thành công'
    GROUP BY payment_month, payment_year
  `;

  // Thực hiện truy vấn SQL
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Tạo đối tượng kết quả để trả về cho client
    const response = {
      statistics: results.map(payment => {
        return {
          month: payment.payment_month,
          year: payment.payment_year,
          totalPosts: payment.totalPosts,
          totalProfit: payment.totalProfit
        };
      })
    };

    // Log kết quả
    console.log("Response:", response);

    // Trả về kết quả cho client
    res.json(response);
  });
});



// API to fetch payment by paymentId
app.get("/api/payment/:paymentId", (req, res) => {
  const paymentId = req.params.paymentId;
  const query = "SELECT * FROM payment WHERE paymentId = ?";
  connection.query(query, [paymentId], (err, results) => {
    if (err) {
      console.error("Error fetching payment:", err);
      res.status(500).json({ message: "Failed to fetch payment" });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }
    res.status(200).json(results[0]);
  });
});
const util = require("util");
const { TbHanger2 } = require("react-icons/tb");
const query = util.promisify(connection.query).bind(connection);

// API lấy thông tin thanh toán dựa trên NEWSID
app.get("/api/get-payment-byNewsid/:newsid", (req, res) => {
  const { newsid } = req.params;
  const sql = `SELECT * FROM payment WHERE NEWSID = ?`;

  connection.query(sql, [newsid], (err, result) => {
    if (err) {
      console.error("Error fetching payment info:", err);
      res.status(500).json({ error: "Error fetching payment info" });
      return;
    }

    res.status(200).json(result);
  });
});

// API PUT để cập nhật trạng thái và ADMINID trong bảng payment
app.put("/api/update-paymentState/:PAYID", async (req, res) => {
  const PAYID = req.params.PAYID;
  const { state, ADMINEMAIL } = req.body;

  try {
    // Query to get ADMINID from admininfo table using ADMINEMAIL
    const adminIdQuery = `SELECT ADMINID FROM admininfo WHERE EMAIL = ?`;

    const row = await query(adminIdQuery, [ADMINEMAIL]);

    if (!row || row.length === 0 || !row[0].ADMINID) {
      return res
        .status(404)
        .json({ error: "Admin not found or ADMINID not available" });
    }

    const ADMINID = row[0].ADMINID;

    // Get current timestamp in Vietnam timezone to update TIME in payment table
    const currentTime = new Date();
    const vietnamTimezone = "Asia/Ho_Chi_Minh";
    const formattedTime = format(currentTime, "yyyy-MM-dd HH:mm:ss", {
      timeZone: vietnamTimezone,
    });

    // Update payment table with STATE, ADMINID, and TIME
    const updateQuery = `
      UPDATE payment
      SET STATE = ?, ADMINID = ?, TIME = ?
      WHERE PAYID = ?
    `;

    const result = await query(updateQuery, [
      state,
      ADMINID,
      formattedTime,
      PAYID,
    ]);

    // Check if the update was successful
    if (result.affectedRows > 0) {
      console.log(`Payment with PAYID ${PAYID} updated successfully`);
      res.status(200).json({ message: "Payment updated successfully" });
    } else {
      res.status(404).json({ error: `Payment with PAYID ${PAYID} not found` });
    }
  } catch (error) {
    console.error("Error updating payment state:", error);
    res.status(500).json({ error: "Error updating payment state" });
  }
});

// API tạo thông báo
app.post("/api/create-notification", (req, res) => {
  const { newsid, content, reason, category } = req.body;
  try {
    // Lấy USERID từ NEWSLIST dựa trên NEWSID
    const getUserIdQuery = "SELECT USERID FROM NEWSLIST WHERE NEWSID = ?";
    connection.query(getUserIdQuery, [newsid], (error, userResults) => {
      if (error) {
        console.error("Lỗi khi lấy USERID từ NEWSLIST:", error);
        return res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
      }

      if (userResults.length === 0) {
        return res.status(404).json({ error: "Bài viết không tồn tại" });
      }

      const userid = userResults[0].USERID;

      // Tạo thông báo
      const createNotificationQuery =
        "INSERT INTO NOTIFICATION (USERID, CONTENT, REASON, CATEGORY) VALUES (?, ?, ?, ?)";
      connection.query(
        createNotificationQuery,
        [userid, content, reason, category],
        (error, results) => {
          if (error) {
            console.error("Lỗi khi tạo thông báo:", error);
            return res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
          }
          console.log("Tạo thông báo thành công");
          return res.status(200).json({ message: "Tạo thông báo thành công" });
        }
      );
    });
  } catch (error) {
    console.error("Lỗi khi tạo thông báo:", error);
    return res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
});

// API lấy thông tin tất cả thông báo của người dùng có USERID
app.get("/api/get-notification-byUserID/:userId", (req, res) => {
  const userId = req.params.userId;
  const query = "SELECT * FROM NOTIFICATION WHERE USERID = ?";

  connection.query(query, [userId], (error, results) => {
    if (error) {
      console.error("Error fetching notifications:", error);
      return res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
    }
    res.status(200).json(results);
  });
});

// API đánh dấu đã xem thông báo
app.put("/api/update-notificationSeen/:notificationID", (req, res) => {
  const notificationID = req.params.notificationID;
  const query = "UPDATE NOTIFICATION SET SEEN = 1 WHERE ID = ?";

  connection.query(query, [notificationID], (error, results) => {
    if (error) {
      console.error("Error updating notification seen state:", error);
      return res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy thông báo" });
    }
    res.status(200).json({ message: "Cập nhật trạng thái đã xem thành công" });
  });
});


// API để kiểm tra người dùng đã thực hiện báo cáo chưa
app.get('/api/check-report-yet/:userId/:newsId', (req, res) => {
  const userId = req.params.userId;
  const newsId = req.params.newsId;
  
  const sql = 'SELECT COUNT(*) AS count FROM report WHERE USERID = ? AND NEWSID = ?';
  const values = [userId, newsId];
  
  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error checking report:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    
    const reported = results[0].count;
    res.json({ reported });
  });
});

// API tạo báo cáo mới
app.post('/api/create-report', (req, res) => {
  const { USERID, NEWSID, ISSUE } = req.body;
  
  const sql = 'INSERT INTO report (USERID, NEWSID, CONTENT) VALUES (?, ?, ?)';
  const values = [USERID, NEWSID, ISSUE];
  
  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error creating report:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    
    res.status(201).json({ message: 'Report created successfully' });
  });
});

// API endpoint để lấy danh sách báo cáo
app.get("/api/get-reportList", (req, res) => {
  // Bước 1: Lấy danh sách báo cáo từ bảng REPORT
  const sqlReportList = "SELECT * FROM REPORT";

  // Thực hiện truy vấn SQL để lấy danh sách báo cáo
  connection.query(sqlReportList, (err, reports) => {
    if (err) {
      console.error("Error fetching report list:", err);
      res.status(500).send("Internal server error");
      return;
    }

    // Lấy mảng các USERID từ reports
    const userIds = reports.map(report => report.USERID);
    // Lấy mảng các NEWSID từ reports
    const newsIds = reports.map(report => report.NEWSID);

    // Bước 2: Lấy thông tin người báo cáo từ bảng USERINFO
    const sqlReporterInfo = "SELECT USERID, NAME FROM USERINFO WHERE USERID IN (?)";

    // Thực hiện truy vấn SQL để lấy thông tin người báo cáo
    connection.query(sqlReporterInfo, [userIds], (err, reporters) => {
      if (err) {
        console.error("Error fetching reporter info:", err);
        res.status(500).send("Internal server error");
        return;
      }

      // Bước 3: Lấy thông tin chủ bài đăng từ bảng NEWSLIST và USERINFO
      const sqlPostOwners = "SELECT NEWSLIST.NEWSID, USERINFO.NAME FROM NEWSLIST JOIN USERINFO ON NEWSLIST.USERID = USERINFO.USERID WHERE NEWSLIST.NEWSID IN (?)";

      // Thực hiện truy vấn SQL để lấy thông tin chủ bài đăng
      connection.query(sqlPostOwners, [newsIds], (err, postOwners) => {
        if (err) {
          console.error("Error fetching post owners:", err);
          res.status(500).send("Internal server error");
          return;
        }

        // Kết hợp dữ liệu từ các truy vấn thành một đối tượng duy nhất
        const reportList = reports.map((report) => {
          const reporter = reporters.find((r) => r.USERID === report.USERID);
          const postOwner = postOwners.find((p) => p.NEWSID === report.NEWSID);
          return {
            REPORTID: report.REPORTID,
            NEWSID: report.NEWSID,
            REPORTER: reporter ? reporter.NAME : "Unknown",
            POSTOWNER: postOwner ? postOwner.NAME : "Unknown",
            TIME: report.TIME,
            CONTENT: report.CONTENT,
            SEEN: report.SEEN
          };
        });

        // Trả về kết quả là danh sách báo cáo đã kết hợp thông tin
        res.json(reportList);
      });
    });
  });
});

// API đánh dấu đã xem thông báo
app.put("/api/update-reportSeen/:reportID", (req, res) => {
  const reportID = req.params.reportID;
  const query = "UPDATE REPORT SET SEEN = 1 WHERE REPORTID = ?";

  connection.query(query, [reportID], (error, results) => {
    if (error) {
      console.error("Error updating report seen state:", error);
      return res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy thông báo" });
    }
    res.status(200).json({ message: "Cập nhật trạng thái đã xem thành công" });
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
