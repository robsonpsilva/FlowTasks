// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"; // Importa do arquivo que você criou no Passo 1
export const { GET, POST } = handlers;