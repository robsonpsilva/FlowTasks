import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FlowTasks API',
      version: '1.0.0',
      description: 'Documentação da API do projeto FlowTasks',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de Desenvolvimento',
      },
    ],
  },
  // O Swagger vai buscar comentários em todos os arquivos de rota na pasta routes
  apis: ['./src/routes/*.ts'], 
};

export const swaggerSpec = swaggerJsdoc(options);