import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api', // Onde o Swagger vai procurar os comentários JSDoc
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'FlowTasks API Documentation',
        version: '1.0.0',
        description: 'API for managing tasks and users in the FlowTasks ecosystem',
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [],
    },
  });
  return spec;
};