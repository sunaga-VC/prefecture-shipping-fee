export type Region = '北海道' | '本州' | '九州' | '沖縄';

export type Prefecture = {
  name: string;
  reading: string;
  region: Region;
};

export const PREFECTURES: Prefecture[] = [
  { name: '北海道', reading: 'ほっかいどう', region: '北海道' },
  { name: '青森県', reading: 'あおもり', region: '本州' },
  { name: '岩手県', reading: 'いわて', region: '本州' },
  { name: '宮城県', reading: 'みやぎ', region: '本州' },
  { name: '秋田県', reading: 'あきた', region: '本州' },
  { name: '山形県', reading: 'やまがた', region: '本州' },
  { name: '福島県', reading: 'ふくしま', region: '本州' },
  { name: '茨城県', reading: 'いばらき', region: '本州' },
  { name: '栃木県', reading: 'とちぎ', region: '本州' },
  { name: '群馬県', reading: 'ぐんま', region: '本州' },
  { name: '埼玉県', reading: 'さいたま', region: '本州' },
  { name: '千葉県', reading: 'ちば', region: '本州' },
  { name: '東京都', reading: 'とうきょう', region: '本州' },
  { name: '神奈川県', reading: 'かながわ', region: '本州' },
  { name: '新潟県', reading: 'にいがた', region: '本州' },
  { name: '富山県', reading: 'とやま', region: '本州' },
  { name: '石川県', reading: 'いしかわ', region: '本州' },
  { name: '福井県', reading: 'ふくい', region: '本州' },
  { name: '山梨県', reading: 'やまなし', region: '本州' },
  { name: '長野県', reading: 'ながの', region: '本州' },
  { name: '岐阜県', reading: 'ぎふ', region: '本州' },
  { name: '静岡県', reading: 'しずおか', region: '本州' },
  { name: '愛知県', reading: 'あいち', region: '本州' },
  { name: '三重県', reading: 'みえ', region: '本州' },
  { name: '滋賀県', reading: 'しが', region: '本州' },
  { name: '京都府', reading: 'きょうと', region: '本州' },
  { name: '大阪府', reading: 'おおさか', region: '本州' },
  { name: '兵庫県', reading: 'ひょうご', region: '本州' },
  { name: '奈良県', reading: 'なら', region: '本州' },
  { name: '和歌山県', reading: 'わかやま', region: '本州' },
  { name: '鳥取県', reading: 'とっとり', region: '本州' },
  { name: '島根県', reading: 'しまね', region: '本州' },
  { name: '岡山県', reading: 'おかやま', region: '本州' },
  { name: '広島県', reading: 'ひろしま', region: '本州' },
  { name: '山口県', reading: 'やまぐち', region: '本州' },
  { name: '福岡県', reading: 'ふくおか', region: '九州' },
  { name: '佐賀県', reading: 'さが', region: '九州' },
  { name: '長崎県', reading: 'ながさき', region: '九州' },
  { name: '熊本県', reading: 'くまもと', region: '九州' },
  { name: '大分県', reading: 'おおいた', region: '九州' },
  { name: '宮崎県', reading: 'みやざき', region: '九州' },
  { name: '鹿児島県', reading: 'かごしま', region: '九州' },
  { name: '沖縄県', reading: 'おきなわ', region: '沖縄' },
];

export const REGIONS: Region[] = ['北海道', '本州', '九州', '沖縄'];

export type Fee = number | null;
export type FeeMatrix = Record<Region, Record<Region, Fee>>;

export type FeeChange = {
  id: string;
  departure: Region;
  arrival: Region;
  previousFee: Fee;
  nextFee: Fee;
  changedAt: string;
};

export const INITIAL_FEE_MATRIX: FeeMatrix = {
  北海道: { 北海道: 5000, 本州: 6000, 九州: 7000, 沖縄: null },
  本州: { 北海道: 6000, 本州: 5000, 九州: 6000, 沖縄: 7000 },
  九州: { 北海道: 7000, 本州: 6000, 九州: 5000, 沖縄: 7000 },
  沖縄: { 北海道: null, 本州: 7000, 九州: 7000, 沖縄: null },
};

export type RouteResult = {
  departure: Prefecture;
  arrival: Prefecture;
  category: string;
  fee: Fee | null;
};

export function normalizeKana(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (character) =>
      String.fromCharCode(character.charCodeAt(0) - 0x60),
    );
}

export function searchPrefectures(query: string): Prefecture[] {
  const normalized = normalizeKana(query);
  if (!normalized) return PREFECTURES;
  return PREFECTURES.filter(
    ({ name, reading }) =>
      name.includes(query.trim()) ||
      normalizeKana(reading).includes(normalized),
  );
}

export function calculateRoute(
  departure: Prefecture,
  arrival: Prefecture,
  feeMatrix: FeeMatrix = INITIAL_FEE_MATRIX,
): RouteResult {
  const fee = feeMatrix[departure.region][arrival.region];
  const category =
    departure.region === arrival.region
      ? `同一エリア・${departure.region}`
      : `${departure.region} ↔ ${arrival.region}`;
  return { departure, arrival, category, fee };
}