# Các API Cần Bổ Sung – Backend "Đi Chợ Tiện Lợi"

Tài liệu này mô tả **đầy đủ các API bổ sung**, bao gồm endpoint, method, body request và mã phản hồi để Frontend tích hợp chính xác.

---

## 1. Auth (Tài khoản)

Các API quản lý bảo mật và xác thực người dùng.

### POST `/user/change-password/`

**Mô tả**: Đổi mật khẩu người dùng.

**Body**:

```json
{
  "oldPassword": "...",
  "newPassword": "..."
}
```

**Mã phản hồi**:

* `00069`: Vui lòng cung cấp mật khẩu cũ và mới dài hơn 6 ký tự và ngắn hơn 20 ký tự.
* `00072`: Mật khẩu cũ của bạn không khớp với mật khẩu bạn nhập.
* `00073`: Mật khẩu mới của bạn không nên giống với mật khẩu cũ.
* `00076`: Mật khẩu của bạn đã được thay đổi thành công.

---

### POST `/user/verify-email/`

**Mô tả**: Xác thực email người dùng.

**Body**:

```json
{
  "code": "...",
  "token": "..."
}
```

*(hoặc email – tùy implement)*

**Mã phản hồi**:

* `00053`: Vui lòng gửi một mã xác nhận.
* `00054`: Mã bạn nhập không khớp với mã chúng tôi đã gửi.
* `00058`: Địa chỉ email của bạn đã được xác minh thành công.

---

### POST `/user/send-verification-code/`

**Mô tả**: Gửi mã xác thực email.

**Body**:

```json
{
  "email": "..."
}
```

**Mã phản hồi**:

* `00005`: Vui lòng cung cấp đầy đủ thông tin để gửi mã.
* `00048`: Mã đã được gửi đến email của bạn thành công.

---

### POST `/user/refresh-token/`

**Mô tả**: Làm mới access token bằng refresh token.

**Body**:

```json
{
  "refreshToken": "..."
}
```

**Mã phản hồi**:

* `00059`: Vui lòng cung cấp token làm mới.
* `00065`: Token đã được làm mới thành công.

---

### DELETE `/user/`

**Mô tả**: Xóa tài khoản người dùng.

**Mã phản hồi**:

* `00092`: Tài khoản của bạn đã bị xóa thành công.

---

## 2. Admin (Danh mục & Đơn vị)

Quản lý dữ liệu nền tảng của hệ thống.

### PUT `/admin/category/`

**Mô tả**: Sửa Category.

**Body**:

```json
{
  "oldName": "...",
  "newName": "..."
}
```

**Mã phản hồi**:

* `00136`: Thiếu thông tin name cũ, name mới.
* `00137`: Tên cũ trùng với tên mới.
* `00138`: Không tìm thấy category với tên cung cấp.
* `00141`: Sửa đổi category thành công.

---

### DELETE `/admin/category/`

**Mô tả**: Xóa Category.

**Body**:

```json
{
  "name": "..."
}
```

**Mã phản hồi**:

* `00142`: Thiếu thông tin tên của category.
* `00143`: Không tìm thấy category với tên cung cấp.
* `00146`: Xóa category thành công.

---

### PUT `/admin/unit/`

**Mô tả**: Sửa Unit.

**Body**:

```json
{
  "oldName": "...",
  "newName": "..."
}
```

**Mã phản hồi**:

* `00117`: Thiếu thông tin name cũ, name mới.
* `00118`: Tên cũ trùng với tên mới.
* `00122`: Sửa đổi đơn vị thành công.

---

### DELETE `/admin/unit/`

**Mô tả**: Xóa Unit.

**Body**:

```json
{
  "unitName": "..."
}
```

**Mã phản hồi**:

* `00123`: Thiếu thông tin tên của đơn vị.
* `00125`: Không tìm thấy đơn vị với tên cung cấp.
* `00128`: Xóa đơn vị thành công.

---

### GET `/admin/logs/`

**Mô tả**: Lấy log hệ thống.

**Mã phản hồi**:

* `00109`: Lấy log hệ thống thành công.

---

## 3. Food (Thực phẩm)

Quản lý món ăn chung của hệ thống / nhóm.

### PUT `/food/`

**Mô tả**: Cập nhật thực phẩm.

**Body (multipart/form-data)**:

```json
{
  "name": "...",
  "newName": "...",
  "newCategory": "...",
  "newUnit": "...",
  "image": "File"
}
```

**Mã phản hồi**:

