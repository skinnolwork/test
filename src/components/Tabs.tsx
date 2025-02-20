import { useState } from "react";

const Tabs = ({ tabs }: { tabs: string[] }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex space-x-4 border-b border-gray-700 pb-2">
      {tabs.map((tab, index) => (
        <button
          key={index}
          className={`px-4 py-2 text-white ${
            activeTab === index ? "border-b-2 border-neon-green" : "hover:text-neon-green"
          }`}
          onClick={() => setActiveTab(index)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
