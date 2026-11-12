import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Coordinates } from '../../utils/geoUtils';
import type { BloodGroup, BloodComponentType } from '../../types/blood.types';
import type { EvaluatedDonorMatch } from '../../utils/matchingEngine';
import { Maximize2, RotateCcw, ShieldCheck, MapPin, Layers } from 'lucide-react';

interface ProximityMapProps {
  targetCoords: Coordinates;
  targetName: string;
  searchRadiusKm: number;
  targetBloodGroup?: BloodGroup;
  targetComponent?: BloodComponentType;
  evaluatedMatches: EvaluatedDonorMatch[];
  onSelectDonor?: (match: EvaluatedDonorMatch) => void;
  onRequestAlert?: (match: EvaluatedDonorMatch) => void;
  height?: string;
  showIneligible?: boolean;
}

export const ProximityMap: React.FC<ProximityMapProps> = ({
  targetCoords,
  targetName,
  searchRadiusKm,
  targetBloodGroup = 'O+',
  targetComponent = 'PRBC',
  evaluatedMatches,
  onSelectDonor,
  onRequestAlert,
  height = '500px',
  showIneligible = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const [activeDonor, setActiveDonor] = useState<EvaluatedDonorMatch | null>(null);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [targetCoords.lat, targetCoords.lng],
        zoom: 12,
        zoomControl: false,
      });

      // Add standard OpenStreetMap tiles (free, reliable, no API key watermarks)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Create LayerGroup for dynamic elements
      const layerGroup = L.layerGroup().addTo(map);
      layersGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layersGroupRef.current = null;
      }
    };
  }, []);

  // Update Map layers whenever targets, radius, or evaluated donors change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layersGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Target Hospital/Requisition Pin (Pulsing Medical Marker)
    const hospitalIconHtml = `
      <div class="relative flex items-center justify-center w-10 h-10 -translate-x-1/2 -translate-y-1/2">
        <span class="absolute w-12 h-12 bg-red-500 rounded-full opacity-30 animate-ping"></span>
        <div class="relative w-9 h-9 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white font-bold text-base">
          <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>
          </svg>
        </div>
      </div>
    `;

    const hospitalDivIcon = L.divIcon({
      className: 'custom-hospital-marker',
      html: hospitalIconHtml,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const targetMarker = L.marker([targetCoords.lat, targetCoords.lng], { icon: hospitalDivIcon })
      .bindPopup(
        `<div class="p-2 font-sans">
          <div class="text-[10px] font-bold text-red-600 uppercase tracking-wider">Hospital Requisition Center</div>
          <div class="text-sm font-black text-slate-900">${targetName}</div>
          <div class="text-xs text-slate-600 mt-1">Requested: <span class="font-bold text-red-700">${targetBloodGroup}</span> (${targetComponent})</div>
          <div class="text-[11px] text-slate-500 mt-0.5">Search Boundary: <strong>${searchRadiusKm} km radius</strong></div>
        </div>`
      );
    layerGroup.addLayer(targetMarker);

    // 2. Search Radius Boundary Circle
    const radiusCircle = L.circle([targetCoords.lat, targetCoords.lng], {
      radius: searchRadiusKm * 1000,
      color: '#B91C1C',
      weight: 1.5,
      dashArray: '6, 6',
      fillColor: '#EF4444',
      fillOpacity: 0.04,
    });
    layerGroup.addLayer(radiusCircle);

    // Fit map bounds smoothly to encompass the radius
    map.fitBounds(radiusCircle.getBounds(), { padding: [30, 30], maxZoom: 14 });

    // 3. Render Donors with Privacy Blur Rings and Markers
    const displayedMatches = showIneligible
      ? evaluatedMatches
      : evaluatedMatches.filter((m) => m.isEligibleOverall);

    displayedMatches.forEach((match) => {
      const coords = match.candidate.coordinates;
      const isEligible = match.isEligibleOverall;
      const isExact = match.isExactMatch;

      // Color scheme based on clinical match & eligibility
      let strokeColor = '#94A3B8';
      let fillColor = '#CBD5E1';
      let badgeBg = 'bg-slate-700';

      if (isEligible) {
        if (isExact) {
          strokeColor = '#059669'; // Emerald for exact match
          fillColor = '#10B981';
          badgeBg = 'bg-emerald-600';
        } else {
          strokeColor = '#2563EB'; // Blue for compatible
          fillColor = '#3B82F6';
          badgeBg = 'bg-blue-600';
        }
      }

      // Privacy Blur Zone (DPDP Act Compliance: represents an ~1.1km coarse zone)
      const privacyCircle = L.circle([coords.lat, coords.lng], {
        radius: 950, // 950m privacy radius
        color: strokeColor,
        weight: 1.2,
        dashArray: isEligible ? '4, 4' : '2, 4',
        fillColor: fillColor,
        fillOpacity: isEligible ? 0.16 : 0.08,
      });
      layerGroup.addLayer(privacyCircle);

      // Centered privacy donor token
      const donorTokenHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group -translate-x-1/2 -translate-y-1/2">
          <div class="${badgeBg} text-white font-black text-[11px] px-2 py-0.5 rounded-full shadow-md border-2 border-white flex items-center gap-1 transition-transform group-hover:scale-110">
            <span>${match.candidate.bloodGroup}</span>
            <span class="text-[9px] opacity-90">${match.distanceKm}km</span>
          </div>
        </div>
      `;

      const donorIcon = L.divIcon({
        className: 'custom-donor-pin',
        html: donorTokenHtml,
        iconSize: [44, 24],
        iconAnchor: [22, 12],
      });

      const donorMarker = L.marker([coords.lat, coords.lng], { icon: donorIcon });

      donorMarker.on('click', () => {
        setActiveDonor(match);
        if (onSelectDonor) onSelectDonor(match);
      });

      layerGroup.addLayer(donorMarker);
    });
  }, [
    targetCoords,
    targetName,
    searchRadiusKm,
    targetBloodGroup,
    targetComponent,
    evaluatedMatches,
    showIneligible,
    onSelectDonor,
  ]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([targetCoords.lat, targetCoords.lng], 12);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-soft bg-white">
      {/* Top Map Header Bar */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-soft flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900">
          <MapPin className="w-4 h-4 text-brand-600" />
          <span>{targetName}</span>
        </div>
        <span className="text-slate-300">|</span>
        <div className="text-xs text-charcoal-600 flex items-center gap-1">
          <span className="font-semibold text-charcoal-800">{searchRadiusKm} km</span> radius
        </div>
        <span className="text-slate-300">|</span>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Coarse Privacy Blur Active (~1.1 km)</span>
        </div>
      </div>

      {/* Recenter & Reset Tools */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleRecenter}
          title="Recenter Map"
          className="p-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-charcoal-700 hover:text-brand-600 shadow-soft transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Actual Map Container */}
      <div ref={mapContainerRef} style={{ height }} className="w-full z-0" />

      {/* Bottom Map Legend Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-charcoal-600">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-full bg-red-600 border border-white shadow-sm inline-block"></span>
            <span>Hospital / Requisition</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white shadow-sm inline-block"></span>
            <span>Exact Blood Match (Eligible)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow-sm inline-block"></span>
            <span>Compatible Group (Eligible)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-full bg-slate-400 border border-white shadow-sm inline-block"></span>
            <span>Cooldown / Ineligible</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
          <Layers className="w-3.5 h-3.5" />
          <span>OpenStreetMap contributors</span>
        </div>
      </div>

      {/* Active Selected Donor Modal Card Drawer (if user clicks any donor on map) */}
      {activeDonor && (
        <div className="absolute bottom-12 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[1000] bg-white rounded-2xl border border-slate-200 shadow-soft-xl p-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-brand-50 text-brand-700 border border-brand-200">
                  {activeDonor.candidate.bloodGroup}
                </span>
                <span className="text-xs font-bold text-charcoal-900">
                  {activeDonor.candidate.maskedName}
                </span>
              </div>
              <p className="text-xs text-charcoal-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-600" />
                <span>{activeDonor.candidate.locality} (~{activeDonor.distanceKm} km from hospital)</span>
              </p>
            </div>
            <button
              onClick={() => setActiveDonor(null)}
              className="text-slate-400 hover:text-slate-600 text-xs p-1"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-charcoal-500">Eligibility Status:</span>
              <span
                className={`font-bold ${
                  activeDonor.isEligibleOverall ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {activeDonor.isEligibleOverall ? 'Eligible for Dispatch' : 'Ineligible / Cooldown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Last Donation:</span>
              <span className="font-semibold text-charcoal-800">
                {activeDonor.daysSinceLastDonation !== null
                  ? `${activeDonor.daysSinceLastDonation} days ago`
                  : 'First-time registry donor'}
              </span>
            </div>
            {!activeDonor.isRestCleared && (
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                Rest Cooldown: {activeDonor.daysUntilEligible} days remaining before 90-day clearance.
              </div>
            )}
          </div>

          <div className="mt-3.5 flex items-center gap-2">
            <button
              type="button"
              disabled={!activeDonor.isEligibleOverall}
              onClick={() => {
                if (onRequestAlert) onRequestAlert(activeDonor);
              }}
              className="flex-1 py-2 text-xs font-bold rounded-xl text-white bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-soft transition-colors flex items-center justify-center gap-1.5"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Send Emergency Ping</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
