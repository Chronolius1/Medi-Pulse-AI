import { ExternalLink, MapPin, Phone, Star, Trash2 } from 'lucide-react';
import { openMapsForDoctor } from '../../lib/maps';
import type { Doctor } from '../../types';
import { Button } from '../ui';

export function DoctorCard({
  doctor,
  location,
  onRemove,
}: {
  doctor: Doctor;
  location: string;
  onRemove?: (id: string) => void;
}) {
  return (
    <div className="space-y-2.5 rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:-translate-y-0.5 hover:border-blue-500 motion-reduce:hover:translate-y-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight text-white">{doctor.name}</p>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-400">
            {doctor.specialty}
          </span>
        </div>
        {doctor.distance && (
          <span className="shrink-0 whitespace-nowrap rounded-full border border-emerald-800/50 bg-emerald-950/50 px-2 py-0.5 text-[10px] text-emerald-400">
            {doctor.distance}
          </span>
        )}
      </div>

      {doctor.clinic && (
        <p className="text-xs font-medium text-slate-400">{doctor.clinic}</p>
      )}
      {doctor.focus && <p className="text-[11px] text-slate-500">{doctor.focus}</p>}

      <div className="space-y-1 border-t border-slate-800 pt-2 text-[11px] text-slate-400">
        {doctor.address && (
          <p className="flex items-start gap-1.5">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-slate-500" aria-hidden />
            <span>{doctor.address}</span>
          </p>
        )}
        {doctor.phone && (
          <p className="flex items-center gap-1.5">
            <Phone className="h-3 w-3 shrink-0 text-slate-500" aria-hidden />
            <a href={`tel:${doctor.phone}`} className="text-blue-400 hover:underline">
              {doctor.phone}
            </a>
          </p>
        )}
        {doctor.rating && (
          <p className="flex items-center gap-1.5">
            <Star className="h-3 w-3 shrink-0 text-amber-400" aria-hidden />
            <span className="text-amber-300">{doctor.rating}</span>
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1"
          icon={<ExternalLink className="h-3 w-3" aria-hidden />}
          onClick={() => openMapsForDoctor(doctor, location)}
        >
          Open in Maps
        </Button>
        {onRemove && (
          <Button
            size="sm"
            variant="ghost"
            aria-label={`Remove ${doctor.name} from saved providers`}
            className="text-rose-400 hover:bg-rose-950"
            onClick={() => onRemove(doctor.id)}
            icon={<Trash2 className="h-3 w-3" aria-hidden />}
          />
        )}
      </div>
    </div>
  );
}
