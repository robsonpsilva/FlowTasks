"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CreateAccountFlow from "@/app/ui/components/auth/CreateAccountFlow";

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

  // NOVO: Estado para controle do Modal de Deleção
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; userId: string | null }>({
    show: false,
    userId: null,
  });

  const [banner, setBanner] = useState<{ show: boolean; msg: string; type: "success" | "error" }>({
    show: false,
    msg: "",
    type: "success",
  });

  useEffect(() => {
    if (banner.show) {
      const timer = setTimeout(() => {
        setBanner((prev) => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [banner.show]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session && session.user.role?.toUpperCase() !== "ADMIN") {
      router.push("/home");
    } else if (session) {
      fetchUsers();
    }
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setBanner({ show: true, msg: "Error loading users.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Ajustado para apenas abrir o modal
  const openDeleteModal = (id: string) => {
    setDeleteConfirm({ show: true, userId: id });
  };

  // Função que executa a deleção real
  const confirmDelete = async () => {
    const id = deleteConfirm.userId;
    if (!id) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== id));
        setBanner({ show: true, msg: "User deleted successfully!", type: "success" });
      } else {
        setBanner({ show: true, msg: "Failed to delete user.", type: "error" });
      }
    } catch (err) {
      setBanner({ show: true, msg: "Network error occurred.", type: "error" });
    } finally {
      setDeleteConfirm({ show: false, userId: null });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  if (loading) return <div className="p-8 text-white">Loading users...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto relative">
      
      {/* Banner de Notificação */}
      {banner.show && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-11/12 max-w-md p-4 rounded-xl shadow-2xl border-2 animate-in slide-in-from-top duration-500 ${
          banner.type === "success" 
            ? "bg-green-900/90 border-green-500 text-green-100" 
            : "bg-red-900/90 border-red-500 text-red-100"
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">{banner.type === "success" ? "✅" : "⚠️"}</span>
            <p className="font-bold text-sm">{banner.msg}</p>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE DELEÇÃO (Elegante) */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
          <div className="bg-[#1f2937] border border-gray-700 p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl">
              🗑️
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Confirm Deletion</h3>
              <p className="text-gray-400 mt-2">Are you sure you want to delete this user? This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirm({ show: false, userId: null })}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resto do seu código (Header, Tabela, Modal de Form) */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <button 
          onClick={() => { setEditingUser(null); setShowForm(true); }}
          className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-bold transition-all"
        >
          + New User
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] p-8 rounded-2xl border border-gray-700 w-full max-w-md relative">
             <button 
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
             >✕</button>
             
             <CreateAccountFlow 
                onBack={() => { 
                  setShowForm(false); 
                  fetchUsers();
                }} 
                userToEdit={editingUser} 
             />
          </div>
        </div>
      )}

      <div className="bg-[#1f2937] rounded-xl overflow-hidden border border-gray-700 shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-800 text-gray-400 text-sm uppercase">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4 w-[100px] text-center">Role</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-white divide-y divide-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 font-medium">{user.name}</td>
                <td className="px-6 py-4 text-gray-400">{user.email}</td>
                <td className="px-6 py-4">
                  <span className="inline-block w-[80px] text-center px-2 py-1 bg-sky-500/20 text-sky-400 rounded text-xs font-bold uppercase tracking-wider">
                    {user.role_name?.substring(0, 6) || "MEMBER"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center space-x-4">
                  <button onClick={() => handleEdit(user)} className="text-yellow-500 hover:text-yellow-400 font-bold transition-colors">Edit</button>
                  {/* Atualizado para chamar o modal customizado */}
                  <button onClick={() => openDeleteModal(user.id)} className="text-red-500 hover:text-red-400 font-bold transition-colors">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}