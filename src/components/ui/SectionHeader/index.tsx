interface SectionHeaderProps {
  text: string;
}

export const SectionHeader = ({ text }: SectionHeaderProps) => {
  return (
    <div className="flex items-center gap-x-4">
      <h4 className="text-primary-gray font-montserrat  font-semibold text-xs">
        {text}
      </h4>
      <span className="w-full flex-1 h-[1px] bg-gray-200 dark:bg-gray-100/20" />
    </div>
  );
};
