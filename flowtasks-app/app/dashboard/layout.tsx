import Sidebar from "../ui/Sidebar";
export const experimental_ppr = true;

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[radial-gradient(circle_at_top,_#004e89_0%,_#1A659E_45%,_#F7C59F_100%)] text-white overflow-hidden">
      <div className="w-20 md:w-64 flex-none">
        <Sidebar />
      </div>

      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}