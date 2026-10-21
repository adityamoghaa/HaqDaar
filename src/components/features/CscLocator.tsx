"use client";

import { useState, useMemo } from "react";
import {
  MapPin,
  Search,
  Phone,
  Navigation,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Building,
  Info,
  Star,
  ExternalLink,
} from "lucide-react";
import cscData from "@/data/csc-centres.json";

interface CscCentre {
  id: string;
  name: string;
  state: string;
  district: string;
  pincode: string;
  vleName: string;
  phone: string;
  address: string;
  timings: string;
  services: string[];
  rating: number;
}

export default function CscLocator() {
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedService, setSelectedService] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const states = useMemo(() => {
    return Array.from(new Set(cscData.map((c) => c.state))).sort();
  }, []);

  const allServices = useMemo(() => {
    const set = new Set<string>();
    cscData.forEach((c) => c.services.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, []);

  const filteredCentres = useMemo(() => {
    return (cscData as CscCentre[]).filter((centre) => {
      if (selectedState !== "all" && centre.state !== selectedState) return false;
      if (selectedService !== "all" && !centre.services.includes(selectedService)) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = centre.name.toLowerCase().includes(q);
        const matchesDistrict = centre.district.toLowerCase().includes(q);
        const matchesPincode = centre.pincode.includes(q);
        const matchesAddress = centre.address.toLowerCase().includes(q);
        const matchesVle = centre.vleName.toLowerCase().includes(q);
        return matchesName || matchesDistrict || matchesPincode || matchesAddress || matchesVle;
      }

      return true;
    });
  }, [search, selectedState, selectedService]);

  const handleCopyAddress = (id: string, address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-gray-900 via-gray-900/90 to-gray-950 border border-white/10 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-orange-400">
          <MapPin className="w-3.5 h-3.5" />
          <span>Physical Citizen Support Centers</span>
        </div>
        <h1 className="text-3xl font-black text-white">Find Nearest Jan Seva Kendra / CSC</h1>
        <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
          Need offline biometric verification, document scanning, or assistance applying for a scheme? Find verified government Common Service Centers, E-Mitra, MeeSeva, and Aaple Sarkar Kendras near you.
        </p>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
          {/* Keyword & PIN Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by District, PIN code, or Area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-gray-950 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* State Filter */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-950 border border-white/10 text-xs text-white focus:outline-none focus:border-orange-500"
            >
              <option value="all">All States ({states.length} states)</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Service Filter */}
          <div>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-950 border border-white/10 text-xs text-white focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Available Services</option>
              {allServices.map((srv) => (
                <option key={srv} value={srv}>
                  {srv}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Helpful Document Checklist Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">What to bring when visiting a CSC: </span>
          <span>
            Original Aadhaar Card with active mobile number for OTP, Bank Passbook (showing IFSC & Account number), Family Ration Card, and recent Passport-sized Photographs.
          </span>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          Showing <strong className="text-white">{filteredCentres.length}</strong> verified centers
        </span>
        {(search || selectedState !== "all" || selectedService !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setSelectedState("all");
              setSelectedService("all");
            }}
            className="text-orange-400 hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Center Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCentres.map((centre) => (
          <div
            key={centre.id}
            className="p-6 rounded-3xl bg-gray-900/70 border border-white/10 hover:border-orange-500/30 transition-all shadow-xl flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-gray-300">
                      PIN {centre.pincode}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400">
                      {centre.district}, {centre.state}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1 group-hover:text-orange-400 transition-colors">
                    {centre.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{centre.rating}</span>
                </div>
              </div>

              {/* VLE & Timings */}
              <div className="space-y-1.5 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 opacity-60 shrink-0" />
                  <span>
                    Officer In-Charge: <strong className="text-gray-300">{centre.vleName}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 opacity-60 shrink-0" />
                  <span>{centre.timings}</span>
                </div>
                <div className="flex items-start gap-2 pt-1 text-gray-300">
                  <MapPin className="w-3.5 h-3.5 text-orange-400 opacity-80 shrink-0 mt-0.5" />
                  <span className="leading-snug">{centre.address}</span>
                </div>
              </div>

              {/* Supported Services Chips */}
              <div className="pt-2">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Available Kendra Services:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {centre.services.map((srv) => (
                    <span
                      key={srv}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-gray-300 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                      <span>{srv}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-white/10 flex items-center gap-2">
              <a
                href={`tel:${centre.phone.replace(/\s+/g, "")}`}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/20"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Center</span>
              </a>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${centre.name} ${centre.address}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-orange-400" />
                <span>Directions</span>
              </a>

              <button
                onClick={() => handleCopyAddress(centre.id, centre.address)}
                className="p-2 rounded-xl text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                title="Copy Address"
              >
                {copiedId === centre.id ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
