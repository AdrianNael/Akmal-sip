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
    // 1. Ambil foto asli
    const response = await fetch(photoUrl);
    const blob = await response.blob();

    // 2. Nama file sementara (buat upload ke server)
    const tempFilename = `${nim}_${name}_${prodi}_${idFoto}.png`;

    // 3. Kirim ke server
    const formData = new FormData();
    formData.append("file", blob, tempFilename);
    formData.append("nim", nim);
    formData.append("name", name);
    formData.append("prodi", prodi);
    formData.append("idFoto", idFoto);

    const res = await fetch("http://localhost:5000/save-idcard", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ Server error:", errText);
      return;
    }

    const data = await res.json();
    console.log("✅ Response server:", data);

    // 4. Download pakai nama final dari server
    if (data.success && data.filePath) {
      const fileUrl = `http://localhost:5000${data.filePath}`;
      const finalFilename = data.filePath.split("/").pop(); // ambil nama file dari path server

      const fileRes = await fetch(fileUrl);
      const fileBlob = await fileRes.blob();
      const downloadUrl = URL.createObjectURL(fileBlob);

      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = finalFilename; // ✅ gunakan nama file final
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      URL.revokeObjectURL(downloadUrl);
    } else {
      console.error("❌ File path tidak ditemukan di response server");
    }
  } catch (error) {
    console.error("Error downloading/saving image:", error);
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
