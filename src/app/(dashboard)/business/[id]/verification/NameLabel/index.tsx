interface NameLabelProps {
  label: string;
  value: string;
}

export const NameLabel = ({ label, value }: NameLabelProps) => {
  return (
    <div>
      <div className="flex items-center gap-x-4">
        <span className="text-xs font-semibold">{label}</span>
        <span className="w-full flex-1 h-[1px] bg-gray-100 dark:bg-gray-100/20" />
      </div>
      <p className="text-sm font-semibold text-primary-gray mt-2">{value}</p>
    </div>
  );
};
