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
  user: "goodog", // Thay username bằng tên người dùng của bạn
  password: "Ptit2021", // Thay password bằng mật khẩu của bạn
  database: "CNPM", // Thay database_name bằng tên cơ sở dữ liệu của bạn
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
    if (error) {
      console.error("Error executing query", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Truy vấn thành công, trả về thông tin người dùng
    const user = results[0];
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
        console.error("Error executing SELECT query", error);
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

app.post("/api/signup", async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, phone, password } = req.body;

  try {
    // Check if the email already exists in the database
    const existingUser = await connection.query(
      "SELECT * FROM account WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      // Email already exists, return 409 Conflict status
      return res
        .status(409)
        .json({ message: "Email address is already in use" });
    }

    // Email does not exist, proceed with user registration
    await connection.query(
      "INSERT INTO account (username, email, phone, password, role) VALUES (?, ?, ?, ?, ?)",
      [username, email, phone, password, 0]
    );

    // User created successfully, return 201 Created status
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      // Handle duplicate entry error
      res.status(409).json({ message: "Email address is already in use" });
    } else {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
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
