import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  onTestWorkflow: () => void;
  isTestingWorkflow: boolean;
}

export default function Header({ onTestWorkflow, isTestingWorkflow }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-600 mt-1">Monitor your social media automation workflow</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={onTestWorkflow}
            disabled={isTestingWorkflow}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isTestingWorkflow ? "Testing..." : "Test Workflow"}
          </Button>
          
          {/* Notification Bell */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          </Button>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
            <Avatar>
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                BS
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-slate-900">Bhagya Sharma</p>
              <p className="text-xs text-slate-500">Content Creator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
