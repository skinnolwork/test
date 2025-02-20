const Card = ({ title, children }: { title: string; children: React.ReactNode }) => {
    return (
      <div className="bg-gray-800 bg-opacity-90 rounded-xl p-6 shadow-lg border border-neon-green">
        <h3 className="text-lg font-semibold text-neon-green">{title}</h3>
        <div className="mt-4">{children}</div>
      </div>
    );
  };
  
  export default Card;
  