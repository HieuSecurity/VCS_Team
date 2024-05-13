const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use;
express.static("public");
app.use("/uploads", express.static("uploads"));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root", // Thay username bằng tên người dùng của bạn
  password: "", // Thay password bằng mật khẩu của bạn
  database: "DBPT", // Thay database_name bằng tên cơ sở dữ liệu của bạn
});

// Route để xác thực người dùng

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
  limits: { fileSize: 1024 * 1024 * 10 }, // 10 MB limit
  fileFilter: fileFilter,
});

// API to upload an image
app.post("/upload", upload.single("image"), (req, res) => {
  res.json({ message: "Image uploaded successfully" });
});

// API to get an image
app.get("/image/:filename", (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.resolve(__dirname, "./uploads", filename);
  res.sendFile(imagePath);
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
    if (user.STATE === "0") {
      return res.status(403).json({ message: "Blocked account" });
    }

    // Truy vấn thành công, trả về thông tin người dùng
    res.status(200).json({ message: "Login successful", user });
  });
});


app.post("/api/create-post", upload.single("image"), (req, res) => {
  const { description, price, area, location } = req.body;

  // Assuming 'image' field is optional, check if req.file exists
  const imageUrl = req.file ? req.file.filename : null;

  // Thực hiện truy vấn INSERT vào cơ sở dữ liệu
  const insertQuery =
    "INSERT INTO newslist (description, price, area, location, image) VALUES (?, ?, ?, ?, ?)";
  connection.query(
    insertQuery,
    [description, price, area, location, imageUrl],
    (error, insertResults) => {
      if (error) {
        console.error("Error executing INSERT query", error);
        return res.status(500).json({ message: "Internal server error" });
      }

      // Nếu không có lỗi, trả về thông báo thành công và ID của bài đăng mới
      res.status(200).json({
        message: "Post created successfully",
        postId: insertResults.insertId,
      });
    }
  );
});
app.get("/api/posts", (req, res) => {
  // Thực hiện truy vấn SELECT để lấy tất cả bài đăng kèm thông tin người dùng từ bảng userinfo
  const selectQuery = `
  SELECT 
      newslist.userid,
      newslist.newsid,
      newsdetail.describe,
      newslist.price,
      newslist.acreage,
      newslist.address,
      hcmdistrict.name,
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
      newslist.description,
      newslist.price,
      newslist.area,
      newslist.location,
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
    WHERE
      newslist.location LIKE '%${selectedDistrict}%'
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
      newslist.description,
      newslist.price,
      newslist.area,
      newslist.location,
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
          [email, 1, password, 2],
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
      newslist.description,
      newslist.price,
      newslist.area,
      newslist.location,
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
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
