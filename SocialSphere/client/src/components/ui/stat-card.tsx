import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  loading?: boolean;
}

export default function StatCard({ title, value, icon, trend, loading }: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-32 mt-4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          </div>
          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className="mt-4 text-sm text-slate-500">
          {trend}
        </div>
      </CardContent>
    </Card>
  );
}
