import type { Doctor } from '../types';

/**
 * SAMPLE DATA — these are not real providers.
 *
 * Ported from `curatedSpecialists` in med.js. The names, ratings, distances and
 * phone numbers are all fabricated. The UI labels this section explicitly so it
 * is never mistaken for a real referral directory; the "Search Google Maps"
 * action is the path to actual providers.
 */
export const curatedSpecialists: Doctor[] = [
  {
    id: 'spec-thorne',
    name: 'Dr. Aris Thorne, MD, FACE',
    specialty: 'Endocrinologist',
    clinic: 'Metropolitan Endocrine & Diabetes Center',
    rating: '4.9 ★ (140+ reviews)',
    distance: '0.8 miles away',
    address: '145 E 54th St, Suite 4B',
    phone: '(555) 234-8901',
    focus: 'Type 1 & 2 Diabetes, Thyroid Nodules, Metabolic Syndrome',
    source: 'curated',
  },
  {
    id: 'spec-rostova',
    name: 'Dr. Elena Rostova, MD',
    specialty: 'Endocrinologist',
    clinic: 'City Diabetes & Hormone Institute',
    rating: '4.8 ★ (98 reviews)',
    distance: '1.6 miles away',
    address: '420 Lexington Ave, Fl 8',
    phone: '(555) 890-1234',
    focus: 'Insulin Resistance, Hypothyroidism, Adrenal Disorders',
    source: 'curated',
  },
  {
    id: 'spec-vance',
    name: 'Dr. Marcus Vance, MD, PhD',
    specialty: 'Hematologist',
    clinic: 'Alliance Comprehensive Hematology',
    rating: '4.9 ★ (115 reviews)',
    distance: '1.2 miles away',
    address: '230 Central Park West, Ste 1A',
    phone: '(555) 345-6789',
    focus: 'Iron Deficiency Anemia, Ferritin Depletion, Microcytic Anemias',
    source: 'curated',
  },
  {
    id: 'spec-nair',
    name: 'Dr. Priya Nair, MD',
    specialty: 'Hematologist',
    clinic: 'University Blood & Marrow Specialists',
    rating: '4.8 ★ (84 reviews)',
    distance: '2.4 miles away',
    address: '550 1st Avenue, Clinic 3',
    phone: '(555) 901-2345',
    focus: 'Hemoglobinopathies, Coagulation Studies, Anemia Workup',
    source: 'curated',
  },
  {
    id: 'spec-bennett',
    name: 'Dr. Julian Bennett, MD, FACC',
    specialty: 'Cardiologist',
    clinic: 'Empire Cardiovascular Center',
    rating: '5.0 ★ (210 reviews)',
    distance: '0.9 miles away',
    address: '110 E 59th St, 12th Floor',
    phone: '(555) 456-7890',
    focus: 'Dyslipidemia, Hypertension Management, Arterial Risk Screening',
    source: 'curated',
  },
  {
    id: 'spec-chen',
    name: 'Dr. David Chen, MD',
    specialty: 'Primary Care',
    clinic: 'Midtown Primary Care Associates',
    rating: '4.9 ★ (340 reviews)',
    distance: '0.5 miles away',
    address: '630 5th Avenue, Suite 200',
    phone: '(555) 567-8901',
    focus: 'Comprehensive Health Synthesis, Preventive Lab Review, Adult Medicine',
    source: 'curated',
  },
  {
    id: 'spec-jenkins',
    name: 'Dr. Sarah Jenkins, MD',
    specialty: 'Primary Care',
    clinic: 'Hudson Health Medical Group',
    rating: '4.8 ★ (185 reviews)',
    distance: '1.1 miles away',
    address: '787 11th Ave, 5th Floor',
    phone: '(555) 678-9012',
    focus: 'Routine Care, Medication Review, Chronic Condition Coordination',
    source: 'curated',
  },
  {
    id: 'spec-miller',
    name: 'Dr. Robert Miller, MD, FACG',
    specialty: 'Gastroenterologist',
    clinic: 'Digestive Health & Endoscopy Pavilion',
    rating: '4.8 ★ (130 reviews)',
    distance: '1.4 miles away',
    address: '1283 York Ave, Suite 601',
    phone: '(555) 789-0123',
    focus: 'Gastritis, Malabsorption Syndromes, GI Bleed / Iron Loss Evaluation',
    source: 'curated',
  },
];

export const SPECIALTIES = [
  'Endocrinologist',
  'Hematologist',
  'Cardiologist',
  'Primary Care',
  'Gastroenterologist',
] as const;
