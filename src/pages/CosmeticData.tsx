import Button from "../components/Button";
import SelectableList from "../components/SelectableList";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const CosmeticData = () => {
  const navigate = useNavigate();
  const Cosmetics = [
    "미샤 핸드 크림",
    "미샤 로션",
    "설화수 핸드크림",
    "설화수 로션",
    "이니스프리 세럼",
    "라네즈 크림",
  ];

  // 선택된 화장품을 저장하는 상태
  const [selectedCosmetic, setSelectedCosmetic] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedCosmetic) {
      navigate(`/graphs?from=cosmetic-data=${selectedCosmetic}`);
    }
  };

  return (
    <div className="p-10 text-white">
      <div className="flex justify-center w-full max-w-screen-xl mx-auto mt-10">
        <SelectableList
          title="화장품 데이터"
          items={Cosmetics}
          selectionMode="single" // 단일 선택 모드
          onSelect={(selected) => setSelectedCosmetic(selected[0] || null)}
        />
      </div>
      <Button
        label="확인"
        onClick={handleConfirm}
        disabled={!selectedCosmetic}
      />
    </div>
  );
};

export default CosmeticData;
