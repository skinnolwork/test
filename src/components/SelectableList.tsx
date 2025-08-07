import { useState } from "react";

interface SelectableListProps {
  title: string;
  items: string[];
  selectionMode: "single" | "multiple"; // 단일 선택 or 다중 선택
  maxSelection?: number; // 최대 선택 가능 개수
  onSelect?: (selected: string[]) => void; // 부모로 선택된 데이터 전달하는 함수 추가
}

const SelectableList = ({ title, items, selectionMode, maxSelection, onSelect }: SelectableListProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleSelect = (item: string) => {
    let newSelectedItems: string[];

    if (selectionMode === "single") {
      newSelectedItems = [item]; // 단일 선택 모드 → 하나만 선택
    } else {
      if (selectedItems.includes(item)) {
        newSelectedItems = selectedItems.filter((selected) => selected !== item); // 선택 해제
      } else if (!maxSelection || selectedItems.length < maxSelection) {
        newSelectedItems = [...selectedItems, item]; // 다중 선택 모드 → 선택 추가
      } else {
        return; // 최대 선택 개수 초과 시 아무 작업도 하지 않음
      }
    }

    setSelectedItems(newSelectedItems);
    if (onSelect) onSelect(newSelectedItems); // 부모 컴포넌트에 선택된 데이터 전달
  };

  return (
    <div className="flex flex-col w-full items-center">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="bg-gray-800 p-4 rounded-lg shadow-md w-full h-96 overflow-y-auto custom-scrollbar">
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item}
              className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition ${selectedItems.includes(item) ? "bg-gray-700 text-white" : "bg-gray-900 text-gray-300 hover:bg-gray-700"
                }`}
              onClick={() => handleSelect(item)}
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`w-4 h-4 flex items-center justify-center rounded-full border-2 ${selectedItems.includes(item) ? "border-blue-400 bg-blue-400" : "border-gray-500"
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
    </div>
  );
};

export default SelectableList;
