import type { GameEvent, GameEventType } from '@game/types/event';

export type EventSceneMood =
  | 'campfire'
  | 'danger'
  | 'dust'
  | 'market'
  | 'moon'
  | 'prairie'
  | 'sick'
  | 'storm'
  | 'sunset'
  | 'water';

export type EventSceneProp =
  | 'ammo'
  | 'animal_tracks'
  | 'bandit'
  | 'bridge'
  | 'broken_wagon'
  | 'campfire'
  | 'cards'
  | 'child'
  | 'claw_marks'
  | 'crates'
  | 'dust_wall'
  | 'fire_map'
  | 'food'
  | 'guide'
  | 'handcart'
  | 'herbs'
  | 'lantern'
  | 'medicine'
  | 'prayer'
  | 'pump'
  | 'river'
  | 'rope'
  | 'sick_bed'
  | 'signpost'
  | 'snake'
  | 'stranger'
  | 'supplies'
  | 'tools'
  | 'wagon'
  | 'wagon_repair'
  | 'warning_tracks';

export type EventSceneFigure =
  | 'arguing_pair'
  | 'bandit'
  | 'cardsharp'
  | 'child'
  | 'family'
  | 'guide'
  | 'hunter'
  | 'lookout'
  | 'mechanic'
  | 'onlookers'
  | 'rider'
  | 'scout'
  | 'seated'
  | 'sick'
  | 'singer'
  | 'stranger'
  | 'thief'
  | 'traveler';

export type EventSceneConfig = {
  id: string;
  mood: EventSceneMood;
  subject: string;
  props: EventSceneProp[];
  figures: EventSceneFigure[];
  focus: 'camp' | 'danger' | 'market' | 'supplies' | 'trail' | 'wagon' | 'water';
  light: 'cold' | 'dawn' | 'fire' | 'harsh' | 'lantern' | 'moon' | 'storm' | 'sunset';
};

export type EventIllustrationKind =
  | 'storm'
  | 'sickness'
  | 'trader'
  | 'bandit'
  | 'river'
  | 'hunting'
  | 'wagon_damage'
  | 'campfire'
  | 'town'
  | 'ridge_scouting'
  | 'bad_water'
  | 'predator_hunt'
  | 'stolen_tack'
  | 'night_watch_song'
  | 'rattlesnake_strike'
  | 'guide_for_ammo'
  | 'ration_dispute'
  | 'discovery';

