import { useState } from "react";

interface SelectableListProps {
  title: string;
  items: string[];
  selectionMode: "single" | "multiple"; // 단일 선택 or 다중 선택
  maxSelection?: number; // 최대 선택 가능 개수 (Frame2처럼 제한이 있을 때)
}

const SelectableList = ({ title, items, selectionMode, maxSelection }: SelectableListProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleSelect = (item: string) => {
    if (selectionMode === "single") {
      setSelectedItems([item]); // 단일 선택 모드 → 하나만 선택
    } else {
      if (selectedItems.includes(item)) {
        setSelectedItems(selectedItems.filter((selected) => selected !== item)); // 선택 해제
      } else if (!maxSelection || selectedItems.length < maxSelection) {
        setSelectedItems([...selectedItems, item]); // 다중 선택 모드 → 선택 추가
      }
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md w-80 h-96 overflow-y-auto">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition ${
              selectedItems.includes(item) ? "bg-gray-700 text-white" : "bg-gray-900 text-gray-300 hover:bg-gray-700"
            }`}
            onClick={() => handleSelect(item)}
          >
            <div className="flex items-center space-x-3">
              <span
                className={`w-4 h-4 flex items-center justify-center rounded-full border-2 ${
                  selectedItems.includes(item) ? "border-blue-400 bg-blue-400" : "border-gray-500"
                }`}
              >
                {selectedItems.includes(item) && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </span>
              <span>{item}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SelectableList;
