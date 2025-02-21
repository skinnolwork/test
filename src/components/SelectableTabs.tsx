import { useState } from "react";
import { CalibrationModes } from "../data";

const SelectableTabs = () => {
  const [selected, setSelected] = useState(CalibrationModes[0]);

  return (
    <div className="flex justify-center mt-10">
      <div className="w-fit flex space-x-4 p-2 bg-gray-800 bg-opacity-80 rounded-lg shadow-md">
        {CalibrationModes.map((option) => (
          <button
            key={option}
            className={`px-10 py-2 rounded-lg transition duration-300 text-gray-300 font-medium 
              ${
                selected === option
                  ? "bg-gray-600 text-white shadow-lg"
                  : "hover:bg-gray-600 hover:text-white"
              }`}
            onClick={() => setSelected(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SelectableTabs;
