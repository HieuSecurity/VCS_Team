const express = require("express");
const session = require('express-session')
const cors = require("cors");
const mysql = require("mysql");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const { start } = require("repl");
const app = express();  
const PORT = process.env.PORT || 3000;
const { format, parseISO } = require('date-fns-tz'); // Import format và parseISO từ date-fns-tz
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root", // Thay username bằng tên người dùng của bạn
  password: "", // Thay password bằng mật khẩu của bạn
  database: "DBPT", // Thay database_name bằng tên cơ sở dữ liệu của bạn
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
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype ==="image/jpg ") {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024  }, // 10 MB limit
  fileFilter: fileFilter,
});


// API to get an image
app.get("/image/:filename", (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.resolve(__dirname, "./uploads", filename);
  res.sendFile(imagePath);
});

// route to handle multiple image upload
app.post("/api/upload-images/:postId", upload.array("images", 10), async (req, res) => {
  const images = req.files;
  const postId = req.params.newslistId;

  // Check if any file is uploaded
  if (!images || images.length === 0) {
    return res.status(400).json({ message: "No images uploaded" });
  }

  try {
    // Use a promise-based approach to handle image insertions
    const insertImagePromises = images.map((image) => {
      const insertImageQuery = "INSERT INTO image (newsid, image) VALUES (?, ?)";
      return executeQuery(connection, insertImageQuery, [postId, image.filename]);
    });

    // Wait for all image insertions to complete
    await Promise.all(insertImagePromises);

    const fileInfos = images.map(image => ({
      filename: image.filename,
      path: image.path
    }));

    // Send response after all insertions are successful
    res.status(200).json({
      message: 'Images uploaded and associated with the post successfully.',
      files: fileInfos
    });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({ message: 'An error occurred during image upload.', error });
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


app.post("/api/create-post", upload.array("images", 5), (req, res) => {
  const { title, timestart, describe, price, acreage, address, district, postDuration } = req.body;
  const images = req.files; // Get the list of uploaded images from req.files
  const USERID_temp = 4;
  const state = 'Chờ duyệt';

  connection.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    // lấy IDDISTRICT từ database tương ứng với option người dùng chọn
    const getDistrictQuery = 'SELECT IDDISTRICT FROM hcmdistrict WHERE DISTRICT = ?';
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
      const insertNewslistQuery = 'INSERT INTO newslist (title, acreage, price, address, userid, state, postduration) VALUES (?, ?, ?, ?, ?, ?, ?)';
      connection.query(insertNewslistQuery, [title, acreage, price, IDDISTRICT, USERID_temp, state, postDuration], (error, newslistResults) => {
        if (error) {
          return connection.rollback(() => {
            console.error("Error executing INSERT into newslist", error);
            res.status(500).json({ message: "Internal server error" });
          });
        }

        const newslistId = newslistResults.insertId;

        // Insert post details into newsdetail table
        const insertNewsdetailQuery = 'INSERT INTO newsdetail (newsid, specificaddress, `describe` ) VALUES (?, ?, ?)';
        connection.query(insertNewsdetailQuery, [newslistId ,address, describe], (error, newsdetailResults) => {
          if (error) {
            return connection.rollback(() => {
              console.error("Error executing INSERT into newsdetail", error);
              res.status(500).json({ message: "Internal server error" });
            });
          }

          if (!images || images.length === 0) {
            // No images uploaded
            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  console.error("Error committing transaction", err);
                  res.status(500).json({ message: "Internal server error" });
                });
              }

              res.status(200).json({
                message: "Post created successfully",
                postId: newslistId,
              });
            });
          } else {
            // Images uploaded, insert them into the database
            const insertImageQuery = 'INSERT INTO image (newsid, image) VALUES (?, ?)';
            const promises = images.map((image) => {
              const imageUrl = image.filename;
              return new Promise((resolve, reject) => {
                connection.query(insertImageQuery, [newslistId, imageUrl], (error, imageResults) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve();
                  }
                });
              });
            });

            Promise.all(promises)
              .then(() => {
                connection.commit((err) => {
                  if (err) {
                    return connection.rollback(() => {
                      console.error("Error committing transaction", err);
                      res.status(500).json({ message: "Internal server error" });
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
                  res.status(500).json({ message: "Internal server error" });
                });
              });
          }
        });
      });
    });
  });
});

