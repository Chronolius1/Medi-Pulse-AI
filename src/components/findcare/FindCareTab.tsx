import { useMemo, useState } from 'react';
import {
  Info,
  MapPin,
  Navigation,
  Search,
  Stethoscope,
  UserPlus,
  Users,
} from 'lucide-react';
import clsx from 'clsx';
import { SPECIALTIES, curatedSpecialists } from '../../data/specialists';
import { useAppDispatch, useAppState } from '../../hooks/useApp';
import { useToast } from '../../hooks/useToast';
import { buildCareRecommendation } from '../../lib/careRecommendation';
import { detectUserLocation } from '../../lib/geolocation';
import { searchSpecialtyOnMaps } from '../../lib/maps';
import { selectCurrentRecord } from '../../state/selectors';
import { Button, Card, EmptyState, Input, SectionHeader, Select } from '../ui';
import { AddDoctorModal } from './AddDoctorModal';
import { DoctorCard } from './DoctorCard';

export function FindCareTab() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [locating, setLocating] = useState(false);

  const record = selectCurrentRecord(state);
  const recommendation = useMemo(
    () => buildCareRecommendation(record?.labs ?? []),
    [record],
  );

  const { location, specialty, custom, showSampleData } = state.doctors;

  const filtered = useMemo(
    () =>
      specialty === 'ALL'
        ? curatedSpecialists
        : curatedSpecialists.filter((d) => d.specialty === specialty),
    [specialty],
  );

  const detect = async () => {
    setLocating(true);
    try {
      const detected = await detectUserLocation();
      dispatch({ type: 'doctors/setLocation', location: detected });
      toast.success('Location detected', detected);
    } catch (err) {
      toast.error(
        'Could not detect location',
        err instanceof Error ? err.message : 'Enter your city manually.',
      );
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card
        className={clsx(
          'space-y-2 border-l-4 p-4',
          recommendation.tone === 'matched' && 'border-l-blue-500',
          recommendation.tone === 'normal' && 'border-l-emerald-500',
          recommendation.tone === 'neutral' && 'border-l-slate-700',
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-300">
            <Stethoscope className="h-4 w-4 text-blue-400" aria-hidden />
            Care recommendation
          </h2>
          <span
            className={clsx(
              'rounded-full border px-2.5 py-0.5 text-[10px] font-medium',
              recommendation.tone === 'matched' && 'border-blue-800 bg-blue-950 text-blue-300',
              recommendation.tone === 'normal' &&
                'border-emerald-800 bg-emerald-950 text-emerald-300',
              recommendation.tone === 'neutral' &&
                'border-slate-700 bg-slate-800 text-slate-400',
            )}
          >
            {recommendation.badge}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-slate-300">{recommendation.text}</p>
        {recommendation.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {recommendation.specialties.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={specialty === s ? 'primary' : 'secondary'}
                onClick={() => dispatch({ type: 'doctors/setSpecialty', specialty: s })}
              >
                Show {s}s
              </Button>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-3 p-4">
        <SectionHeader
          icon={<MapPin className="h-4 w-4 text-blue-400" aria-hidden />}
          title="Where to look"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="care-location"
              className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400"
            >
              Your location
            </label>
            <Input
              id="care-location"
              value={location}
              onChange={(e) =>
                dispatch({ type: 'doctors/setLocation', location: e.target.value })
              }
              placeholder="City, State"
            />
          </div>
          <div>
            <label
              htmlFor="care-specialty"
              className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400"
            >
              Specialty
            </label>
            <Select
              id="care-specialty"
              value={specialty}
              onChange={(e) =>
                dispatch({ type: 'doctors/setSpecialty', specialty: e.target.value })
              }
            >
              <option value="ALL">All specialties</option>
              {SPECIALTIES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            loading={locating}
            icon={locating ? undefined : <Navigation className="h-3.5 w-3.5" aria-hidden />}
            onClick={() => void detect()}
          >
            Detect my location
          </Button>
          <Button
            variant="primary"
            icon={<Search className="h-3.5 w-3.5" aria-hidden />}
            onClick={() => searchSpecialtyOnMaps(specialty, location)}
          >
            Find real providers on Google Maps
          </Button>
        </div>
      </Card>

      <Card className="space-y-3 p-4">
        <SectionHeader
          icon={<Users className="h-4 w-4 text-blue-400" aria-hidden />}
          title="Sample directory"
          action={
            <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-slate-400">
              <input
                type="checkbox"
                checked={showSampleData}
                onChange={(e) =>
                  dispatch({ type: 'doctors/toggleSampleData', show: e.target.checked })
                }
                className="accent-blue-600"
              />
              Show
            </label>
          }
        />
        {/* These entries are fabricated. Labelling this unambiguously matters:
            the original presented them as a real referral directory. */}
        <p className="flex items-start gap-1.5 rounded-lg border border-amber-900/60 bg-amber-950/30 p-2.5 text-[11px] leading-relaxed text-amber-300">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>
            <strong>Demo data — these are not real providers.</strong> The names, ratings,
            distances and phone numbers below are fictional placeholders. Use “Find real
            providers on Google Maps” above to search actual clinicians near you.
          </span>
        </p>

        {showSampleData &&
          (filtered.length === 0 ? (
            <EmptyState
              title="No sample providers for this specialty"
              body="Choose a different specialty, or search Google Maps for real providers."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} location={location} />
              ))}
            </div>
          ))}
      </Card>

      <Card className="space-y-3 p-4">
        <SectionHeader
          icon={<UserPlus className="h-4 w-4 text-blue-400" aria-hidden />}
          title="Your saved providers"
          action={
            <Button size="sm" onClick={() => setAddOpen(true)}>
              Add provider
            </Button>
          }
        />
        {custom.length === 0 ? (
          <EmptyState
            icon={<UserPlus className="h-6 w-6" aria-hidden />}
            title="No saved providers"
            body="Save your own clinicians here so they persist alongside your records."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {custom.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                location={location}
                onRemove={(id) => dispatch({ type: 'doctors/remove', id })}
              />
            ))}
          </div>
        )}
      </Card>

      <AddDoctorModal open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
