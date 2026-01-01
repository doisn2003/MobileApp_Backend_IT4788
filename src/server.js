const path = require('path'); 
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const app = express();
const cors = require('cors');
const connectDB = require('./configs/db');
const authRoute = require('./routes/auth.route');
const groupRoutes = require('./routes/group.route');
const adminRoutes = require('./routes/admin.route');
const foodRoutes = require('./routes/food.route');
const fridgeRoutes = require('./routes/fridge.route');
const shoppingRoutes = require('./routes/shopping.route');
const recipeRoutes = require('./routes/recipe.route');
const mealRoutes = require('./routes/meal.route');
const PORT = process.env.PORT || 5000;

// 1. Connect DB
connectDB();
// --- TỰ ĐỘNG TẠO THƯ MỤC UPLOADS NẾU CHƯA CÓ ---
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created uploads directory');
}

// 2. Middleware xử lý Body
app.use(cors());
// Để đọc được Content-Type: application/x-www-form-urlencoded (như đề yêu cầu)
app.use(express.urlencoded({ extended: true })); 
// Để đọc được JSON (dùng cho API create task sau này)
app.use(express.json());
// Public thư mục uploads để xem ảnh
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Dùng path.join cho an toàn

// 3. Routes
// Đề bài yêu cầu đường dẫn cơ sở: https://ABC.def/it4788/ 
// Và Login là: /it4788/login (thực tế trong bảng là user/login)
// Nên ta sẽ mount như sau:
app.use('/it4788/user', authRoute); 
app.use('/it4788/user/group', groupRoutes);
app.use('/it4788/admin', adminRoutes);
app.use('/it4788/food', foodRoutes);
app.use('/it4788/fridge', fridgeRoutes);
app.use('/it4788/shopping', shoppingRoutes);
app.use('/it4788/recipe', recipeRoutes);
app.use('/it4788/meal', mealRoutes);
// Route test server
app.get('/', (req, res) => {
    res.send('Server IT4788 is running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
});
