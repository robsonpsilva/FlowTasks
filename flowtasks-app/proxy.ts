// middleware.ts
import { auth } from "@/auth"; 

export default auth; // Ele usará o callback 'authorized' que você já definiu no auth.ts

export const config = {
  // Protege tudo, exceto as rotas internas do Next, imagens e o próprio login
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};