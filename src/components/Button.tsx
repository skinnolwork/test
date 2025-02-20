const Button = ({ label, onClick }: { label: string; onClick: () => void }) => {
    return (
      <button 
        onClick={onClick} 
        className="px-4 py-2 bg-neon-green text-gray-900 rounded-lg font-semibold hover:bg-green-400 transition duration-300"
      >
        {label}
      </button>
    );
  };
  
  export default Button;
  