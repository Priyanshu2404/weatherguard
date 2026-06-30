type Status = 'pending' | 'approved' | 'rejected';

const config: Record<Status, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  },
  approved: {
    label: 'Approved',
    className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-500/10 text-red-400 border border-red-500/20',
  },
};

interface StatusBadgeProps {
  status: Status;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
