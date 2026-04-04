import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-4 border-gray-100 flex items-center justify-center">
           <Loader2 className="animate-spin text-[#E8541A]" size={40} />
        </div>
      </div>
      <p className="mt-6 text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">
        Loading BoxOS Dashboard...
      </p>
    </div>
  );
}
