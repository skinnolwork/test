import SelectableTabs from "../components/SelectableTabs";
import SelectableList from "../components/SelectableList";

const IndividualAnalysis = () => {
  const Images = ["샘플 데이터1", "샘플 데이터2", "샘플 데이터3", "셈플 데이터4"];
  const Cosmetics = ["미샤 핸드 크림", "미샤 로션", "설화수 핸드크림", "설화수 로션"];

  return (
    <div className="p-6 text-white">
      <SelectableTabs options={["폴리스타이렌", "실리콘", "타이레놀"]} />
      <div className="flex justify-center space-x-8 mt-10">
        <SelectableList title="이미지 리스트" items={Images} selectionMode="single" />
        <SelectableList title="화장품 리스트" items={Cosmetics} selectionMode="single" />
      </div>
    </div>
  );
};

export default IndividualAnalysis;
