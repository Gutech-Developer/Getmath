interface IClassInfoDetailRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

export default function ClassInfoDetailRow({
  label,
  value,
  isLast = false,
}: IClassInfoDetailRowProps) {
  return (
    <div
      className={`flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between ${
        !isLast ? "border-b border-[#E5E7EB]" : ""
      }`}
    >
      <p className="text-base text-[#64748B]">{label}</p>
      <p className="text-base font-semibold text-[#334155] sm:text-right">
        {value}
      </p>
    </div>
  );
}
