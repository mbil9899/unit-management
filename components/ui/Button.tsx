import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const baseStyle =
    "px-5 py-2 rounded-lg font-medium transition duration-200";

  const variants = {
    primary:
      "bg-emerald-700 text-white hover:bg-emerald-800",

    secondary:
      "bg-slate-200 text-slate-800 hover:bg-slate-300",

    danger:
      "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}