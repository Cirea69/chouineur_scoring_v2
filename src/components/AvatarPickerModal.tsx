import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import { X, Camera, Upload, Image as ImageIcon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAvatar: (avatarDataUrl: string) => void;
  currentAvatar: string;
}

// Les fameux avatars loufoques originaux préselectionnés des maquettes (liens d'images stables d'illustrations de personnages)
const AVATARS_PRESETS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBGY42fDNuQddskreOTIgO7_XPft3cj97rlzHtVS0y02gB3CxMbr98Epq5Epa87QPf0TtCDloxMPHAa_d2C2LYdFGf10Itl5BXetv_JDzCPaBR-U3ZC4C5nLnSFFV7NwpaxkWl0DwcpiZvWAqm9eEUavpvx2GsWGvFD7wYGehn-j29ggvIoIfqHenKPEFNag2bwPazWP85fVCJNQ_UOQB6D4qKkZ_P6dBgyVIX0tZOgUysoCMt9MPyW7yXrgfNxQguXX-YlB_-xTs", // Gaston
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAnk8Ha798S8MA_B7ljt0VskTJn9n76Foh8XMAR3sIdvSTtGLnUKfoAzCnQwIfzokrcTyRFgA96mpFnW-YYwjfCePGIqXhHHZEbTPDLaBuDF_uhzojcItf6n7Vcrferi6Vb7YFy76hfZ5_QLXwzRpmUGdHM3XN0q2YkY1nuxOOFvgN3fnEZxF_fyI5l9oHmym8EMcPMXwmhWaNcPvsHgNcGWfsOpFk6sSApmsPU6OJSj3PzaWMDWBw8WtKQohJI-a_BLYMABIXJQIE", // Simone
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCpOSNS863E9dVIAc_SuQxjIr1kZBqheibyx5k67M5IvxaXzQx7nEFI0bTXUx5XuBXbyBb31l_xqE5-J7NUeC3oJjNpIthXuKlqvCpCgdFG4Ev2FnjFDGHAjXPHp1Yv_sds1UfUJQvONHK9UDKalagzE2Zvt2dcTerGh7YC58q6YHydxaXvxHUsXYW_CM8X7_6L7yF3kzGXfgxeNOWSVbbfO_8aYyVpNIHRebjiZr9jfBgxW8moSvM9SIW4lKPcCyxsBzu_xmoZB2Q", // Balthazar
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAZNvniEMANB7oOLI39p7aqpV6uNbkuiE_MtYMHqm1KB3PNatlWSO3H8tdRY23ghZTbTsGkxi3L0gSZDHK1xqd1lS_blQ6Z_eCKjLCXD8m7aA--eJVVydz843HrHoepqeQsU_5B0YZxWKehx8yyKuBtlZ8_Tl-Juye_SkjsbOO24HxokhqFSqyqVh3zzt393qgtWH4C55C4LFVAwUNfuSBDhnDe9fKLJuLfDTGfp8HCx-Or4zC702U3VR2_I34sVLwJTUfiyFBIB0c", // P'tit Gars
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC1utXBxP-J5exPJaUjKEgRFjZbIZfVKBClrhy-f8QPtTmjNtVGpL-SsveOU-bEseJdPHRZLgpNIUZMUk0nTQvvLCcohKKCgzcEUev2cpEPfiK_TRPptVba0VJ0BCj_bxZZPGINpAwdtBEK1AptqKmnXES11w83Q59hw3uMXrht3vhMS8n9btXfitsGEV9-BdMYnM0Li--EHaRYu9_7TPnxJbCg8rhoiMxhjQgONTn7RJ3EkuvJwjkIborF9-LGcemfGO7YTZ6OTrg", // Mlle Raleuse
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBaJRKZ4qEJjyYEGZPqFnaIb7zUW3TN__o-cpgGc5Vrk11CMRolIcTpJ9mm-q_wNekoMy-xMMVyrpqfLc8-xqSohG758MMaTUgOAzvxs5e4s3eyolmGzRVqWdxKsdtv1YztFdWL-AdmXwmf5e-G3-Jlw-GBIEHM8bt90wgGv4h0XyOssqI_cZcsoHIQr5vMz-GrlC29BgJCQ1xO6eDlnTlMDPdROphYcg3XaxBVeVLiqmximajl2cxYjDuqTARkv68cblGVh2ASfzo", // Vieux Grognon
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBQ3HDElYtzKIsx0bx5ytEK53j4DreEHwQS9Tb_XcgbjVlRsLXrDIkckxyvVzrhNw8_7csiOBH0O8m5_ZstNycIXxdeT4pOYYIAmmh24FLbw_NLKZxTzGmquaMx0lxUq_jiE5EqiipT2ZAEBRna8qQo_viR8CCENbD0ZsC26Lr_fZ97cCR4kMdesmcJhb9k2SYQR112T3iUaPjbty42W_27O6Ke0xyuhXdRQ9TRghpr0AYQrEPzM08eUN6TquSnGde4Imyo6i9BT4c", // Dédé
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDpd7v3Tj_4ilCSfRdW_SLvBDfUrcDZVcObXfRm-CvoSgpKV5JybL8pPPFZN6tHSemVQWGIMXd17fcWgWQo-3Y3UZnnmjxXJ_qaBRSIwhr6NT3KK7CMwta9nd_8ppbnPGhAs9vt3Y8NTIW8JnSpK2cW4Hmyd_KIizs_hBRU-uWjbACVQ-Zk2Fbj-zU-lImkyKc8BozqP0GvSepSyg9hsZB90onKf5hOWeGN7kHdVT8EPHXJKsL8MI7NCNz-MkVzVJGbmzohmU-CBkk", // Reine Decker
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC1KpoLwvb1tHTNdljSsb1mmIbAdpLK7-x7IozKe8-eFamPjKfHZ0VkQi0qIRGQ4GbkJrybggLVim5hEIAUVe70ezcwQKXU0vDBcsOuAe3mUrqzCuK4ElwHRjREupcEU18YHFks4H7kKT2PkOOfxiSPNm9Bmq6Pz1PedqnbUreTfy4Qvbuo-2tWkI_eAN5h0WInrHrMdpPYuHLBFiQ9laGwE_MK-r4PuUtY8a8lwqauG4C__4zRaCNxv6W5cV--F8zT_a3vgrhMisc", // Dragon Bert
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBLW08emmHl-HZ_gCOCukU4_JR8axer9rk24qHzrTxhfnSnkyk2PqX8Mc8VQmKxmmdAKRyYsOByShR7xxEPg652z35R-TS5-qzzeBIf_Bd3aCtHjhME54YvEx9ji68on31zRkTzfIzdxrRPrdXkK1ybiADOTLXFyaNjOl3mWqjVO6ZEL1mx1TVvvIGqfB9s-o9foed1F8rKMm6jyV_i8EwbCkuG3Xqbn3SZbOrHOqwipzR_RMAej7VCq6RVa5JU85ikXYeWVicc-V4", // Roger Rape-Vite
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCqzPHJ2xo_oEIv6YPoMkFpwKCJWE3HNcdHyK6M5y1fRFQhcyRot1KckMq0m49QVmGMy1BhMlLEoKWg99PKf3AWs4TrU3k3BHx2QkdcQR0ML6HAJQaxwjrT5NBzbh78J-RsCu6he-ieahlRh-6Ibdy0jVbmYXKf9RijmOiiH_wf1MhzIQQ2gXeDmB64c8R9bmJq8yC0xDW66ce3sUQX21Bephmp-lAuFxklxCkoYV4oBMRnU_1kIqrsk1MbYNFRZaelQL6Tj-_VK4Y", // Petite Bianca
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD6bvfND8YE8HATm_QLH7JRAJAQfAenRSdOueCYvtcxMzlAI12TwskCISAw0orXctuIeUz_zRI6HZl03vx34ITV7gd_Jic-gnVxJDxkwRiWWSrWk3e0asaRQdTY9ZHlyM-uQG6BW_IsHA7iLtEv7RAjYMYxWz0hbHhEvRBdIITxd6l0DMxEEbYXnExJ_4R1Nln13Czyl6qwTe2ZZGNWkHKOUwVtu_cgo7ES586AgN9u_Oy3M_LiqKc0BeW4A12mPVf1f2X_Pg6JA5w"  // Roi Telet
];

