import Sidebar from "./common/app-sidebar";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6 rounded-2xl">
        {children}
      </main>
    </div>
  );
}
