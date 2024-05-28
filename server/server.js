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
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
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

// API to upload an image
app.post("/upload",upload.single("image"), (req, res) => {
  res.json({ message: "Image uploaded successfully" });
});

// API to get an image
app.get("/image/:filename", (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.resolve(__dirname, "./uploads", filename);
  res.sendFile(imagePath);
});

// route to handle multiple image upload
app.post("/api/upload-multiple-images", upload.array("images", 5), (req, res) => {
  const images = req.files;

  // Check if any file is uploaded
  if (!images || images.length === 0) {
    return res.status(400).json({ message: "No images uploaded" });
  }

  // Multer to Insert each image into the database
  images.forEach((image) => {
    const insertQuery = "INSERT INTO image (NEWID, IMAGE) VALUES (?, ?)";
    connection.query(insertQuery, [req.body.newsid, images.filename], (error, results) => {
      if (error) {
        console.error("Error inserting image:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    });
  });

  res.status(200).json({ message: "Images uploaded successfully" });
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


// app.post("/api/create-post", upload.array("images", 5), (req, res) => {
//   const { title, timestart, describe, price, acreage, address, district } = req.body;
//   const imageUrl = req.file ? req.file.filename : null;

//   console.log("Received form data:", req.body);
//   console.log("Received images:", req.files);


//   connection.beginTransaction((err) => {
//     if (err) {
//       console.error("Error starting transaction", err);
//       return res.status(500).json({ message: "Internal server error" });
//     }

//     const insertNewslistQuery = 'INSERT INTO newslist (title, acreage, price, address) VALUES (?, ?, ?, ?)';
//     connection.query(insertNewslistQuery, [title, acreage, price, address], (error, newslistResults) => {
//       if (error) {
//         return connection.rollback(() => {
//           console.error("Error executing INSERT into newslist", error);
//           res.status(500).json({ message: "Internal server error" });
//         });
//       }

//       const insertNewsdetailQuery = 'INSERT INTO newsdetail (newsid, describe, timestart) VALUES (?, ?, ?)';
//       connection.query(insertNewsdetailQuery, [newslistResults.insertId, describe, timestart], (error, newsdetailResults) => {
//         if (error) {
//           return connection.rollback(() => {
//             console.error("Error executing INSERT into newsdetail", error);
//             res.status(500).json({ message: "Internal server error" });
//           });
//         }

//         const insertHcmdistrictQuery = 'INSERT INTO hcmdistrict (newsid, district) VALUES (?, ?)';
//         connection.query(insertHcmdistrictQuery, [newslistResults.insertId, district], (error, hcmdistrictResults) => {
//           if (error) {
//             return connection.rollback(() => {
//               console.error("Error executing INSERT into hcmdistrict", error);
//               res.status(500).json({ message: "Internal server error" });
//             });
//           }

//           if (imageUrl) {
//             const postId = newslistResults.insertId
//             const insertImageQuery = 'INSERT INTO image (newsid, image) VALUES (?, ?)';
//             connection.query(insertImageQuery, [postId, imageUrl], (error, imageResults) => {
//               if (error) {
//                 return connection.rollback(() => {
//                   console.error("Error executing INSERT into image", error);
//                   res.status(500).json({ message: "Internal server error" });
//                 });
//               }

//               connection.commit((err) => {
//                 if (err) {
//                   return connection.rollback(() => {
//                     console.error("Error committing transaction", err);
//                     res.status(500).json({ message: "Internal server error" });
//                   });
//                 }

//                 res.status(200).json({
//                   message: "Post created successfully",
//                   postId: newslistResults.insertId,
//                 });
//               });
//             });
//           } else {
//             connection.commit((err) => {
//               if (err) {
//                 return connection.rollback(() => {
//                   console.error("Error committing transaction", err);
//                   res.status(500).json({ message: "Internal server error" });
//                 });
//               }

//               res.status(200).json({
//                 message: "Post created successfully",
//                 postId: newslistResults.insertId,
//               });
//             });
//           }
//         });
//       });
//     });
//   });
// });

// HARD CODE phần USERID và NEWSID
app.post("/api/create-post", upload.array("images", 5), (req, res) => {
  const { title, timestart, describe, price, acreage, address, district } = req.body;
  const imageUrl = req.file ? req.file.filename : null;

  console.log("Received form data:", req.body);
  console.log("Received images:", req.files);

  const USERID = 100;
  const NEWSID = 100;
  const iddistrict = 1;

  connection.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    const insertNewslistQuery = 'INSERT INTO newslist (title, acreage, price, address, userid) VALUES (?, ?, ?, ?, ?)';
    connection.query(insertNewslistQuery, [title, acreage, price, iddistrict, USERID], (error, newslistResults) => {
      if (error) {
        return connection.rollback(() => {
          console.error("Error executing INSERT into newslist", error);
          res.status(500).json({ message: "Internal server error" });
        });
      }

      const insertNewsdetailQuery = 'INSERT INTO newsdetail (newsid, specificaddress, describe ) VALUES (?, ?, ?)';
      connection.query(insertNewsdetailQuery, [NEWSID, address, describe], (error, newsdetailResults) => {
        if (error) {
          return connection.rollback(() => {
            console.error("Error executing INSERT into newsdetail", error);
            res.status(500).json({ message: "Internal server error" });
          });
        }

        const insertHcmdistrictQuery = 'INSERT INTO hcmdistrict (newsid, iddistrict) VALUES (?, ?)';
        connection.query(insertHcmdistrictQuery, [NEWSID, district], (error, hcmdistrictResults) => {
          if (error) {
            return connection.rollback(() => {
              console.error("Error executing INSERT into hcmdistrict", error);
              res.status(500).json({ message: "Internal server error" });
            });
          }

          if (imageUrl) {
            const insertImageQuery = 'INSERT INTO image (newsid, image) VALUES (?, ?)';
            connection.query(insertImageQuery, [NEWSID, imageUrl], (error, imageResults) => {
              if (error) {
                return connection.rollback(() => {
                  console.error("Error executing INSERT into image", error);
                  res.status(500).json({ message: "Internal server error" });
                });
              }

              connection.commit((err) => {
                if (err) {
                  return connection.rollback(() => {
                    console.error("Error committing transaction", err);
                    res.status(500).json({ message: "Internal server error" });
                  });
                }

                res.status(200).json({
                  message: "Post created successfully",
                  postId: newslistResults.insertId,
                });
              });
            });
          } else {
            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  console.error("Error committing transaction", err);
                  res.status(500).json({ message: "Internal server error" });
                });
              }

              res.status(200).json({
                message: "Post created successfully",
                postId: newslistResults.insertId,
              });
            });
          }
        });
      });
    });
  });
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

app.get("/api/posts", (req, res) => {
  // Thực hiện truy vấn SELECT để lấy tất cả bài đăng kèm thông tin người dùng từ bảng userinfo
  const selectQuery = `
  SELECT 
      newslist.userid,
      newslist.newsid,
      newslist.title,
      newsdetail.describe,
      newslist.price,
      newslist.state,
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
  `;

  // Thực hiện truy vấn COUNT để tính tổng số bài đăng
  const countQuery = `SELECT COUNT(*) AS total FROM newslist`;

  // Thực hiện truy vấn để lấy số lượng kết quả
  connection.query(countQuery, (error, countResult) => {
    if (error) {
      console.error("Error counting:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    const total = countResult[0].total; // Lấy tổng số kết quả từ kết quả truy vấn COUNT

    // Thực hiện truy vấn SELECT để lấy danh sách bài đăng
    connection.query(selectQuery, (error, results) => {
      if (error) {
        console.error("Error executing SELECT query 158", error);
        return res.status(500).json({ message: "Internal server error" });
      }

      // Trả về dữ liệu và số lượng bài đăng
      res.status(200).json({ results, total });
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
  console.log(email);
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
          console.log("Status : 409");
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

                console.log("Status : 201");
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

// API lấy thông tin quản trị viên
app.get('/api/admin-info', (req, res) => {
  const query = 'SELECT * FROM admininfo';

  connection.query(query, (err, results) => {
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

// API to fetch all payments
app.get("/api/payment", (req, res) => {
  const query = "SELECT * FROM payment";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching payments:", err);
      res.status(500).json({ message: "Failed to fetch payments" });
      return;
    }
    res.status(200).json(results);
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
