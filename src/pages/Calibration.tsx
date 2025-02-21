import SelectableList from "../components/SelectableList";
import { useState } from "react";
import { CalibrationModes } from "../data";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

const Calibration = () => {
  const navigate = useNavigate();
  const [selectedCalibration, setSelectedCalibration] = useState<string | null>(null); // ✅ 컴포넌트 내부에서 호출

  const handleCalibration = () => {
    if (selectedCalibration) {
      navigate("/Graphs", { state: { selectedCalibration } });
    }
  };

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
      <Button 
        label="캘리브레이션 시작" 
        onClick={handleCalibration}
        disabled={!selectedCalibration} 
      />
    </div>
  );
};

export default Calibration;
