import { FDAAllergen } from '../types';

export interface FDAAllergenConfig {
  id: FDAAllergen;
  label: string;
  shortCode: string;
  dotColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  icon: string;
  fdaCategoryName: string;
  description: string;
}

export const FDA_ALLERGENS: FDAAllergenConfig[] = [
  {
    id: 'milk',
    label: 'Milk / Dairy',
    shortCode: 'MLK',
    dotColor: 'bg-sky-400',
    badgeBg: 'bg-sky-500/20',
    badgeBorder: 'border-sky-500/40',
    badgeText: 'text-sky-300',
    icon: '🥛',
    fdaCategoryName: 'Milk',
    description: 'Cow milk, butter, cheese, cream, whey, casein'
  },
  {
    id: 'eggs',
    label: 'Eggs',
    shortCode: 'EGG',
    dotColor: 'bg-amber-300',
    badgeBg: 'bg-amber-500/20',
    badgeBorder: 'border-amber-400/40',
    badgeText: 'text-amber-200',
    icon: '🥚',
    fdaCategoryName: 'Eggs',
    description: 'Whole eggs, albumin, egg whites, yolks, mayonnaise'
  },
  {
    id: 'fish',
    label: 'Fish',
    shortCode: 'FSH',
    dotColor: 'bg-teal-400',
    badgeBg: 'bg-teal-500/20',
    badgeBorder: 'border-teal-400/40',
    badgeText: 'text-teal-300',
    icon: '🐟',
    fdaCategoryName: 'Fish',
    description: 'Cod, salmon, tuna, bass, flounder, anchovy, fish sauce'
  },
  {
    id: 'crustacean',
    label: 'Shellfish',
    shortCode: 'SHL',
    dotColor: 'bg-rose-500',
    badgeBg: 'bg-rose-500/20',
    badgeBorder: 'border-rose-500/40',
    badgeText: 'text-rose-300',
    icon: '🦐',
    fdaCategoryName: 'Crustacean shellfish',
    description: 'Shrimp, crab, lobster, prawns, crayfish'
  },
  {
    id: 'tree_nuts',
    label: 'Tree Nuts',
    shortCode: 'NUT',
    dotColor: 'bg-orange-500',
    badgeBg: 'bg-orange-500/20',
    badgeBorder: 'border-orange-500/40',
    badgeText: 'text-orange-300',
    icon: '🌰',
    fdaCategoryName: 'Tree nuts',
    description: 'Almonds, walnuts, pecans, cashews, pistachios, hazelnuts'
  },
  {
    id: 'peanuts',
    label: 'Peanuts',
    shortCode: 'PNT',
    dotColor: 'bg-amber-600',
    badgeBg: 'bg-amber-700/25',
    badgeBorder: 'border-amber-600/40',
    badgeText: 'text-amber-400',
    icon: '🥜',
    fdaCategoryName: 'Peanuts',
    description: 'Peanuts, peanut butter, peanut flour, peanut oil'
  },
  {
    id: 'wheat',
    label: 'Wheat / Gluten',
    shortCode: 'WHT',
    dotColor: 'bg-yellow-400',
    badgeBg: 'bg-yellow-500/20',
    badgeBorder: 'border-yellow-400/40',
    badgeText: 'text-yellow-200',
    icon: '🌾',
    fdaCategoryName: 'Wheat',
    description: 'Wheat, flour, breadcrumbs, soy sauce (wheat-brewed), pasta'
  },
  {
    id: 'soybeans',
    label: 'Soybeans',
    shortCode: 'SOY',
    dotColor: 'bg-emerald-500',
    badgeBg: 'bg-emerald-500/20',
    badgeBorder: 'border-emerald-500/40',
    badgeText: 'text-emerald-300',
    icon: '🌱',
    fdaCategoryName: 'Soybeans',
    description: 'Soy sauce, tofu, edamame, miso, soy lecithin'
  },
  {
    id: 'sesame',
    label: 'Sesame',
    shortCode: 'SES',
    dotColor: 'bg-purple-400',
    badgeBg: 'bg-purple-500/20',
    badgeBorder: 'border-purple-400/40',
    badgeText: 'text-purple-300',
    icon: '⚪',
    fdaCategoryName: 'Sesame (FASTER Act)',
    description: 'Sesame seeds, tahini, sesame oil, brioche topping'
  }
];

export const ALLERGEN_MAP = new Map<FDAAllergen, FDAAllergenConfig>(
  FDA_ALLERGENS.map(a => [a.id, a])
);

export function getAllergenInfo(id: FDAAllergen): FDAAllergenConfig | undefined {
  return ALLERGEN_MAP.get(id);
}
