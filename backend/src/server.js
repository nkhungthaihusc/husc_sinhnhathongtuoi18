import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 3000;

// Kết nối database trước rồi mới chạy server

connectDB().then(() => {
   console.log('✅ Kết nối database thành công, bắt đầu chạy server...');
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    });
});