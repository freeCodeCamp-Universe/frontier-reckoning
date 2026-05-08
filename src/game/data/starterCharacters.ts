import type { Character } from '@game/types/character';

export const starterCharacters: Character[] = [
  {
    id: 'scout',
    name: 'Elias Reed',
    age: 31,
    role: 'Scout',
    health: 100,
    morale: 80,
    skills: ['navigation', 'foraging'],
    status: 'healthy',
    traits: ['Observant', 'Restless'],
  },
  {
    id: 'doctor',
    name: 'Mara Bell',
    age: 42,
    role: 'Doctor',
    health: 100,
    morale: 75,
    skills: ['medicine', 'morale'],
    status: 'healthy',
    traits: ['Steady', 'Pragmatic'],
  },
  {
    id: 'hunter',
    name: 'Jonah Vale',
    age: 28,
    role: 'Hunter',
    health: 100,
    morale: 78,
    skills: ['hunting', 'foraging'],
    status: 'healthy',
    traits: ['Patient', 'Sharp-eyed'],
  },
  {
    id: 'mechanic',
    name: 'Ada Flint',
    age: 36,
    role: 'Mechanic',
    health: 100,
    morale: 72,
    skills: ['repair', 'bartering'],
    status: 'healthy',
    traits: ['Inventive', 'Stubborn'],
  },
  {
    id: 'cook',
    name: 'Silas Pike',
    age: 54,
    role: 'Cook',
    health: 100,
    morale: 82,
    skills: ['cooking', 'morale'],
    status: 'healthy',
    traits: ['Warm', 'Resourceful'],
  },
  {
    id: 'child',
    name: 'Nell Carter',
    age: 11,
    role: 'Child',
    health: 100,
    morale: 88,
    skills: ['foraging', 'morale'],
    status: 'healthy',
    traits: ['Curious', 'Hopeful'],
  },
];

export function createStartingParty(characterIds?: string[]) {
  const selectedCharacters = characterIds
    ? characterIds
        .map((id) => starterCharacters.find((character) => character.id === id))
        .filter((character): character is Character => Boolean(character))
    : starterCharacters.slice(0, 4);

  return selectedCharacters.map((character) => ({
    ...character,
    skills: [...character.skills],
    traits: [...character.traits],
  }));
}
