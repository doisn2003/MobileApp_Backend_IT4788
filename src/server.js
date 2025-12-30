const path = require('path'); 
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const app = express();
const connectDB = require('./configs/db');
const authRoute = require('./routes/auth.route');
const PORT = process.env.PORT || 5000;

// 1. Connect DB
connectDB();

// 2. Middleware xử lý Body (CỰC KỲ QUAN TRỌNG)
// Để đọc được Content-Type: application/x-www-form-urlencoded (như đề yêu cầu)
app.use(express.urlencoded({ extended: true })); 
// Để đọc được JSON (dùng cho API create task sau này)
app.use(express.json());

// 3. Routes
// Đề bài yêu cầu đường dẫn cơ sở: https://ABC.def/it4788/ 
// Và Login là: /it4788/login (thực tế trong bảng là user/login)
// Nên ta sẽ mount như sau:
app.use('/it4788/user', authRoute); 

// Route test server
app.get('/', (req, res) => {
    res.send('Server IT4788 is running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
});
