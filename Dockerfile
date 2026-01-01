# Sử dụng Node.js phiên bản LTS trên nền Alpine Linux (nhẹ nhất)
FROM node:22-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy file package.json và package-lock.json trước
# (Để tận dụng Docker layer caching, giúp build nhanh hơn nếu không đổi thư viện)
COPY package*.json ./

# Cài đặt dependencies (dùng --production để bỏ qua devDependencies)
RUN npm install --production

# Copy toàn bộ code nguồn vào container
COPY . .

# Mở port mà app sẽ chạy (khớp với internal_port của Fly)
EXPOSE 3000

# Lệnh khởi động app (thường là node index.js hoặc npm start)
CMD ["npm", "run", "dev"]