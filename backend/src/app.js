import express from 'express';
import cors from 'cors';
import router from './routes/userRoute.js';
import morgan from 'morgan';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import studentRoute from './routes/studentRoute.js';
import authRoute from './routes/authRoutes.js';
import Nrouter from './routes/notificationRoute.js';
import bloodProgramRoute from './routes/bloodProgramRoute.js';
import bloodRegisterRoute from './routes/bloodRegisterRoute.js';
import { swaggerUi, swaggerSpec } from './swagger.js';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();   
app.set('trust proxy', 1);
// Endpoint phục vụ giao diện Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

console.log(__dirname);

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));



// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('combined'))

// Routes

app.use('/students', studentRoute);
app.use('/users', router);
app.use('/auth', authRoute);
app.use('/notifications', Nrouter);
app.use('/blood-programs', bloodProgramRoute);
app.use('/blood-registers', bloodRegisterRoute);




// Trang chủ mặc định
app.get('/', (req, res) => {
    res.json({ message: 'Chào mừng đến với API của CLB Hiến Máu!' });
});

export default app; // Xuất instance của app ra
