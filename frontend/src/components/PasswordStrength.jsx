const PasswordStrength = ({ password }) => {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const levels = ["Weak", "Medium", "Strong", "Very Strong"];
  const colors = [
    "bg-red-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-emerald-500",
  ];

  return (
    <div className="mb-4">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded ${
              strength > i ? colors[strength - 1] : "bg-gray-700"
            }`}
          ></div>
        ))}
      </div>

      {password && (
        <p className="text-xs text-gray-400">
          Strength:{" "}
          <span className="font-semibold">
            {levels[strength - 1] || "Very Weak"}
          </span>
        </p>
      )}
    </div>
  );
};
