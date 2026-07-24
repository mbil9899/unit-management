import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function Input({
  label,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <input
        className={`w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 ${className}`}
        {...props}
      />
    </div>
  );
}