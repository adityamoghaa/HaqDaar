import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolbarDynamic from "@/components/ui/ToolbarDynamic";
import SchemeDashboard from "@/components/features/SchemeDashboard";

export const metadata: Metadata = {
  title: "My Welfare Dashboard & Application Tracker | HaqDaar",
  description: "Track your government scheme applications, documents checklist, and direct benefit payouts in your private offline citizen vault.",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col selection:bg-orange-500 selection:text-white pb-20">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SchemeDashboard />
      </main>
      <Footer />
      <ToolbarDynamic />
    </div>
  );
}
