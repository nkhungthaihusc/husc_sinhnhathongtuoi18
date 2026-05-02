import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CLB Hiến Máu API',
      version: '1.0.0',
      description: 'API cho dự án CLB Hiến Máu',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  // Sử dụng đường dẫn tuyệt đối tới các route trong thư mục src/routes
  apis: [path.join(__dirname, 'routes', '*.js')],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
