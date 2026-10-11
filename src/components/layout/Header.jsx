// App Header with navigation
import { useNavigate, useLocation } from "react-router-dom";
import { RotateCcw, ArrowLeft, Search } from "lucide-react";
import useAppStore from "@/stores/appStore";

export default function Header({ showBack = false, rightAction = "reset" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetApp } = useAppStore();
  const isResults = location.pathname.startsWith("/results");

  const handleReset = () => {
    resetApp();
    navigate("/");
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="glass-strong sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={handleBack}
            className="text-orange-400 hover:text-orange-300 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <button onClick={() => navigate("/")} className="text-lg font-black">
          <span className="text-gradient-saffron">Haq</span>
          <span className="text-white">Daar</span>
        </button>
      </div>

      {rightAction === "reset" && (
        <button
          onClick={handleReset}
          className="text-gray-500 hover:text-gray-300 text-xs flex items-center gap-1.5 border border-white/10 px-2.5 py-1.5 rounded-lg hover:border-white/20 transition-all"
        >
          {isResults ? <Search size={12} /> : <RotateCcw size={12} />}
          {isResults ? "New Search" : "Reset"}
        </button>
      )}
    </div>
  );
}
