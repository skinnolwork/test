import SelectableTabs from "../components/SelectableTabs";
import SelectableList from "../components/SelectableList";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

const ComparisonAnalysis = () => {
  const navigate = useNavigate();
  const Datas = [
    "샘플 데이터1", "샘플 데이터2", "샘플 데이터3", "샘플 데이터4",
    "미샤 핸드 크림", "미샤 로션", "설화수 핸드크림", "설화수 로션"
  ];

  // 부모 컴포넌트에서 선택된 데이터 저장 (useState 사용)
  const [selectedDatas, setSelectedDatas] = useState<string[]>([]);

  const handleCompare = () => {
    if (selectedDatas.length >= 2) {
      navigate("/graphs", { state: { selectedDatas } });
    }
  };

  return (
    <div className="p-6 text-white">
      <SelectableTabs />
      <div className="flex justify-between w-full max-w-screen-xl mx-auto mt-10">
        <SelectableList
          title="비교 항목 리스트"
          items={Datas}
          selectionMode="multiple"
          maxSelection={4}
          onSelect={setSelectedDatas}
        />
      </div>
      <Button
        label="비교하기"
         onClick={handleCompare}
        disabled={selectedDatas.length < 2}
      />
    </div>
  );
};

export default ComparisonAnalysis;
