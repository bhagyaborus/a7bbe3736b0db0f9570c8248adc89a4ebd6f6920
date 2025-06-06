import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStepProps {
  title: string;
  description: string;
  status: "completed" | "pending" | "error";
  timestamp?: string;
}

export default function WorkflowStep({ title, description, status, timestamp }: WorkflowStepProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-emerald-500" size={20} />;
      case "pending":
        return <Clock className="text-amber-500 animate-pulse" size={20} />;
      case "error":
        return <AlertCircle className="text-red-500" size={20} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 border-emerald-200";
      case "pending":
        return "bg-amber-50 border-amber-200";
      case "error":
        return "bg-red-50 border-red-200";
    }
  };

  return (
    <div className={cn("flex items-center space-x-4 p-4 rounded-lg border", getStatusColor())}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white">
        {getStatusIcon()}
      </div>
      <div className="flex-1">
        <p className="font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      {timestamp && (
        <span className="text-xs text-slate-400">{timestamp}</span>
      )}
    </div>
  );
}
