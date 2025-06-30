import AddRoom from "./pages/AddRoom";
import AddService from "./pages/AddService";
import { useState } from "react";

const DashboardView = () => {
  const [active, setActive] = useState("Dashboard");

    const menuItems = [
        { name: "Dashboard", icon: <i className="fas fa-tachometer-alt"></i> },
        { name: "Add Room", icon: <i className="fas fa-plus"></i> },
        { name: "Add Service", icon: <i className="fas fa-users"></i> },
    ];

  const renderContent = () => {
    switch (active) {
      case "Add Room":
        return <AddRoom />;
      case "Add Service":
        return <AddService />;
      case "Dashboard":
      default:
        return <div>Dashboard Content</div>;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-purple-700 to-purple-900 text-white shadow-lg">
        <div className="p-6 text-2xl font-bold tracking-wide border-b border-white/10">
          Admin Panel
        </div>
        <nav className="mt-6">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li
                key={item.name}
                className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-all duration-200 ${
                  active === item.name
                    ? "bg-white/10 text-white font-semibold"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
                onClick={() => setActive(item.name)}
              >
                {item.icon}
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4">{active}</h1>
        <div className="rounded-xl bg-white shadow p-6 min-h-[400px]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default DashboardView;
