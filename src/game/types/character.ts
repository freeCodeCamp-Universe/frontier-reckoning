export type CharacterSkill =
  | 'navigation'
  | 'medicine'
  | 'hunting'
  | 'repair'
  | 'cooking'
  | 'foraging'
  | 'bartering'
  | 'morale';

export type CharacterStatus = 'healthy' | 'sick' | 'injured' | 'dead';

export type Character = {
  id: string;
  name: string;
  age: number;
  role: string;
  health: number;
  morale: number;
  skills: CharacterSkill[];
  status: CharacterStatus;
  traits: string[];
};