export const eventSceneConfigs = {
  'broken-axle': {
    id: 'broken-axle',
    mood: 'sunset',
    subject: 'wagon repair at Split-Stone Rise',
    props: ['wagon', 'wagon_repair', 'tools', 'broken_wagon'],
    figures: ['mechanic', 'onlookers'],
    focus: 'wagon',
    light: 'sunset',
  },
  'spoiled-food': {
    id: 'spoiled-food',
    mood: 'moon',
    subject: 'soured food crate in cold fog',
    props: ['crates', 'food', 'supplies'],
    figures: ['traveler'],
    focus: 'supplies',
    light: 'moon',
  },
  'suspicious-trader': {
    id: 'suspicious-trader',
    mood: 'market',
    subject: 'discount medicine bargain',
    props: ['medicine', 'crates', 'wagon'],
    figures: ['stranger', 'traveler'],
    focus: 'market',
    light: 'sunset',
  },
  'hunting-opportunity': {
    id: 'hunting-opportunity',
    mood: 'prairie',
    subject: 'fresh tracks across salt grass',
    props: ['animal_tracks', 'food'],
    figures: ['hunter'],
    focus: 'trail',
    light: 'harsh',
  },
  illness: {
    id: 'illness',
    mood: 'sick',
    subject: 'trail fever at sunset',
    props: ['sick_bed', 'medicine', 'wagon'],
    figures: ['sick', 'traveler'],
    focus: 'camp',
    light: 'lantern',
  },
  'campfire-morale': {
    id: 'campfire-morale',
    mood: 'campfire',
    subject: 'stories around the fire',
    props: ['campfire', 'wagon'],
    figures: ['seated', 'singer', 'onlookers'],
    focus: 'camp',
    light: 'fire',
  },
  'abandoned-wagon': {
    id: 'abandoned-wagon',
    mood: 'dust',
    subject: 'picked-over wagon beside trail',
    props: ['broken_wagon', 'supplies', 'tools'],
    figures: ['scout'],
    focus: 'wagon',
    light: 'harsh',
  },
  'bandit-warning': {
    id: 'bandit-warning',
    mood: 'danger',
    subject: 'warning rider at western ridge',
    props: ['warning_tracks', 'signpost'],
    figures: ['rider', 'traveler'],
    focus: 'danger',
    light: 'sunset',
  },
  'storm-damage': {
    id: 'storm-damage',
    mood: 'storm',
    subject: 'canvas and flooded crates',
    props: ['wagon', 'crates', 'river'],
    figures: ['traveler'],
    focus: 'wagon',
    light: 'storm',
  },
  'lost-trail': {
    id: 'lost-trail',
    mood: 'dust',
    subject: 'bad landmarks near Pale Mesa',
    props: ['signpost', 'warning_tracks', 'wagon'],
    figures: ['scout'],
    focus: 'trail',
    light: 'harsh',
  },
  snakebite: {
    id: 'snakebite',
    mood: 'danger',
    subject: 'rattlesnake hidden in brush',
    props: ['snake', 'warning_tracks'],
    figures: ['traveler'],
    focus: 'danger',
    light: 'harsh',
  },
  'loose-wheel': {
    id: 'loose-wheel',
    mood: 'dust',
    subject: 'loose wagon wheel at roadside',
    props: ['wagon', 'wagon_repair', 'tools'],
    figures: ['mechanic'],
    focus: 'wagon',
    light: 'harsh',
  },
  'bad-water': {
    id: 'bad-water',
    mood: 'water',
    subject: 'murky creek and tipped cup',
    props: ['river', 'medicine'],
    figures: ['traveler'],
    focus: 'water',
    light: 'harsh',
  },
  'tool-theft': {
    id: 'tool-theft',
    mood: 'moon',
    subject: 'missing repair kit near night camp',
    props: ['tools', 'wagon', 'warning_tracks'],
    figures: ['thief'],
    focus: 'danger',
    light: 'moon',
  },
  'market-day': {
    id: 'market-day',
    mood: 'market',
    subject: 'roadside market tables',
    props: ['food', 'ammo', 'crates', 'wagon'],
    figures: ['traveler', 'stranger'],
    focus: 'market',
    light: 'sunset',
  },
  'stranded-travelers': {
    id: 'stranded-travelers',
    mood: 'prairie',
    subject: 'hungry family by handcart',
    props: ['handcart', 'food'],
    figures: ['family', 'traveler'],
    focus: 'supplies',
    light: 'sunset',
  },
  'medicine-for-parts': {
    id: 'medicine-for-parts',
    mood: 'market',
    subject: 'medicine traded for wagon fittings',
    props: ['medicine', 'wagon_repair', 'tools'],
    figures: ['mechanic', 'stranger'],
    focus: 'market',
    light: 'sunset',
  },
  'dangerous-shortcut': {
    id: 'dangerous-shortcut',
    mood: 'danger',
    subject: 'narrow pass through harsh rock',
    props: ['signpost', 'wagon', 'warning_tracks'],
    figures: ['scout'],
    focus: 'trail',
    light: 'harsh',
  },
  'predator-hunt': {
    id: 'predator-hunt',
    mood: 'danger',
    subject: 'elk tracks crossing claw marks',
    props: ['animal_tracks', 'claw_marks'],
    figures: ['hunter'],
    focus: 'danger',
    light: 'moon',
  },
  'unstable-bridge': {
    id: 'unstable-bridge',
    mood: 'danger',
    subject: 'rope bridge over ravine',
    props: ['bridge', 'rope', 'wagon'],
    figures: ['mechanic'],
    focus: 'trail',
    light: 'sunset',
  },
  'stranger-camp': {
    id: 'stranger-camp',
    mood: 'campfire',
    subject: 'unknown stranger at the fire',
    props: ['campfire', 'wagon'],
    figures: ['stranger', 'seated'],
    focus: 'camp',
    light: 'fire',
  },
  'trader-supplies': {
    id: 'trader-supplies',
    mood: 'market',
    subject: 'mule trader supply bundle',
    props: ['food', 'ammo', 'wagon_repair', 'crates'],
    figures: ['stranger', 'traveler'],
    focus: 'market',
    light: 'sunset',
  },
  'settler-repair': {
    id: 'settler-repair',
    mood: 'prairie',
    subject: 'settler pump repair',
    props: ['pump', 'tools', 'supplies'],
    figures: ['mechanic', 'onlookers'],
    focus: 'supplies',
    light: 'harsh',
  },
  'guide-for-ammo': {
    id: 'guide-for-ammo',
    mood: 'sunset',
    subject: 'guide at trail fork for ammo',
    props: ['guide', 'ammo', 'signpost', 'wagon'],
    figures: ['guide', 'traveler'],
    focus: 'trail',
    light: 'sunset',
  },
  'low-spirits-speech': {
    id: 'low-spirits-speech',
    mood: 'campfire',
    subject: 'speech over low spirits',
    props: ['campfire', 'wagon'],
    figures: ['seated', 'traveler', 'onlookers'],
    focus: 'camp',
    light: 'fire',
  },
  'ridge-scouting': {
    id: 'ridge-scouting',
    mood: 'sunset',
    subject: 'scout on ridge with water below',
    props: ['river', 'signpost', 'animal_tracks'],
    figures: ['scout'],
    focus: 'trail',
    light: 'sunset',
  },
  'ration-dispute': {
    id: 'ration-dispute',
    mood: 'sunset',
    subject: 'argument over food stores',
    props: ['food', 'crates', 'supplies', 'wagon'],
    figures: ['arguing_pair', 'onlookers'],
    focus: 'supplies',
    light: 'lantern',
  },
  'toll-bridge-trader': {
    id: 'toll-bridge-trader',
    mood: 'market',
    subject: 'bridge keeper at chain crossing',
    props: ['bridge', 'rope', 'crates'],
    figures: ['stranger', 'traveler'],
    focus: 'trail',
    light: 'sunset',
  },
  'bandit-parley': {
    id: 'bandit-parley',
    mood: 'danger',
    subject: 'scarfed lookout bargaining for passage',
    props: ['bandit', 'warning_tracks', 'signpost'],
    figures: ['lookout', 'traveler'],
    focus: 'danger',
    light: 'sunset',
  },
  'campfire-vow': {
    id: 'campfire-vow',
    mood: 'campfire',
    subject: 'debate under red sparks',
    props: ['campfire', 'wagon'],
    figures: ['seated', 'onlookers'],
    focus: 'camp',
    light: 'fire',
  },
  'sick-child': {
    id: 'sick-child',
    mood: 'sick',
    subject: 'child fever in camp',
    props: ['sick_bed', 'medicine', 'child'],
    figures: ['child', 'sick', 'traveler'],
    focus: 'camp',
    light: 'lantern',
  },
  'wagonwright-offer': {
    id: 'wagonwright-offer',
    mood: 'market',
    subject: 'wagonwright repair bargain',
    props: ['wagon', 'wagon_repair', 'tools'],
    figures: ['mechanic', 'stranger'],
    focus: 'wagon',
    light: 'sunset',
  },
  'dust-storm-route': {
    id: 'dust-storm-route',
    mood: 'storm',
    subject: 'copper wall of dust',
    props: ['dust_wall', 'wagon', 'signpost'],
    figures: ['scout'],
    focus: 'trail',
    light: 'storm',
  },
  'iron-post-cardsharp': {
    id: 'iron-post-cardsharp',
    mood: 'market',
    subject: 'marked crate card wager',
    props: ['cards', 'crates', 'food'],
    figures: ['cardsharp', 'traveler'],
    focus: 'market',
    light: 'lantern',
  },
  'herb-woman': {
    id: 'herb-woman',
    mood: 'market',
    subject: 'bitter tonics and herb advice',
    props: ['herbs', 'medicine', 'crates'],
    figures: ['stranger', 'traveler'],
    focus: 'market',
    light: 'sunset',
  },
  'lantern-guide': {
    id: 'lantern-guide',
    mood: 'moon',
    subject: 'lantern guide past sinkholes',
    props: ['lantern', 'signpost', 'wagon'],
    figures: ['guide', 'traveler'],
    focus: 'trail',
    light: 'lantern',
  },
  'night-watch-song': {
    id: 'night-watch-song',
    mood: 'campfire',
    subject: 'song around cold stars',
    props: ['campfire', 'wagon'],
    figures: ['singer', 'seated', 'onlookers'],
    focus: 'camp',
    light: 'fire',
  },
  'ember-confession': {
    id: 'ember-confession',
    mood: 'campfire',
    subject: 'confession beside last coals',
    props: ['campfire'],
    figures: ['seated', 'traveler'],
    focus: 'camp',
    light: 'fire',
  },
  'cook-pot-laughter': {
    id: 'cook-pot-laughter',
    mood: 'campfire',
    subject: 'ruined stew becomes laughter',
    props: ['campfire', 'food', 'crates'],
    figures: ['seated', 'onlookers'],
    focus: 'camp',
    light: 'fire',
  },
  'map-by-firelight': {
    id: 'map-by-firelight',
    mood: 'campfire',
    subject: 'scout studies map by fire',
    props: ['campfire', 'fire_map', 'signpost'],
    figures: ['scout'],
    focus: 'trail',
    light: 'fire',
  },
  'child-star-story': {
    id: 'child-star-story',
    mood: 'moon',
    subject: 'child names stars after wagons',
    props: ['wagon', 'child', 'campfire'],
    figures: ['child', 'seated'],
    focus: 'camp',
    light: 'moon',
  },
  'last-coal-prayer': {
    id: 'last-coal-prayer',
    mood: 'campfire',
    subject: 'quiet prayer over last coal',
    props: ['prayer', 'campfire'],
    figures: ['seated', 'traveler'],
    focus: 'camp',
    light: 'fire',
  },
  'frost-cough': {
    id: 'frost-cough',
    mood: 'sick',
    subject: 'cold dawn coughing fit',
    props: ['sick_bed', 'wagon'],
    figures: ['sick', 'traveler'],
    focus: 'camp',
    light: 'dawn',
  },
  'wagon-splinter': {
    id: 'wagon-splinter',
    mood: 'danger',
    subject: 'splintered board during repair',
    props: ['wagon_repair', 'tools', 'broken_wagon'],
    figures: ['mechanic'],
    focus: 'wagon',
    light: 'harsh',
  },
  'fever-dreams': {
    id: 'fever-dreams',
    mood: 'sick',
    subject: 'lanterns imagined under sand',
    props: ['sick_bed', 'lantern'],
    figures: ['sick'],
    focus: 'camp',
    light: 'lantern',
  },
  'twisted-ankle': {
    id: 'twisted-ankle',
    mood: 'danger',
    subject: 'limping step on shale',
    props: ['warning_tracks', 'wagon'],
    figures: ['traveler'],
    focus: 'trail',
    light: 'harsh',
  },
  'cracked-tongue': {
    id: 'cracked-tongue',
    mood: 'dust',
    subject: 'split wagon tongue under old iron',
    props: ['wagon', 'wagon_repair', 'tools'],
    figures: ['mechanic'],
    focus: 'wagon',
    light: 'harsh',
  },
  'night-riders': {
    id: 'night-riders',
    mood: 'moon',
    subject: 'riders shadowing campfire',
    props: ['campfire', 'warning_tracks'],
    figures: ['rider', 'bandit'],
    focus: 'danger',
    light: 'moon',
  },
  'ridge-ambush-sign': {
    id: 'ridge-ambush-sign',
    mood: 'danger',
    subject: 'boot prints and cut brush',
    props: ['warning_tracks', 'bandit', 'signpost'],
    figures: ['scout'],
    focus: 'danger',
    light: 'sunset',
  },
  'stolen-tack': {
    id: 'stolen-tack',
    mood: 'moon',
    subject: 'strap cut from wagon rail',
    props: ['wagon', 'rope', 'warning_tracks'],
    figures: ['thief'],
    focus: 'danger',
    light: 'moon',
  },
} satisfies Record<string, EventSceneConfig>;

