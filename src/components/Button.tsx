const Button = ({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) => {
  return (
    <div className="fixed bottom-15 left-1/2 transform -translate-x-1/2">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-64 px-8 py-3 text-lg font-medium rounded-lg shadow-md transition-all duration-300 
          ${disabled ? "bg-gray-700 text-gray-400 cursor-not-allowed" : 
          "bg-gray-700 text-white hover:bg-gray-600 hover:shadow-lg"}`}
      >
        {label}
      </button>
    </div>
  );
};

export default Button;