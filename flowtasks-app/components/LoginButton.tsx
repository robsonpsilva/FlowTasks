'use client';

import { useState } from 'react';

export default function LoginButton() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // 1. Simulação: Aqui você integraria com o 'google-one-tap' ou 'next-auth/react'
      // Para fins didáticos, vamos supor que o Google retornou o perfil:
      const googleProfile = {
        external_uid: 'google_12345',
        email: 'robson@petrobras.com',
        name: 'Robson Silva',
        provider_id: 1 // ID do Google no seu banco
      };

      // 2. Envia para o SEU Backend para validar e ganhar o JWT
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleProfile),
      });

      const data = await response.json();

      if (data.token) {
        // 3. SALVA O JWT NO LOCALSTORAGE
        localStorage.setItem('flowtasks_token', data.token);
        localStorage.setItem('user_profile', JSON.stringify(data.user));
        
        alert(`Bem-vindo, ${data.user.name}! Você é um ${data.user.role_name}`);
        
        // Redireciona para o Dashboard
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleGoogleLogin}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded shadow"
    >
      {loading ? 'Autenticando...' : 'Entrar com Google'}
    </button>
  );
}