export const Button = ({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={`px-4 py-2 bg-[var(--accent)] text-white font-medium rounded hover:opacity-90 transition-opacity disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
