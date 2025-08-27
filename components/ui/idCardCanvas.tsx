"use client";

import { useImperativeHandle, forwardRef, useRef } from "react";
import html2canvas from "html2canvas";

interface IDCardCanvasProps {
  photoUrl: string;
  name: string;
  prodi: string;
  nim: string;
  idFoto: string;
}

export interface IDCardCanvasHandle {
  download: () => void;
}

const IDCardCanvas = forwardRef<IDCardCanvasHandle, IDCardCanvasProps>(
  ({ photoUrl, name, prodi, nim, idFoto }, ref) => {
    const canvasRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
      try {
        const response = await fetch(photoUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const filename = `${nim}_${name}_${prodi}_${idFoto}`;

        const link = document.createElement("a");
        link.href = url;
        link.download = `${filename || "idcard"}.png`;
        link.click();

        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading image:", error);
      }
    };

    useImperativeHandle(ref, () => ({
      download: handleDownload,
    }));

    return (
      <div className="w-full h-auto flex flex-col items-center p-4">
        <div className="w-full max-w-[350px]">
          <div className="relative w-full aspect-[650/1024]">
            <div
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full bg-white overflow-hidden shadow-lg"
            >
              <img
                src="/template-idcard.png"
                alt="ID Card Background"
                className="absolute inset-0 w-full h-full object-cover"
              />

              <img
                src={photoUrl}
                alt="Foto Mahasiswa"
                className="absolute left-[200px] top-[245px] w-[400px] h-[620px] scale-[0.538] origin-top-left object-cover rounded-lg"
              />

              <div className="absolute text-black font-[montserrat] font-bold text-[32px] top-[280px] scale-[0.538] origin-top-left left-[32px] w-[300px] h-[50px] overflow-hidden">
                {name}
              </div>

              <div className="absolute text-black font-[montserrat] font-medium text-[24px] scale-[0.538] origin-top-left top-[300px] left-[32px]">
                {prodi}
              </div>

              <div className="absolute text-black font-[montserrat] font-medium text-[20px] scale-[0.538] origin-top-left top-[316px] left-[32px]">
                {nim}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default IDCardCanvas;
