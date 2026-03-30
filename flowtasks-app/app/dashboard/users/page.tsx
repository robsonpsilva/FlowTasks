"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CreateAccountFlow from "@/app/ui/components/auth/CreateAccountFlow";

export default function UserManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; userId: string | null }>({ show: false, userId: null });
  const [banner, setBanner] = useState({ show: false, msg: "", type: "success" as "success" | "error" });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session && session.user.role?.toUpperCase() !== "ADMIN") router.push("/home");
    else if (session) fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      // Garantimos que não haja duplicatas limpando o estado antes de setar
      setUsers(data);
    } catch (err) {
      showBanner("Error loading users", "error");
    } finally {
      setLoading(false);
    }
  };

  const showBanner = (msg: string, type: "success" | "error") => {
    setBanner({ show: true, msg, type });
    setTimeout(() => setBanner(prev => ({ ...prev, show: false })), 3000);
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.userId;
    if (!id) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        // Filtro imediato no estado local
        setUsers(prev => prev.filter(u => u.id !== id));
        showBanner("User and all dependencies deleted!", "success");
      } else {
        const err = await res.json();
        showBanner(err.details || "Check database constraints.", "error");
      }
    } catch (err) {
      showBanner("Network failure", "error");
    } finally {
      setDeleteConfirm({ show: false, userId: null });
    }
  };

  if (loading) return <div className="p-8 text-white font-mono animate-pulse">Loading secure data...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto relative min-h-screen">
      
      {/* Banner */}
      {banner.show && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl border animate-in slide-in-from-top ${banner.type === "success" ? "bg-green-500/90 border-green-400 text-white" : "bg-red-500/90 border-red-400 text-white"}`}>
          {banner.msg}
        </div>
      )}

      {/* Modal Deletar */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-[#1f2937] border border-gray-700 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-white mb-2">Are you sure?</h3>
            <p className="text-gray-400 mb-6 text-sm">This will remove all tasks and roles associated with this user.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm({ show: false, userId: null })} className="flex-1 py-3 bg-gray-700 text-white rounded-xl">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500">Delete All</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
        <button onClick={() => { setEditingUser(null); setShowForm(true); }} className="bg-sky-500 hover:bg-sky-400 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg">
          + New User
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-[#111827] p-8 rounded-3xl border border-gray-700 w-full max-w-md relative shadow-2xl">
             <button onClick={() => setShowForm(false)} className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors">✕</button>
             <CreateAccountFlow 
                onBack={() => { setShowForm(false); fetchUsers(); }} 
                userToEdit={editingUser} 
             />
          </div>
        </div>
      )}

      <div className="bg-[#1f2937] rounded-3xl overflow-hidden border border-gray-700 shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-widest">
            <tr>
              <th className="px-6 py-5">User Details</th>
              <th className="px-6 py-5 w-[120px] text-center">Role</th>
              <th className="px-6 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-white">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block w-full text-center px-2 py-1 bg-sky-500/10 text-sky-400 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-sky-500/20">
                    {user.role_name || "MEMBER"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center space-x-6">
                  <button onClick={() => { setEditingUser(user); setShowForm(true); }} className="text-yellow-500 hover:text-yellow-400 font-bold text-sm underline-offset-4 hover:underline">Edit</button>
                  <button onClick={() => setDeleteConfirm({ show: true, userId: user.id })} className="text-red-500 hover:text-red-400 font-bold text-sm underline-offset-4 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}