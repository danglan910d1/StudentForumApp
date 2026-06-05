# Stage 1: Build environment
FROM node:20-alpine AS builder

# Thiết lập thư mục làm việc trong container
WORKDIR /usr/src/app

# Copy package.json và package-lock.json trước để tận dụng cache của Docker
COPY package*.json ./

# Cài đặt toàn bộ dependencies (Thêm --legacy-peer-deps để sửa lỗi ERESOLVE xung đột phiên bản của cloudinary)
RUN npm install --legacy-peer-deps

# Copy toàn bộ mã nguồn vào container
COPY . .

# Build mã nguồn TypeScript (.ts) sang JavaScript (.js)
RUN npm run build

# Stage 2: Production environment
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json và package-lock.json
COPY package*.json ./

# Chỉ cài đặt các dependencies cần thiết cho production
RUN npm install --only=production --legacy-peer-deps

# Copy mã nguồn đã được build từ stage builder sang
COPY --from=builder /usr/src/app/dist ./dist

# Copy thư mục uploads nếu có lưu trữ file tĩnh
COPY --from=builder /usr/src/app/uploads ./uploads

# Expose port (Dựa theo cấu hình PORT=5000 trong .env của bạn)
EXPOSE 5000

# Khởi chạy ứng dụng
CMD ["npm", "start"]
