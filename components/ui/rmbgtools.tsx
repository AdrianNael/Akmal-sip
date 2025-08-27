"use client";
import { use, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import IDCardCanvas, { IDCardCanvasHandle } from "./idCardCanvas";
import { ThemeToggle } from "./thme-toggle";
import { useRouter } from "next/navigation";

export default function RemoveBgTool() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [idFoto, setIdFoto] = useState("");

  const [students, setStudents] = useState<any[]>([]);
  const [nim, setNim] = useState("");
  const [name, setName] = useState("");
  const [prodi, setProdi] = useState("");

  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
    });
    router.push("/login"); // redirect ke halaman login
  };

  // Start camera
  useEffect(() => {
    // Start camera
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { aspectRatio: 3 / 4 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setStreaming(true);
        }
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/siup");
        const json = await res.json();
        if (json.success && json.data?.data?.length > 0) {
          setStudents(json.data.data); // simpan array mahasiswa
        }
      } catch (err) {
        console.error("Fetch students error:", err);
      }
    };

    startCamera();
    fetchStudents();

    return () => {
      videoRef.current?.srcObject &&
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!nim) return;

    const selected = students.find((s) => s.nomor_induk === nim);
    if (selected) {
      setName(selected.nama);
      setProdi(selected.prodi);
    }
  }, [nim, students]);

  const handleDownloadAndSubmit = async () => {
    if (isProcessing) return;
    try {
      idCardRef.current?.download();
      console.log("✅ File berhasil di-download");
    } catch (err) {
      console.error("❌ Error saat download & submit:", err);
    }
  };

  const idCardRef = useRef<IDCardCanvasHandle>(null);

  const handleCountdownAndCapture = () => {
    setCountdown(5); // mulai dari 5 detik
    setIsCountingDown(true);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCountingDown(false);
          handleCapture(); // ambil foto setelah timer habis
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Canvas context not found");
      return;
    }

    setLoading(true);
    setResultUrl(null);

    // Faktor pembesaran sesuai device pixel ratio
    const scale = window.devicePixelRatio || 1;
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;

    // Gambar frame video ke canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Konversi ke Blob dan kirim ke API
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("image", blob, "capture.png");

        try {
          const res = await fetch("http://localhost:5000/remove-background", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);

          const resultBlob = await res.blob();
          const imageUrl = URL.createObjectURL(resultBlob);

          setCapturedImage(imageUrl);
          setResultUrl(imageUrl);

          // Hapus object URL lama supaya tidak memory leak
          // URL.revokeObjectURL(imageUrl); // jangan langsung revoke kalau masih dipakai
        } catch (err) {
          console.error("Error removing background:", err);
          alert("Gagal memproses gambar.");
        } finally {
          setLoading(false);
        }
      },
      "image/png",
      0.9 // sebelumnya 1, bisa bikin file lebih kecil
    );
  };

  const handleUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const uploadImage = async (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      // 8 MB limit
      alert("Gambar terlalu besar (max 8 MB).");
      return;
    }

    setLoading(true);
    setResultUrl(null);

    const form = new FormData();
    form.append("image", file); // harus sama seperti di multer (server/index.js)

    try {
      const res = await fetch("http://localhost:5000/remove-background", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Gagal remove background");
      }

      // Ambil hasil PNG transparan
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      alert("Gagal memproses gambar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50">
          {/* Spinner */}
          <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin mb-4"></div>
          {/* Text */}
          <span className="text-white text-xl font-semibold">
            Sedang memproses...
          </span>
        </div>
      )}

      {/* Header */}
      <Card className="w-full mt-5 py-4 px-5">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">Akmal App</h1>
          <div className="flex gap-4">
            <ThemeToggle />
            <Button onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </Card>

      {/* Left Panel */}
      <div className="grid md:grid-cols-2 gap-6 p-6">
        <Card className="w-full max-w-xl ">
          <CardContent className="space-y-4 p-4">
            <Label className="flex justify-center font-bold text-lg">
              Preview Kamera
            </Label>

            <div className="relative w-full">
              <video
                ref={videoRef}
                className="w-full rounded-md border scale-x-[-1]"
              />
              <Button
                onClick={handleCountdownAndCapture}
                className="absolute bottom-4 left-1/2 -translate-x-1/2"
                variant="secondary"
              >
                Capture
              </Button>
              {isCountingDown && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-6xl font-bold bg-black/50 z-50">
                  {countdown}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="upload">Upload Gambar</Label>
              <Input
                id="upload"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleUpload}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? "Processing..." : "Remove Background"}
            </Button>

            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>

        {/* Right Panel */}
        <Card className="w-full max-w-xl">
          <CardContent className="p-4 space-y-4">
            <Label className="flex justify-center font-bold text-lg">
              Preview Hasil
            </Label>

            {resultUrl ? (
              <>
                <IDCardCanvas
                  ref={idCardRef}
                  photoUrl={resultUrl}
                  name={name}
                  prodi={prodi}
                  nim={nim}
                  idFoto={idFoto}
                />

                <Separator />

                {/* Form Input */}
                <div className="space-y-4">
                  <div>
                    <Label className="mb-3">NIM</Label>
                    <select
                      value={nim}
                      onChange={(e) => setNim(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Pilih NIM</option>
                      {students.map((s) => (
                        <option key={s.nomor_induk} value={s.nomor_induk}>
                          {s.nomor_induk}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-3">Nama Mahasiswa</Label>
                      <Input
                        value={name}
                        readOnly
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="mb-3">Program Studi</Label>
                      <Input
                        value={prodi}
                        readOnly
                        onChange={(e) => setProdi(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3">ID Foto</Label>
                    <Input
                      value={idFoto}
                      onChange={(e) => setIdFoto(e.target.value)}
                      placeholder="Misal: 2025-001"
                    />
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleDownloadAndSubmit}
                  disabled={isProcessing}
                >
                  Download Hasil
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground text-center">
                Hasil akan muncul di sini setelah proses selesai.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
