import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolbarDynamic from "@/components/ui/ToolbarDynamic";
import NationalImpactDashboard from "@/components/features/NationalImpactDashboard";

export const metadata: Metadata = {
  title: "National Welfare Impact & Household Benefit Calculator | HaqDaar",
  description: "Explore national welfare distribution metrics across Indian states and calculate your household's total estimated annual entitlement.",
};

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col selection:bg-orange-500 selection:text-white pb-20">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NationalImpactDashboard />
      </main>
      <Footer />
      <ToolbarDynamic />
    </div>
  );
}
