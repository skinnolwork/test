import React, { useEffect, useState } from "react";

type CalibrationRecord = {
    date: string;
    x_start: number;
    x_end: number;
};

const CalibrationList: React.FC<{ reloadKey: number }> = ({ reloadKey }) => {
    const [calibrations, setCalibrations] = useState<CalibrationRecord[]>([]);
    const [currentCalibration, setCurrentCalibration] = useState<CalibrationRecord | null>(null);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    const loadCalibrations = () => {
        fetch("http://192.168.12.46:5000/current_calibration")
            .then((res) => res.json())
            .then((data) => {
                if (!data || !data.date) {
                    console.warn("current_calibration 응답 이상:", data);
                    setCurrentCalibration(null);
                    setSelectedFile(null);
                    return;
                }
                setCurrentCalibration(data);
                setSelectedFile(data.date);
            })
            .catch(console.error);

        fetch("http://192.168.12.46:5000/calibration_list")
            .then((res) => res.json())
            .then((data) => {
                if (!Array.isArray(data)) {
                    console.warn("calibration_list 응답 이상:", data);
                    setCalibrations([]);
                    return;
                }
                setCalibrations(
                    data
                        .filter((item) => item.date)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                );
            })
            .catch(console.error);

    };

    useEffect(() => {
        loadCalibrations();
    }, [reloadKey]);


    const handleDelete = (date: string) => {
        if (!window.confirm(`${date} 데이터를 삭제하시겠습니까?`)) return;

        fetch(`http://192.168.12.46:5000/delete_calibration`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ date }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "ok") {
                    alert("삭제되었습니다.");
                    loadCalibrations(); // 목록 새로고침
                } else {
                    alert("삭제 실패: " + JSON.stringify(data));
                }
            })
            .catch((err) => {
                console.error(err);
                alert("삭제 요청 실패");
            });
    }

    const handleSetCalibration = () => {
        if (!selectedFile) {
            alert("선택된 파일이 없습니다.");
            return;
        }

        const target = calibrations.find((c) => c.date === selectedFile);
        if (!target) {
            alert("선택된 데이터가 목록에 없습니다.");
            return;
        }

        fetch("http://192.168.12.46:5000/update_calibration", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(target),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "ok") {
                    alert("Calibration 설정이 완료되었습니다!");
                    fetch("http://192.168.12.46:5000/current_calibration")
                        .then((res) => res.json())
                        .then(setCurrentCalibration);
                } else {
                    alert("오류: " + JSON.stringify(data));
                }
            })
            .catch((err) => {
                console.error(err);
                alert("요청 실패");
            });
    };

    return (
        <div className="w-1/4 h-[100%] bg-gray-700 p-5 rounded-2xl mt-5 flex flex-col">
            {/* 파일 목록 */}
            <div className="flex-1 overflow-y-auto flex flex-col items-center">
                <h2 className="text-[clamp(14px,1.5vw,22px)] mb-2 mt-2">현재 설정</h2>
                {currentCalibration && (
                    <div className="flex flex-col">
                        <span className="text-center text-[clamp(12px,1vw,20px)]">{currentCalibration.date}</span>
                        <span className="text-[clamp(12px,1vw,20px)] text-gray-400">
                            x_start: {currentCalibration.x_start}, x_end: {currentCalibration.x_end}
                        </span>
                    </div>
                )}

                <h2 className="text-[clamp(14px,1.5vw,22px)] mb-2 mt-10">파일 목록</h2>
                {calibrations.map((item, idx) => (
                    <label key={idx} className="flex items-center gap-2 my-2">
                        <input
                            type="radio"
                            name="file"
                            checked={selectedFile === item.date}
                            onChange={() => setSelectedFile(item.date)}
                        />
                        <div className="flex flex-col pr-3">
                            <span className="text-[clamp(10px,0.7vw,16px)] text-center">{item.date}</span>
                            <span className="text-[clamp(10px,0.7vw,16px)] text-gray-400">
                                x_start: {item.x_start}, x_end: {item.x_end}
                            </span>
                        </div>
                        <button
                            onClick={() => handleDelete(item.date)}
                            className="pl-2 px-2 py-1 border border-red-500 text-red-500 rounded text-[clamp(5px,1vw,12px)] hover:bg-red-500 hover:text-white transition"
                        >
                            삭제
                        </button>
                    </label>
                ))}
            </div>

            {/* 버튼 */}
            <div className="mt-4 flex justify-center">
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={handleSetCalibration}
                >
                    설정하기
                </button>
            </div>
        </div>
    );
};

export default CalibrationList;