// API cập nhật trạng thái bài viết
app.post('/api/update-newsState', (req, res) => {
  const { newsid, state } = req.body;
  try {
    // Update trạng thái của tin tức
    const updateQuery = 'UPDATE NEWSLIST SET STATE = ? WHERE NEWSID = ?';
    connection.query(updateQuery, [state, newsid], (error, results) => {
      if (error) {
        console.error('Lỗi khi cập nhật trạng thái tin tức:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
      }
      console.log(`Cập nhật trạng thái tin tức ${newsid} thành công`);
      return res.status(200).json({ message: 'Cập nhật trạng thái tin tức thành công' });
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái tin tức:', error);
    return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
  }
});

// 
app.get('/api/hcmdistrict', (req, res) => {
  const sql = 'SELECT * FROM hcmdistrict';
  connection.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.json(result);
  });
});

// API lấy thông tin bài viết
app.get("/api/get-posts", (req, res) => {
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
              connection.query("SELECT * FROM NEWSDETAIL WHERE NEWSID = ?", [newsid], (error, results) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(results[0]);
                }
              });
            });

            // Truy vấn tên quận từ HCMDISTRICT
            const district = await new Promise((resolve, reject) => {
              connection.query("SELECT DISTRICT FROM HCMDISTRICT WHERE IDDISTRICT = ?", [districtId], (error, results) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(results[0].DISTRICT);
                }
              });
            });

            // Truy vấn thông tin người dùng từ USERINFO
            const userInfo = await new Promise((resolve, reject) => {
              connection.query("SELECT NAME, PHONE, AVATAR FROM USERINFO WHERE USERID = ?", [userId], (error, results) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(results[0]);
                }
              });
            });

            // Truy vấn hình ảnh từ bảng IMAGE
            const image = await new Promise((resolve, reject) => {
              connection.query("SELECT IMAGE FROM IMAGE WHERE NEWSID = ? LIMIT 1", [newsid], (error, results) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(results[0] ? results[0].IMAGE : null);
                }
              });
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

