import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolbarDynamic from "@/components/ui/ToolbarDynamic";
import SchemeComparison from "@/components/features/SchemeComparison";

export const metadata: Metadata = {
  title: "Compare Government Schemes Side-by-Side | HaqDaar",
  description: "Evaluate eligibility, financial benefits, and documents required across Indian central and state government welfare programs side by side.",
};

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col selection:bg-orange-500 selection:text-white pb-20">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SchemeComparison />
      </main>
      <Footer />
      <ToolbarDynamic />
    </div>
  );
}
