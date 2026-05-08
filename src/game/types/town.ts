import type { ResourceName } from '@stores/expeditionStore';

export type ShopResource = Extract<
  ResourceName,
  'food' | 'medicine' | 'ammo' | 'wagonParts'
>;

export type TownShopItem = {
  resource: ShopResource;
  label: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
};

export type Town = {
  id: string;
  name: string;
  distance: number;
  description: string;
  innCost: number;
  repairCost: number;
  recruitCost: number;
  rumor: string;
  shop: TownShopItem[];
};
