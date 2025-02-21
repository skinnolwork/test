import SelectableTabs from "../components/SelectableTabs";
import SelectableList from "../components/SelectableList";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const IndividualAnalysis = () => {
  const navigate = useNavigate();
  const Images = ["샘플 데이터1", "샘플 데이터2", "샘플 데이터3", "샘플 데이터4"];
  const Cosmetics = ["미샤 핸드 크림", "미샤 로션", "설화수 핸드크림", "설화수 로션"];

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCosmetic, setSelectedCosmetic] = useState<string | null>(null);
  
  const handleConfirm = () => {
    if (selectedCosmetic) {
      navigate("/graphs", { state: { selectedCosmetic } });
    }
  };

  return (
    <div className="p-6 text-white">
      <SelectableTabs />
      <div className="flex justify-center w-full max-w-screen-xl mx-auto gap-8 mt-10">
        <SelectableList
          title="이미지 리스트"
          items={Images}
          selectionMode="single"
          onSelect={(selected) => setSelectedImage(selected[0] || null)}
        />

        <SelectableList
          title="화장품 리스트"
          items={Cosmetics}
          selectionMode="single"
          onSelect={(selected) => setSelectedCosmetic(selected[0] || null)}
        />
      </div>

      <Button
        label="다음으로"
        onClick={handleConfirm}
        disabled={!selectedImage || !selectedCosmetic}
      />
    </div>
  );
};

export default IndividualAnalysis;
