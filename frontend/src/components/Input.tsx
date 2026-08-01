export const Input = ({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      className={`w-full px-3 py-2 bg-[var(--bg)] text-[var(--text-h)] border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)] ${className}`}
      {...props}
    />
  );
};
