import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { 
  getProviders, 
  createProvider, 
  updateProvider, 
  deleteProvider 
} from './controllers/authProviderController';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration: Allows your Next.js frontend to access the API
app.use(cors({
  origin: 'http://localhost:3000' // Replace with your Next.js URL/Port
}));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'FlowTasks API', version: '1.0.0' },
  },
  apis: ['./src/routes/*.ts'], // O Swagger lerá seus arquivos de rotas
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());

// Routes
app.get('/api/auth-providers', getProviders);
app.post('/api/auth-providers', createProvider);
app.put('/api/auth-providers/:id', updateProvider);
app.delete('/api/auth-providers/:id', deleteProvider);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});