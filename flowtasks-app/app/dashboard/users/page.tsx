"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CreateAccountFlow from "@/app/ui/components/auth/CreateAccountFlow"; // Seu componente de formulário

interface User {
  id: string;
  name: string;
  email: string;
  role_name?: string;
}

export default function UserManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);

  // 1. Proteção de Rota (Apenas ADMIN)
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session && session.user.role?.toUpperCase() !== "ADMIN") {
      router.push("/home");
    } else if (session) {
      fetchUsers();
    }
  }, [session, status]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== id));
      } else {
        alert("Erro ao excluir usuário.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  if (loading) return <div className="p-8 text-white">Carregando usuários...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <button 
          onClick={() => { setEditingUser(null); setShowForm(true); }}
          className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-bold"
        >
          + New User
        </button>
      </div>

      {/* Modal para Criar/Editar (Reutilizando seu CreateAccountFlow) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] p-8 rounded-2xl border border-gray-700 w-full max-w-md relative">
             <button 
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
             >✕</button>
             
             {/* Passamos o editingUser para o formulário saber que é edição */}
             <CreateAccountFlow 
                onBack={() => { setShowForm(false); fetchUsers(); }} 
                userToEdit={editingUser} 
             />
          </div>
        </div>
      )}

      {/* Tabela de Usuários */}
      <div className="bg-[#1f2937] rounded-xl overflow-hidden border border-gray-700">
        <table className="w-full text-left">
          <thead className="bg-gray-800 text-gray-400 text-sm uppercase">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-white divide-y divide-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 font-medium">{user.name}</td>
                <td className="px-6 py-4 text-gray-400">{user.email}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-sky-500/20 text-sky-400 rounded text-xs font-bold">
                    {user.role_name || "MEMBER"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center space-x-3">
                  <button onClick={() => handleEdit(user)} className="text-yellow-500 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}