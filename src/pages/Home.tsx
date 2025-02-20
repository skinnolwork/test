import { useState, useEffect } from "react";

export default function Home() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        console.log("컴포넌트가 마운트됨!");
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-3xl font-bold text-blue-500">홈 페이지</h1>
            <p className="text-gray-700">카운트: {count}</p>
            <button onClick={() => setCount(count + 1)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">증가</button>
        </div>
    );
}