* `00161`: Vui lòng cung cấp tất cả các trường bắt buộc.
* `00163`: Vui lòng cung cấp ít nhất một trong các trường sau (newName, newCategory, newUnit).
* `00167`: Thực phẩm với tên đã cung cấp không tồn tại.
* `00167 X`: Bạn không có quyền chỉnh sửa.

---

### DELETE `/food/`

**Mô tả**: Xóa thực phẩm.

**Body**:

```json
{
  "name": "..."
}
```

**Mã phản hồi**:

* `00179`: Vui lòng cung cấp tên thực phẩm.
* `00180`: Không tìm thấy thực phẩm với tên đã cung cấp.
* `00181`: Bạn không có quyền.
* `00184`: Xóa thực phẩm thành công.

---

## 4. Fridge (Tủ lạnh)

Quản lý thực phẩm trong tủ lạnh.

### PUT `/fridge/`

**Mô tả**: Cập nhật đồ trong tủ lạnh.

**Body**:

```json
{
  "itemId": "...",
  "newQuantity": "...",
  "newUseWithin": "..."
}
```

**Mã phản hồi**:

* `00204`: Vui lòng cung cấp id của item tủ lạnh.
* `00204 X`: Vui lòng cung cấp ít nhất một trong các trường cần update.
* `00216`: Cập nhật mục tủ lạnh thành công.

---

### GET `/fridge/:foodName/`

**Mô tả**: Lấy thông tin một món cụ thể trong tủ lạnh.

**Mã phản hồi**:

* `00237`: Lấy item cụ thể thành công.

---

## 5. Shopping List (Mua sắm)

Quản lý danh sách mua sắm và các task.

### PUT `/shopping/`

**Mô tả**: Cập nhật danh sách mua sắm.

**Body**:

```json
{
  "listId": "...",
  "newName": "..."
}
```

**Mã phản hồi**:

* `00251`: Vui lòng cung cấp id danh sách.
* `00252`: Vui lòng cung cấp ít nhất một trong những trường cần sửa.
* `00266`: Cập nhật danh sách mua sắm thành công.

---

### DELETE `/shopping/`

**Mô tả**: Xóa danh sách mua sắm.

**Body**:

```json
{
  "listId": "..."
}
```

**Mã phản hồi**:

* `00260`: Không tìm thấy danh sách mua sắm.
* `00275`: Xóa danh sách mua sắm thành công.

---

### PUT `/shopping/task/`

**Mô tả**: Cập nhật Task (ví dụ: đánh dấu đã mua).

**Body (JSON)**:

```json
{
  "taskId": "...",
  "newFoodName": "..."
}
```

**Mã phản hồi**:

* `00301`: Vui lòng cung cấp một ID nhiệm vụ.
* `00302`: Vui lòng cung cấp ít nhất một trường để sửa.
* `00312`: Cập nhật nhiệm vụ thành công.

---

### DELETE `/shopping/task/`

**Mô tả**: Xóa Task.

**Body**:

```json
{
  "taskId": "..."
}
```

**Mã phản hồi**:

* `00296`: Không tìm thấy nhiệm vụ với ID đã cung cấp.
* `00299`: Xóa nhiệm vụ thành công.

---

## 6. Meal Plan (Kế hoạch ăn uống)

### PUT `/meal/`

**Mô tả**: Cập nhật kế hoạch bữa ăn.

**Body**:

```json
{
  "planId": "...",
  "newFoodName": "...",
  "newName": "..."
}
```

**Mã phản hồi**:

* `00332`: Vui lòng cung cấp một ID kế hoạch.
* `00333`: Vui lòng cung cấp ít nhất một trong các trường cần sửa.
* `00344`: Cập nhật kế hoạch bữa ăn thành công.

---

## 7. Recipe (Công thức)

### PUT `/recipe/`

**Mô tả**: Cập nhật công thức nấu ăn.

**Body**:

```json
{
  "recipeId": "...",
  "newHtmlContent": "..."
}
```

**Mã phản hồi**:

* `00359`: Vui lòng cung cấp một ID công thức.
* `00360`: Vui lòng cung cấp ít nhất một trong các trường cần sửa.
* `00370`: Cập nhật công thức nấu ăn thành công.

---

### DELETE `/recipe/`

**Mô tả**: Xóa công thức.

**Body**:

```json
{
  "recipeId": "..."
}
```

**Mã phản hồi**:

* `00372`: Vui lòng cung cấp một ID công thức hợp lệ.
* `00373`: Không tìm thấy công thức với ID đã cung cấp.
* `00376`: Công thức của bạn đã được xóa thành công.
