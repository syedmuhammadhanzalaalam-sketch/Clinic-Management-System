import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  helper?: string;
};

export function StatCard({ label, value, icon: Icon, helper }: StatCardProps) {
  return (
    <div className="panel stat">
      <div>
        <div className="muted">{label}</div>
        <div className="stat-value">{value}</div>
        {helper && <div className="muted">{helper}</div>}
      </div>
      <div className="stat-icon">
        <Icon size={22} />
      </div>
    </div>
  );
}
