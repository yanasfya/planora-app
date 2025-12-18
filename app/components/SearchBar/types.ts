export interface DietaryPreferences {
  halal: boolean;
  nutAllergy: boolean;
  seafoodAllergy: boolean;
  vegetarian: boolean;
  vegan: boolean;
  wheelchairAccessible: boolean;
}

export interface SearchData {
  destination: string;
  startDate: Date | null;
  endDate: Date | null;
  groupType: 'solo' | 'couple' | 'family' | 'friends';
  adults: number;
  children: number;
  infants: number;
  budget: 'low' | 'medium' | 'high';
  dietaryPreferences?: DietaryPreferences;
}

export type DropdownType = 'where' | 'when' | 'who' | 'budget' | null;
