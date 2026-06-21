
interface PasswordStrengthBarProps {
  password?: string;
}

export const PasswordStrengthBar = ({ password = '' }: PasswordStrengthBarProps) => {
  // Calculate strength based on criteria
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    return score;
  };

  const strengthScore = calculateStrength(password);

  const getBarColor = (score: number) => {
    switch (score) {
      case 0: return 'bg-red-400';
      case 1: return 'bg-yellow-400';
      case 2: return 'bg-blue-400';
      case 3: return 'bg-green-400';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-xs flex items-center">
        <span className="font-medium text-gray-400">Password strength</span>
        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium">
          {strengthScore === 0 ? 'Too weak' : strengthScore === 1 ? 'Weak' : strengthScore === 2 ? 'Medium' : 'Strong'}
        </span>
      </div>
      <div className="w-full bg-aegis-border rounded-full h-2.5">
        <div
          className={`
            h-2.5 rounded-full transition-all duration-500 ease-in-out
            ${getBarColor(strengthScore)}
          `}
          style={{ width: `${(strengthScore / 3) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};