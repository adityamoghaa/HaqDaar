import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolbarDynamic from "@/components/ui/ToolbarDynamic";
import CscLocator from "@/components/features/CscLocator";

export const metadata: Metadata = {
  title: "Nearest CSC & Jan Seva Kendra Locator | HaqDaar",
  description: "Find your nearest Common Service Center (CSC), E-Mitra, MeeSeva, or Aaple Sarkar Kendra for offline eKYC, biometric verification, and scheme applications.",
};

export default function CscLocatorPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col selection:bg-orange-500 selection:text-white pb-20">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CscLocator />
      </main>
      <Footer />
      <ToolbarDynamic />
    </div>
  );
}
