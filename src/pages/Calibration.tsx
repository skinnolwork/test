import SelectableList from "../components/SelectableList";
import { useState } from "react"; // ✅ 반드시 컴포넌트 내부에서 사용해야 함
import { CalibrationModes } from "../data"; // ✅ 공통 데이터 가져오기

const Calibration = () => {
  const [selectedCalibration, setSelectedCalibration] = useState<string | null>(null); // ✅ 컴포넌트 내부에서 호출

  return (
    <div className="p-10 text-white">
      <div className="flex justify-center w-full max-w-screen-xl mx-auto mt-10">
        <SelectableList
          title="캘리브레이션 모드 선택"
          items={CalibrationModes}
          selectionMode="single"
          onSelect={(selected) => setSelectedCalibration(selected[0] || null)}
        />
      </div>
    </div>
  );
};

export default Calibration;