export function getEventSceneConfig(id: string | undefined): EventSceneConfig | null {
  if (!id) {
    return null;
  }

  return eventSceneConfigs[id as keyof typeof eventSceneConfigs] ?? null;
}

const categoryMap: Record<string, EventIllustrationKind> = {
  bandit: 'bandit',
  campfire: 'campfire',
  discovery: 'discovery',
  hunting: 'hunting',
  navigation: 'discovery',
  river: 'river',
  sickness: 'sickness',
  sickness_injury: 'sickness',
  storm: 'storm',
  supplies: 'trader',
  survival: 'hunting',
  town: 'town',
  trader: 'trader',
  wagon_damage: 'wagon_damage',
  wagon_breakdown: 'wagon_damage',
};

const typeMap: Partial<Record<GameEventType, EventIllustrationKind>> = {
  character_injury: 'sickness',
  character_sickness: 'sickness',
  resource_gain: 'discovery',
  resource_loss: 'bandit',
  wagon_damage: 'wagon_damage',
};

export function getEventIllustrationKind(
  event:
    | (Pick<GameEvent, 'categories' | 'type' | 'title'> & Partial<Pick<GameEvent, 'id'>>)
    | { categories?: string[]; id?: string; type?: string; title?: string },
): EventIllustrationKind {
  if (event.id === 'ridge-scouting') {
    return 'ridge_scouting';
  }

  if (event.id === 'bad-water') {
    return 'bad_water';
  }

  if (event.id === 'predator-hunt') {
    return 'predator_hunt';
  }

  if (event.id === 'stolen-tack') {
    return 'stolen_tack';
  }

  if (event.id === 'night-watch-song') {
    return 'night_watch_song';
  }

  if (event.id === 'snakebite') {
    return 'rattlesnake_strike';
  }

  if (event.id === 'guide-for-ammo') {
    return 'guide_for_ammo';
  }

  if (event.id === 'ration-dispute') {
    return 'ration_dispute';
  }

  const categories = event.categories ?? [];
  const mappedCategory = categories
    .map((category) => categoryMap[category])
    .find((category): category is EventIllustrationKind => Boolean(category));

  if (mappedCategory) {
    return mappedCategory;
  }

  if (event.type && typeMap[event.type as GameEventType]) {
    return typeMap[event.type as GameEventType] ?? 'discovery';
  }

  const searchableTitle = event.title?.toLowerCase() ?? '';

  if (searchableTitle.includes('scout') && searchableTitle.includes('ridge')) {
    return 'ridge_scouting';
  }

  if (searchableTitle.includes('bad water')) {
    return 'bad_water';
  }

  if (
    searchableTitle.includes('predator') ||
    (searchableTitle.includes('hunt') && searchableTitle.includes('territory'))
  ) {
    return 'predator_hunt';
  }

  if (searchableTitle.includes('stolen tack')) {
    return 'stolen_tack';
  }

  if (searchableTitle.includes('night watch song')) {
    return 'night_watch_song';
  }

  if (searchableTitle.includes('rattlesnake')) {
    return 'rattlesnake_strike';
  }

  if (searchableTitle.includes('guide') && searchableTitle.includes('ammunition')) {
    return 'guide_for_ammo';
  }

  if (searchableTitle.includes('ration dispute')) {
    return 'ration_dispute';
  }

  if (searchableTitle.includes('river')) {
    return 'river';
  }

  if (searchableTitle.includes('storm')) {
    return 'storm';
  }

  if (searchableTitle.includes('town')) {
    return 'town';
  }

  return 'discovery';
}
