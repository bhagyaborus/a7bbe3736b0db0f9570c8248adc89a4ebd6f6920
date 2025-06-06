import { Bot, BarChart3, Send, FileText, History, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "#", icon: BarChart3, current: true },
  { name: "Workflow", href: "#", icon: Send, current: false },
  { name: "Content Drafts", href: "#", icon: FileText, current: false },
  { name: "Post History", href: "#", icon: History, current: false },
  { name: "Settings", href: "#", icon: Settings, current: false },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-lg border-r border-slate-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Bot className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Social Agent</h1>
            <p className="text-sm text-slate-500">Bhagya Sharma</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                item.current
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </a>
          );
        })}
      </nav>

      {/* Status Indicator */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3 px-4 py-3 bg-emerald-50 rounded-lg">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-emerald-700">Agent Active</span>
        </div>
      </div>
    </div>
  );
}
