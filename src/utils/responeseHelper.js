// Hàm trả về response chuẩn theo format đề bài
const sendResponse = (res, status, code, message, data = null) => {
    const response = {
        code: code,
        message: message
    };
    if (data) {
        response.data = data;
    }
    return res.status(status).json(response);
};

module.exports = sendResponse;