export const Progress = ({ value, className = "" }: { value: number; className?: string }) => {
  return (
    <div className={`w-full bg-[var(--border)] rounded-full h-2.5 ${className}`}>
      <div 
        className="bg-[var(--accent)] h-2.5 rounded-full transition-all duration-300" 
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      ></div>
    </div>
  );
};
