import type { Property } from '../types/Property';

export type BudgetMode = 'ranges' | 'custom';

export type MobileFilters = {
  searchQuery: string;
  selectedTypes: string[];
  selectedSubTypes: string[];
  selectedBedrooms: string[];
  budgetMode: BudgetMode;
  selectedBudgetRanges: string[];
  minPrice: string;
  maxPrice: string;
  minSqft: string;
  maxSqft: string;
  selectedFacing: string[];
  selectedAreas: string[];
};

export type FilterPropertyLite = Pick<
  Property,
  'title' | 'propertyType' | 'subType' | 'beds' | 'price' | 'priceFrom' | 'sqft' | 'area'
> & {
  facing?: string;
  isNewProject?: boolean;
};

