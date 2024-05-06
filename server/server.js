const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const { check, validationResult } = require("express-validator");
const app = express();
const PORT = process.env.PORT || 3000;
const images = [];
app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
  host: "localhost",
  user: "goodog", // Thay username bằng tên người dùng của bạn
  password: "Ptit2021", // Thay password bằng mật khẩu của bạn
  database: "CNPM", // Thay database_name bằng tên cơ sở dữ liệu của bạn
});

// Route để xác thực người dùng
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
app.post("/api/create-post", (req, res) => {
  const { description, price, area, location } = req.body;

  // Thực hiện truy vấn INSERT vào cơ sở dữ liệu
  const insertQuery =
    "INSERT INTO newslist (description, price, area, location) VALUES (?, ?, ?, ?)";
  connection.query(
    insertQuery,
    [description, price, area, location],
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
      newslist.newsid,
      newslist.userid,
      newslist.description,
      newslist.price,
      newslist.area,
      newslist.location,
      userinfo.name,
      userinfo.phone,
      userinfo.avatar
    FROM 
      newslist
    LEFT JOIN 
      userinfo ON newslist.userid = userinfo.userid
  `;

  connection.query(selectQuery, (error, results) => {
    if (error) {
      console.error("Error executing SELECT query", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    // Trả về kết quả dưới dạng JSON nếu không có lỗi
    res.status(200).json(results);
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