app.get("/api/search-by-location", (req, res) => {
  const selectedDistrict = req.query.district;

  // Thực hiện truy vấn SELECT từ cơ sở dữ liệu với điều kiện là selectedDistrict
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
      image.image,
      newsdetail.timestart,
      newsdetail.timeend,
      userinfo.phone,
      userinfo.name,
      userinfo.avatar
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
      hcmdistrict.district LIKE '%${selectedDistrict}%'
  `;

  // Thực hiện truy vấn SELECT để lấy dữ liệu dựa trên giá trị Quận
  connection.query(selectQuery, (error, results) => {
    if (error) {
      console.error("Error executing SELECT query", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    // Lấy số lượng kết quả
    const totalResults = results.length;

    // Trả về dữ liệu và số lượng kết quả
    res.status(200).json({ results, total: totalResults });
  });
});

// API /api/latest-posts
app.get("/api/latest-posts", (req, res) => {
  // Thực hiện truy vấn SELECT để lấy danh sách 5 bài đăng mới nhất kèm thông tin người dùng từ bảng userinfo
  const selectQuery = `
    SELECT 
      newslist.userid,
      newslist.newsid,
      newslist.describe,
      newslist.price,
      newslist.acreage,
      newslist.address,
      newslist.image,
      newsdetail.timestart,
      newsdetail.timeend,
      userinfo.phone,
      userinfo.name,
      userinfo.avatar
    FROM 
      newslist
    LEFT JOIN 
      newsdetail ON newslist.newsid = newsdetail.newsid
    LEFT JOIN 
      userinfo ON newslist.userid = userinfo.userid
    ORDER BY 
      newsdetail.timestart DESC
    LIMIT 5`; // Giới hạn số lượng kết quả trả về thành 5 bài đăng mới nhất

  // Thực hiện truy vấn COUNT để đếm tổng số bài đăng mới nhất với cùng điều kiện WHERE
  const countQuery = `
    SELECT COUNT(*) AS total 
    FROM newslist 
    LEFT JOIN newsdetail ON newslist.newsid = newsdetail.newsid
    WHERE newsdetail.timestart IS NOT NULL`;

  // Thực hiện truy vấn để lấy số lượng kết quả
  connection.query(countQuery, (error, countResult) => {
    if (error) {
      console.error("Error counting:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    const total = countResult[0].total; // Lấy tổng số kết quả từ kết quả truy vấn COUNT

    // Thực hiện truy vấn SELECT để lấy danh sách 5 bài đăng mới nhất
    connection.query(selectQuery, (error, results) => {
      if (error) {
        console.error("Error executing SELECT query", error);
        return res.status(500).json({ message: "Internal server error" });
      }

      // Trả về dữ liệu và số lượng kết quả
      res.status(200).json({ results, total });
    });
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
                  return res.status(500).json({ message: "Internal server error" });
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
    await connection.query(
      "UPDATE account SET password = ? WHERE email = ?",
      [password, email]
    );

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

// API lấy thông tin quản trị viên theo email
app.get('/api/admin-info/:email', (req, res) => {
  const email = req.params.email;
  const query = 'SELECT * FROM admininfo WHERE EMAIL = ?';

  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error fetching admin data:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    res.status(200).json(results);
  });
});


// API cập nhật thông tin quản trị viên
app.put('/api/admin-info/:id', (req, res) => {
  const adminId = req.params.id;
  const { name, sex, dob, phone, email, address } = req.body;

  const query = `
    UPDATE admininfo SET
      name = ?,
      sex = ?,
      dob = ?,
      phone = ?,
      email = ?,
      address = ?
    WHERE id = ?
  `;

  connection.query(query, [name, sex, dob, phone, email, address, adminId], (err, results) => {
    if (err) {
      console.error('Error updating admin data:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    res.status(200).json({ message: 'User updated successfully' });
  });
});

// API lấy danh sách userID
app.get('/api/get-list-userID', (req, res) => {
  const userIdsQuery = 'SELECT USERID FROM userinfo';
  
  connection.query(userIdsQuery, (err, results) => {
    if (err) {
      console.error('Error fetching user IDs:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    res.status(200).json(results);
  });
});


// API lấy thông tin người dùng và tổng số bài đăng theo USERID
app.get('/api/user-info/:userid', (req, res) => {
  const userId = req.params.userid;

  // Truy vấn đầu tiên để lấy thông tin người dùng
  const userQuery = 'SELECT * FROM userinfo WHERE USERID = ?';

  connection.query(userQuery, [userId], (err, userResults) => {
    if (err) {
      console.error('Error fetching user data:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    

    if (userResults.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const user = userResults[0];

    // Truy vấn thứ hai để đếm số lượng bài đăng của người dùng
    const newsCountQuery = 'SELECT COUNT(*) AS NEWSCOUNT FROM newslist WHERE USERID = ?';

    connection.query(newsCountQuery, [userId], (err, newsCountResults) => {
      if (err) {
        console.error('Error fetching news count:', err);
        res.status(500).json({ message: 'Internal server error' });
        return;
      }
      

      user.NEWSCOUNT = newsCountResults[0].NEWSCOUNT;

      // Truy vấn thứ ba để lấy trạng thái từ bảng account sử dụng email
      const email = user.EMAIL;
      const statusQuery = 'SELECT state FROM account WHERE email = ?';

      connection.query(statusQuery, [email], (err, statusResults) => {
        if (err) {
          console.error('Error fetching user status:', err);
          res.status(500).json({ message: 'Internal server error' });
          return;
        }

        if (statusResults.length === 0) {
          res.status(404).json({ message: 'User status not found' });
          return;
        }

        user.STATUS = statusResults[0].state;
        res.status(200).json(user);
      });
    });
  });
});

// API cập nhật trạng thái tài khoản người dùng bằng email
app.put('/api/update-user-state', (req, res) => {
  const email = req.body.EMAIL;
  const newStatus = req.body.STATUS;

  const updateQuery = 'UPDATE account SET state = ? WHERE email = ?';

  connection.query(updateQuery, [newStatus, email], (err, results) => {
    if (err) {
      console.error('Error updating user state:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ message: 'User state updated successfully' });
  });
});


// API tạo phiếu thanh toán
app.post('/api/create-payment', (req, res) => {
  const { NEWSID, POSTDURATION, ADMINEMAIL } = req.body;

  try {
    // Lấy ADMINID từ ADMINEMAIL
    const adminQuery = 'SELECT ADMINID FROM ADMININFO WHERE EMAIL = ?';
    connection.query(adminQuery, [ADMINEMAIL], (error, adminResults) => {
      if (adminResults.length === 0) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      if (error) {
        console.error('Error querying admin:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const ADMINID = adminResults[0].ADMINID;

      // Lấy giá từ bảng giá
      const priceQuery = 'SELECT PRICE FROM PRICELIST WHERE POSTDURATION = ?';
      connection.query(priceQuery, [POSTDURATION], (error, priceResults) => {
        if (priceResults.length === 0) {
          return res.status(404).json({ error: 'Price not found' });
        }

        if (error) {
          console.error('Error querying price:', error);
          return res.status(500).json({ error: 'Internal server error' });
        }

        const PRICE = priceResults[0].PRICE;

        // Tạo phiếu thanh toán
        const paymentQuery = 'INSERT INTO PAYMENT (NEWSID, PRICE, ADMINID, STATE) VALUES (?, ?, ?, ?)';
        connection.query(paymentQuery, [NEWSID, PRICE, ADMINID, 'Chờ duyệt'], (error, results) => {
          if (error) {
            console.error('Error creating payment:', error);
            return res.status(500).json({ error: 'Internal server error' });
          }
          console.log('Payment created successfully');
          return res.status(201).json({ message: 'Payment created successfully' });
        });
      });
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return res.status(500).json({ error: 'Internal server error' });
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
      const adminIds = results.map((payment) => payment.ADMINID).filter((adminId) => adminId != null);

      // Collecting all unique newsIds
      const newsIds = results.map((payment) => payment.NEWSID).filter((newsId) => newsId != null);

      // Fetching admin names from admininfo table
      const adminInfoQuery = `SELECT ADMINID, NAME FROM admininfo WHERE ADMINID IN (${adminIds.join(",")})`;
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
      const userIdQuery = `SELECT NEWSID, USERID FROM newslist WHERE NEWSID IN (${newsIds.join(",")})`;
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
      const userInfoQuery = `SELECT USERID, NAME FROM userinfo WHERE USERID IN (${userIds.join(",")})`;
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
const util = require('util');
const query = util.promisify(connection.query).bind(connection);

// API PUT để cập nhật trạng thái và ADMINID trong bảng payment
app.put('/api/update-paymentState/:PAYID', async (req, res) => {
  const PAYID = req.params.PAYID;
  const { state, ADMINEMAIL } = req.body;
  
  try {
    // Query to get ADMINID from admininfo table using ADMINEMAIL
    const adminIdQuery = `SELECT ADMINID FROM admininfo WHERE EMAIL = ?`;

    const row = await query(adminIdQuery, [ADMINEMAIL]);

    if (!row || row.length === 0 || !row[0].ADMINID) {
      return res.status(404).json({ error: 'Admin not found or ADMINID not available' });
    }

    const ADMINID = row[0].ADMINID;

    // Get current timestamp in Vietnam timezone to update TIME in payment table
    const currentTime = new Date();
    const vietnamTimezone = 'Asia/Ho_Chi_Minh';
    const formattedTime = format(currentTime, "yyyy-MM-dd HH:mm:ss", { timeZone: vietnamTimezone });

    // Update payment table with STATE, ADMINID, and TIME
    const updateQuery = `
      UPDATE payment
      SET STATE = ?, ADMINID = ?, TIME = ?
      WHERE PAYID = ?
    `;

    const result = await query(updateQuery, [state, ADMINID, formattedTime, PAYID]);

    // Check if the update was successful
    if (result.affectedRows > 0) {
      console.log(`Payment with PAYID ${PAYID} updated successfully`);
      res.status(200).json({ message: 'Payment updated successfully' });
    } else {
      res.status(404).json({ error: `Payment with PAYID ${PAYID} not found` });
    }
  } catch (error) {
    console.error('Error updating payment state:', error);
    res.status(500).json({ error: 'Error updating payment state' });
  }
});

// API tạo thông báo
app.post('/api/create-notification', (req, res) => {
  const { newsid, content, reason } = req.body;
  try {
    // Lấy USERID từ NEWSLIST dựa trên NEWSID
    const getUserIdQuery = 'SELECT USERID FROM NEWSLIST WHERE NEWSID = ?';
    connection.query(getUserIdQuery, [newsid], (error, userResults) => {
      if (error) {
        console.error('Lỗi khi lấy USERID từ NEWSLIST:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
      }

      if (userResults.length === 0) {
        return res.status(404).json({ error: 'Bài viết không tồn tại' });
      }

      const userid = userResults[0].USERID;

      // Tạo thông báo
      const createNotificationQuery = 'INSERT INTO NOTIFICATION (USERID, CONTENT, REASON) VALUES (?, ?, ?)';
      connection.query(createNotificationQuery, [userid, content, reason], (error, results) => {
        if (error) {
          console.error('Lỗi khi tạo thông báo:', error);
          return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
        }
        console.log('Tạo thông báo thành công');
        return res.status(200).json({ message: 'Tạo thông báo thành công' });
      });
    });
  } catch (error) {
    console.error('Lỗi khi tạo thông báo:', error);
    return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
  }
});




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
