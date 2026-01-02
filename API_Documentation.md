# Tài liệu API - Server Đi Chợ Tiện Lợi (IT4788)

Tài liệu hướng dẫn tích hợp API cho đội ngũ Frontend.

**Base URL**: `http://localhost:3000/it4788`

**Authentication**:
Hầu hết các API yêu cầu xác thực qua Header:
`Authorization: Bearer <token>`

---

## 📚 Mục lục (Table of Contents)

1. [Authentication (Tài khoản)](#1-authentication-tài-khoản)
2. [Group (Quản lý Nhóm)](#2-group-quản-lý-nhóm)
3. [Admin: Category & Unit](#3-admin-category--unit)
4. [Food (Thực phẩm)](#4-food-thực-phẩm)
5. [Fridge (Tủ lạnh)](#5-fridge-tủ-lạnh)
6. [Shopping List (Mua sắm)](#6-shopping-list-mua-sắm)
7. [Meal Plan (Kế hoạch ăn uống)](#7-meal-plan-kế-hoạch-ăn-uống)
8. [Recipe (Công thức)](#8-recipe-công-thức)

---

## 1. Authentication (Tài khoản)

### 1.1 Đăng ký (Register)
* **URL**: `/user/`
* **Method**: `POST`
* **Content-Type**: `x-www-form-urlencoded`
* **Auth**: Không yêu cầu
* **Body**:
  * `username`: (string) nguyenvanA
  * `email`: (string) a@gmail.com
  * `password`: (string) password123
  * `name`: (string) Nguyen Van A
  * `language`: (string) vi
  * `timezone`: (string) GMT+7
  * `deviceId`: (string) xxx
* **Response**: `201 Created`
  ```json
  {
    "code": "00035",
    "message": "Bạn đã đăng ký thành công.",
    "data": { ... }
  }
  ```

### 1.2 Đăng nhập (Login)
* **URL**: `/user/login`
* **Method**: `POST`
* **Content-Type**: `x-www-form-urlencoded`
* **Body**:
  * `email`: (string) a@gmail.com
  * `password`: (string) password123
* **Response**: `200 OK`
  ```json
  {
    "code": "00047",
    "message": "Bạn đã đăng nhập thành công.",
    "data": { "token": "...", "user": { ... } }
  }
  ```

### 1.3 Lấy thông tin cá nhân (Get Me)
* **URL**: `/user/`
* **Method**: `GET`
* **Auth**: `Bearer Token`
* **Response**: `200 OK`

### 1.4 Chỉnh sửa thông tin (Edit Profile)
* **URL**: `/user/edit`
* **Method**: `POST`
* **Content-Type**: `x-www-form-urlencoded`
* **Auth**: `Bearer Token`
* **Body**:
  * `name`: (string) Tên Mới
  * `avatar`: (string) url_anh_moi
  * `language`: (string) en
* **Response**: `200 OK`

### 1.5 Đăng xuất (Logout)
* **URL**: `/user/logout`
* **Method**: `POST`
* **Auth**: `Bearer Token`
* **Response**: `200 OK`

### 1.6 Quên mật khẩu
* **URL**: `/user/forgot-password`
* **Method**: `POST`
* **Content-Type**: `x-www-form-urlencoded`
* **Body**:
  * `email`: (string) a@gmail.com
* **Response**: `200 OK`

### 1.7 Đổi mật khẩu
* **URL**: `/user/change-password`
* **Method**: `POST`
* **Content-Type**: `raw (JSON)`
* **Auth**: `Bearer Token`
* **Body**:
  ```json
  { "oldPassword": "...", "newPassword": "..." }
  ```
* **Response**: `200 OK`

### 1.8 Gửi mã xác thực Email
* **URL**: `/user/send-verification-code`
* **Method**: `POST`
* **Content-Type**: `raw (JSON)`
* **Body**: `{ "email": "..." }`
* **Response**: `200 OK`

### 1.9 Xác thực Email
* **URL**: `/user/verify-email`
* **Method**: `POST`
* **Content-Type**: `raw (JSON)`
* **Body**: `{ "code": "...", "token": "..." }`
* **Response**: `200 OK`

### 1.10 Refresh Token
* **URL**: `/user/refresh-token`
* **Method**: `POST`
* **Content-Type**: `raw (JSON)`
* **Body**: `{ "refreshToken": "..." }`
* **Response**: `200 OK`

### 1.11 Xóa tài khoản
* **URL**: `/user/`
* **Method**: `DELETE`
* **Auth**: `Bearer Token`
* **Response**: `200 OK`

---

## 2. Group (Quản lý Nhóm)

### 2.1 Tạo nhóm mới
* **URL**: `/user/group/`
* **Method**: `POST`
* **Auth**: `Bearer Token`
* **Body**: (Empty)
* **Response**: `200 OK`

### 2.2 Thêm thành viên
* **URL**: `/user/group/add`
* **Method**: `POST`
* **Content-Type**: `raw (JSON)`
* **Auth**: `Bearer Token` (Admin)
* **Body**:
  ```json
  { "username": "nguyenvanB" }
  ```
* **Response**: `200 OK`

### 2.3 Xem danh sách thành viên
* **URL**: `/user/group/`
* **Method**: `GET`
* **Auth**: `Bearer Token`
* **Response**: `200 OK`

### 2.4 Xóa thành viên
* **URL**: `/user/group/remove`
* **Method**: `POST`
* **Content-Type**: `raw (JSON)`
* **Auth**: `Bearer Token` (Admin)
* **Body**:
  ```json
  { "memberId": "ObjectId_Here" }
  ```
* **Response**: `200 OK`

### 2.5 Xóa nhóm (Giải tán)
* **URL**: `/user/group/`
* **Method**: `DELETE`
* **Auth**: `Bearer Token` (Admin)
* **Response**: `200 OK`

---

## 3. Admin: Category & Unit

### 3.1 Category (Danh mục món ăn)
* **URL**: `/admin/category`
* **GET**: Lấy danh sách.
* **POST**: Tạo mới.
  * **Content-Type**: `raw (JSON)`
  * **Body**:
    ```json
    { "name": "Thịt" }
    ```
  * **Response**: `200 OK`

### 3.2 Unit (Đơn vị tính)
* **URL**: `/admin/unit`
* **GET**: Lấy danh sách.
* **POST**: Tạo mới.
  * **Content-Type**: `raw (JSON)`
  * **Body**:
    ```json
    { "unitName": "Kilogam" }
    ```
  * **Response**: `200 OK`

### 3.3 Sửa Category
* **URL**: `/admin/category`
* **Method**: `PUT`
* **Content-Type**: `raw (JSON)`
* **Body**:
  ```json
  { "oldName": "...", "newName": "..." }
  ```
* **Response**: `200 OK`

### 3.4 Xóa Category
* **URL**: `/admin/category`
* **Method**: `DELETE`
* **Content-Type**: `raw (JSON)`
* **Body**: `{ "name": "..." }`
* **Response**: `200 OK`

### 3.5 Sửa Unit
* **URL**: `/admin/unit`
* **Method**: `PUT`
* **Content-Type**: `raw (JSON)`
* **Body**:
  ```json
  { "oldName": "...", "newName": "..." }
  ```
* **Response**: `200 OK`

### 3.6 Xóa Unit
* **URL**: `/admin/unit`
* **Method**: `DELETE`
* **Content-Type**: `raw (JSON)`
* **Body**: `{ "unitName": "..." }`
* **Response**: `200 OK`

### 3.7 Lấy Logs
* **URL**: `/admin/logs`
* **Method**: `GET`
* **Response**: `200 OK`

---

## 4. Food (Thực phẩm)

### 4.1 Lấy danh sách thực phẩm
* **URL**: `/food/`
* **Method**: `GET`
* **Auth**: `Bearer Token`
* **Response**: `200 OK`

### 4.2 Tạo thực phẩm mới
* **URL**: `/food/`
* **Method**: `POST`
* **Content-Type**: `form-data`
* **Auth**: `Bearer Token`
* **Body**:
  * `name`: (Text) Thịt bò
  * `foodCategoryName`: (Text) Thịt
  * `unitName`: (Text) kg
  * `image`: (File) [File ảnh]
* **Response**: `200 OK`

### 4.3 Cập nhật thực phẩm
* **URL**: `/food/`
* **Method**: `PUT`
* **Content-Type**: `multipart/form-data`
* **Auth**: `Bearer Token`
* **Body**:
  * `name`: (Text) - Tên món cũ để tìm
  * `newName`: (Text) - Tên mới (Optional)
  * `newCategory`: (Text) - (Optional)
  * `newUnit`: (Text) - (Optional)
  * `image`: (File) - (Optional)
* **Response**: `200 OK`

### 4.4 Xóa thực phẩm
* **URL**: `/food/`
* **Method**: `DELETE`
* **Content-Type**: `raw (JSON)`
* **Auth**: `Bearer Token`
* **Body**: `{ "name": "..." }`
* **Response**: `200 OK`

---

## 5. Fridge (Tủ lạnh)

### 5.1 Xem đồ trong tủ
* **URL**: `/fridge/`
* **Method**: `GET`
* **Auth**: `Bearer Token`
* **Response**: `200 OK`

### 5.2 Thêm đồ vào tủ
* **URL**: `/fridge/`
* **Method**: `POST`
* **Content-Type**: `raw (JSON)`
* **Auth**: `Bearer Token`
* **Body**:
  ```json
  {
    "foodName": "Thịt bò",
    "quantity": 2,
    "useWithin": "2024-12-31",
    "note": "Mua ở siêu thị A"
  }
  ```
* **Response**: `200 OK`

### 5.3 Xóa đồ khỏi tủ
* **URL**: `/fridge/`
* **Method**: `DELETE`
* **Content-Type**: `raw (JSON)`
* **Auth**: `Bearer Token`
* **Body**:
  ```json
  { "foodName": "Thịt bò" }
  ```
* **Response**: `200 OK`

### 5.4 Cập nhật đồ trong tủ
* **URL**: `/fridge/`
* **Method**: `PUT`
* **Content-Type**: `raw (JSON)`
* **Body**:
  ```json
  {
    "itemId": "...",
    "newQuantity": 3,
    "newUseWithin": "2024-12-31"
  }
  ```
* **Response**: `200 OK`

### 5.5 Lấy chi tiết món trong tủ
* **URL**: `/fridge/:foodName`
* **Method**: `GET`
* **Response**: `200 OK`

---

## 6. Shopping List (Mua sắm)

### 6.1 Lấy danh sách các chuyến đi
* **URL**: `/shopping/`
* **Method**: `GET`
* **Auth**: `Bearer Token`
* **Response**: `200 OK`

### 6.2 Tạo danh sách mua sắm
* **URL**: `/shopping/`
* **Method**: `POST`
* **Content-Type**: `raw (JSON)`
* **Body**:
  ```json
  {
    "name": "Đi chợ cuối tuần",
    "date": "2024-10-20",
    "assignToUsername": "nguyenvanB",
    "note": "Mua gấp"
  }
  ```

### 6.3 Lấy chi tiết Task trong List
* **URL**: `/shopping/task?listId={ID_LIST}`
* **Method**: `GET`
* **Response**: `200 OK`

### 6.4 Thêm Task vào List
* **URL**: `/shopping/task`
* **Method**: `POST`
* **Content-Type**: `raw (JSON)`
* **Body**:
  ```json
  {
    "listId": "60d0fe4f5311236168a109ca",
    "tasks": [
      { "foodName": "Thịt bò", "quantity": "1" },
      { "foodName": "Rau cải", "quantity": "2" }
    ]
  }
  ```

### 6.5 Cập nhật danh sách mua sắm
* **URL**: `/shopping/`
* **Method**: `PUT`
* **Content-Type**: `raw (JSON)`
* **Body**: `{ "listId": "...", "newName": "..." }`
* **Response**: `200 OK`

### 6.6 Xóa danh sách mua sắm
* **URL**: `/shopping/`
* **Method**: `DELETE`
* **Content-Type**: `raw (JSON)`
* **Body**: `{ "listId": "..." }`
* **Response**: `200 OK`

### 6.7 Cập nhật Task
* **URL**: `/shopping/task`
* **Method**: `PUT`
* **Content-Type**: `raw (JSON)`
* **Body**: `{ "taskId": "...", "newFoodName": "..." }`
* **Response**: `200 OK`

### 6.8 Xóa Task
* **URL**: `/shopping/task`
* **Method**: `DELETE`
* **Content-Type**: `raw (JSON)`
* **Body**: `{ "taskId": "..." }`
* **Response**: `200 OK`

---

## 7. Meal Plan (Kế hoạch ăn uống)

### 7.1 Lấy thực đơn theo ngày
* **URL**: `/meal?date=YYYY-MM-DD`
* **Method**: `GET`

### 7.2 Tạo thực đơn
* **URL**: `/meal/`
* **Method**: `POST`
* **Content-Type**: `raw (JSON)`
* **Body**:
  ```json
  {
    "date": "2024-10-20",
    "mealType": "Lunch",
    "foodName": "Thịt kho tàu"
  }
  ```

### 7.3 Xóa thực đơn
* **URL**: `/meal/`
* **Method**: `DELETE`
* **Content-Type**: `raw (JSON)`
* **Body**:
  ```json
  { "planId": "..." }
  ```

### 7.4 Cập nhật thực đơn
* **URL**: `/meal/`
* **Method**: `PUT`
* **Content-Type**: `raw (JSON)`
* **Body**:
  ```json
  {
    "planId": "...",
    "newFoodName": "Thịt gà",
    "newName": "Tối"
  }
  ```
* **Response**: `200 OK`
  ```

---

## 8. Recipe (Công thức)

### 8.1 Lấy công thức của món ăn
* **URL**: `/recipe?foodName=...`
* **Method**: `GET`

### 8.2 Tạo công thức
* **URL**: `/recipe`
* **Method**: `POST`
* **Content-Type**: `raw (JSON)`
* **Body**:
  ```json
  {
    "foodName": "Thịt kho tàu",
    "name": "Thịt kho tàu miền Bắc",
    "description": "Món ăn ngon...",
    "htmlContent": "<h1>Cách làm...</h1> <p>Bước 1...</p>"
  }
  ```

### 8.3 Cập nhật công thức
* **URL**: `/recipe`
* **Method**: `PUT`
* **Content-Type**: `raw (JSON)`
* **Body**:
  ```json
  {
    "recipeId": "...",
    "newHtmlContent": "...",
    "newName": "...",
    "newDescription": "..."
  }
  ```
* **Response**: `200 OK`

### 8.4 Xóa công thức
* **URL**: `/recipe`
* **Method**: `DELETE`
* **Content-Type**: `raw (JSON)`
* **Body**: `{ "recipeId": "..." }`
* **Response**: `200 OK`

---

## 9. Notification (Thông báo - Kiểm thử)

### 9.1 Test Gửi thông báo đến thiết bị (FCM)
* **URL**: `/notification/send`
* **Method**: `POST`
* **Content-Type**: `raw (JSON)`
* **Body**:
  ```json
  {
    "tokens": ["YOUR_FCM_TOKEN_HERE"],
    "title": "Test Notification",
    "body": "Hello from Postman",
    "data": { "type": "TEST" }
  }
  ```
* **Response**: `200 OK`

### 9.2 Test Gửi thông báo Chat
* **URL**: `/notification/chat-test`
* **Method**: `POST`
* **Content-Type**: `raw (JSON)`
* **Body**:
  ```json
  {
    "senderId": "SENDER_USER_ID",
    "groupMembersIds": ["RECEIVER_ID_1", "RECEIVER_ID_2"],
    "groupName": "Test Group",
    "messageContent": "New Message Content"
  }
  ```
* **Response**: `200 OK`