export default function AvatarPickerModal({
  isOpen,
  onClose,
  onSelectAvatar,
  currentAvatar,
}: AvatarPickerModalProps) {
  const [activeTab, setActiveTab] = useState<"preset" | "camera" | "upload">("preset");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Gérer la caméra
  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 300, height: 300, facingMode: "user" },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Erreur d'accès à la caméra:", err);
      setCameraError(
        "Impossible d'accéder à la caméra. Vérifiez les permissions de votre navigateur."
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen && activeTab === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, activeTab]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        try {
          const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.85);
          onSelectAvatar(dataUrl);
          onClose();
        } catch (e) {
          console.error("Échec du toDataURL", e);
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("L'image est trop lourde ! (Max 5Mo)");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onSelectAvatar(reader.result);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-background dark:bg-surface-dim w-full max-w-md hand-drawn-border p-6 rounded-xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-sm text-headline-sm text-primary dark:text-primary-fixed-dim flex items-center gap-2">
              <Camera className="w-6 h-6 text-secondary" />
              Modifier l'Avatar
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer text-on-surface"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation des Onglets en style rough-drawn */}
          <div className="flex border-b-2 border-outline-variant/40 mb-6 font-label-md">
            <button
              onClick={() => setActiveTab("preset")}
              className={`flex-1 pb-3 text-center transition-all cursor-pointer font-bold border-b-4 ${
                activeTab === "preset"
                  ? "border-primary text-primary dark:border-primary-fixed-dim dark:text-primary-fixed-dim"
                  : "border-transparent text-on-surface-variant/80 hover:text-on-surface"
              }`}
            >
              <ImageIcon className="inline-block w-4 h-4 mr-1" />
              Galerie
            </button>
            <button
              onClick={() => setActiveTab("camera")}
              className={`flex-1 pb-3 text-center transition-all cursor-pointer font-bold border-b-4 ${
                activeTab === "camera"
                  ? "border-primary text-primary dark:border-primary-fixed-dim dark:text-primary-fixed-dim"
                  : "border-transparent text-on-surface-variant/80 hover:text-on-surface"
              }`}
            >
              <Camera className="inline-block w-4 h-4 mr-1" />
              Appareil Photo
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex-1 pb-3 text-center transition-all cursor-pointer font-bold border-b-4 ${
                activeTab === "upload"
                  ? "border-primary text-primary dark:border-primary-fixed-dim dark:text-primary-fixed-dim"
                  : "border-transparent text-on-surface-variant/80 hover:text-on-surface"
              }`}
            >
              <Upload className="inline-block w-4 h-4 mr-1" />
              Importer
            </button>
          </div>

          {/* Contenu de l'onglet actif */}
          <div className="min-h-64 flex flex-col justify-center">
            {/* 1. Galerie de personnages originaux */}
            {activeTab === "preset" && (
              <div className="grid grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1">
                {AVATARS_PRESETS.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onSelectAvatar(url);
                      onClose();
                    }}
                    className={`w-16 h-16 rounded-full overflow-hidden border-3 cursor-pointer group transform hover:scale-105 transition-all ${
                      currentAvatar === url
                        ? "border-secondary scale-105"
                        : "border-primary/45 dark:border-outline hover:border-primary"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Avatar loufoque ${i + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:block transition-all"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* 2. Caméra en direct / Photo capture */}
            {activeTab === "camera" && (
              <div className="flex flex-col items-center">
                {cameraActive && (
                  <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-dashed border-primary dark:border-primary-fixed-dim bg-black/10 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <div className="absolute inset-0 border-6 border-background pointer-events-none rounded-full" />
                  </div>
                )}

                {cameraError && (
                  <div className="text-center p-4 bg-error-container text-on-error-container rounded-lg italic text-sm">
                    <p>{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="mt-3 px-4 py-2 bg-on-error-container text-error-container rounded font-bold text-xs cursor-pointer hover:opacity-90"
                    >
                      Réessayer
                    </button>
                  </div>
                )}

                {cameraActive && !cameraError && (
                  <button
                    onClick={handleCapture}
                    className="mt-6 px-6 py-3 bg-secondary text-on-secondary hover:bg-secondary-container transition-all active:scale-95 hand-drawn-border font-headline-sm rounded-lg flex items-center gap-2 cursor-pointer rotate-1"
                  >
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    Prendre la Photo
                  </button>
                )}

                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}

            {/* 3. Importer un fichier local */}
            {activeTab === "upload" && (
              <div className="flex flex-col items-center justify-center p-6 border-4 border-dashed border-outline-variant/60 rounded-xl bg-surface-container-low dark:bg-surface-container-high/20 h-64 text-center">
                <Upload className="w-12 h-12 text-tertiary dark:text-primary mb-4" />
                <p className="font-body-md text-sm text-on-surface-variant italic mb-4">
                  Glissez-déposez ou sélectionnez un fichier JPEG/PNG
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-primary text-on-primary dark:bg-primary-container dark:text-on-primary-container font-label-lg rounded-xl hand-drawn-border hover:translate-y-[-2px] transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Choisir une photo
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
