import { getApiDocs } from '@/app/lib/swagger';
import ReactSwagger from './react-swagger';

export default async function IndexPage() {
  // O spec vem como 'object' da lib, mas o componente quer 'Record<string, unknown>'
  const spec = await getApiDocs();

  return (
    <section className="container">
      {/* Fazemos o cast aqui para satisfazer o contrato do componente */}
      <ReactSwagger spec={spec as Record<string, unknown>} />
    </section>
  );
}