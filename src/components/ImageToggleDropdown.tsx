import React, { useEffect, useState } from 'react';

interface Props {
  onSelect: (filename: string) => void;
}

const ImageToggleDropdown: React.FC<Props> = ({ onSelect }) => {
  const [imageList, setImageList] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch('http://192.168.12.46:5000/image-list');
        const data = await res.json();
        setImageList(data.images);
      } catch (err) {
        console.error('이미지 목록 불러오기 실패:', err);
      }
    };
    fetchImages();
  }, []);

  const sendImageToFrontend = async (filename: string) => {
    try {
      await fetch('http://192.168.12.46:5000/send-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename,
          pc_username: 'PC',
          pc_dest_dir: 'C:/Users/PC/Desktop/skinnol_v2.1/public'
        }),
      });

    } catch (err) {
      console.error('❌ 전송 요청 실패:', err);
    }
  };

  return (
    <div style={{ width: '400px', position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#444',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'center',
        }}
      >
        {selectedImage ? `${selectedImage.replace(/\.[^/.]+$/, "")} ▼` : 'Select Image ▼'}

      </button>

      {isOpen && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            boxSizing: 'border-box',
            zIndex: 10,
            backgroundColor: '#fff',
            color: '#000',
            border: '1px solid #ccc',
            padding: 0,
            margin: 0,
            maxHeight: '200px',
            overflowY: 'auto',
            textAlign: 'center',
          }}
        >
          {imageList.map((name, idx) => {
            const baseName = name.replace(/\.[^/.]+$/, ""); // 확장자 제거
            return (
              <li
                key={idx}
                onClick={() => {
                  setSelectedImage(name);
                  onSelect(name);
                  setIsOpen(false);
                  sendImageToFrontend(name);
                }}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                }}
              >
                {baseName}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ImageToggleDropdown;
