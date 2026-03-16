import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import userRoutes from './routes/userRoutes';
import roleRoutes from './routes/roleRoutes';
// Import your authProvider routes here if you moved them to a file
import authProviderRoutes from './routes/authProviderRoutes'; 

const app = express();
const PORT = process.env.PORT || 3001;

// 1. MIDDLEWARE FIRST: Parse JSON and CORS
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json()); 

// 2. SWAGGER CONFIGURATION
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'FlowTasks API', version: '1.0.0' },
  },
  apis: ['./src/routes/*.ts'], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 3. ROUTES
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/auth-providers', authProviderRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});