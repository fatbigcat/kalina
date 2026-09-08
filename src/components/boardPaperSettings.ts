import defaults from '../data/board-papers.json';
import type { PaperType } from './Paper';
import { magnetTypes, type MagnetType } from './Magnet';
import type { WritingVariant } from './WrittenText';

export type BoardPaperSettings = {
  id: string; label: string; type: PaperType; width: number; rotation: number;
  writingStyle: WritingVariant; fontSize: number;
  paddingTop: number; paddingRight: number; paddingBottom: number; paddingLeft: number;
  magnetX: number; magnetY: number; magnetSize: number; magnet: MagnetType | 'auto'; text: string;
};

export const defaultBoardPapers = defaults as BoardPaperSettings[];
export const paperSettingRanges = {
  width: [120, 480], fontSize: [16, 40], paddingTop: [0, 40], paddingRight: [0, 40],
  paddingBottom: [0, 40], paddingLeft: [0, 40], magnetX: [-25, 125], magnetY: [-25, 125],
  magnetSize: [5, 60],
} as const;

export function validBoardPapers(value: unknown): value is BoardPaperSettings[] {
  if (!Array.isArray(value) || value.length !== defaultBoardPapers.length) return false;
  return value.every((item, index) => {
    if (!item || typeof item !== 'object') return false;
    const base = defaultBoardPapers[index];
    return item.id === base.id && item.label === base.label &&
      item.type === base.type &&
      ['pen', 'pencil', 'marker'].includes(item.writingStyle) &&
      (item.magnet === 'auto' || magnetTypes.includes(item.magnet)) &&
      typeof item.text === 'string' && item.text.length <= 1000 &&
      Number.isFinite(item.rotation) && Math.abs(item.rotation) <= 15 &&
      Number.isFinite(item.fontSize) && item.fontSize >= 16 && item.fontSize <= 40 &&
      Object.entries(paperSettingRanges).every(([key, [min, max]]) =>
        Number.isFinite(item[key]) && item[key] >= min && item[key] <= max);
  });
}
