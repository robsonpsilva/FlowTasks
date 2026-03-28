import Sidebar from "../ui/Sidebar";
export const experimental_ppr = true;

export default function Layout({ children }: { children: React.ReactNode }) {
return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_#004e89_0%,_#1A659E_45%,_#F7C59F_100%)] text-white md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
            <Sidebar />
        </div>
        <div className="flex-1 h-screen overflow-y-auto p-6 md:p-12">{children}</div>
    </div>
);
}