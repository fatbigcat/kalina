export type Layout = 'desktop' | 'mobile';
export type BoardKind = 'letter' | 'projects' | 'music' | 'thoughts' | 'project';
export type Transform = { x: number; y: number; rotation: number; order: number };
export type Arrangement = Record<string, Transform>;
export type BoardItem = {
  id: string;
  kind: BoardKind;
  label: string;
  href?: string;
  size: Record<Layout, readonly [number, number]>;
  defaults: Record<Layout, Transform>;
};
export const DESIGN_SIZE = { desktop: [1440, 960], mobile: [390, 1240] } as const;
const at = (x: number, y: number, rotation: number, order: number): Transform => ({ x, y, rotation, order });

const letters = [
  ['K', 0.13, 0.13, 154], ['a', 0.285, 0.285, 155],
  ['l', 0.419, 0.419, 80], ['i', 0.515, 0.515, 79],
  ['n', 0.65, 0.65, 155], ['a', 0.81, 0.81, 155],
] as const;
export const BOARD_ITEMS: BoardItem[] = [
  ...letters.map(([label, x, mx, width], i): BoardItem => ({
    id: `letter-${i}`, kind: 'letter', label,
    size: { desktop: [width, 228], mobile: [width * 0.255, 62] },
    defaults: { desktop: at(x, 0.805, [ -4, 2, -2, 3, -1, 4 ][i], i + 1), mobile: at(mx, 0.135, [ -4, 2, -2, 3, -1, 4 ][i], i + 1) },
  })),
  { id: 'projects', kind: 'projects', label: 'Projects', href: '/under-construction?from=%2Fprojects', size: { desktop: [300, 184], mobile: [264, 162] }, defaults: { desktop: at(0.205, 0.235, -5, 7), mobile: at(0.45, 0.29, -4, 7) } },
  { id: 'music', kind: 'music', label: 'Music', href: '/under-construction?from=%2Fmusic', size: { desktop: [290, 140], mobile: [265, 128] }, defaults: { desktop: at(0.535, 0.17, 5, 8), mobile: at(0.54, 0.465, 4, 8) } },
  { id: 'thoughts', kind: 'thoughts', label: 'Thoughts', href: '/under-construction?from=%2Fthoughts', size: { desktop: [236, 220], mobile: [250, 190] }, defaults: { desktop: at(0.825, 0.295, 7, 9), mobile: at(0.45, 0.64, -5, 9) } },
  { id: 'island', kind: 'project', label: 'Island in the Sky', href: 'https://island-in-the-sky.vercel.app/', size: { desktop: [348, 266], mobile: [298, 242] }, defaults: { desktop: at(0.505, 0.475, -4, 10), mobile: at(0.53, 0.855, 3, 10) } },
];

export function defaultArrangement(layout: Layout): Arrangement {
  return Object.fromEntries(BOARD_ITEMS.map(item => [item.id, { ...item.defaults[layout] }]));
}

/** Rotate the full rectangle, including its holding magnet, inside the board. */
export function clampTransform(item: BoardItem, value: Transform, layout: Layout): Transform {
  const [boardWidth, boardHeight] = DESIGN_SIZE[layout];
  const [width, height] = item.size[layout];
  const r = value.rotation * Math.PI / 180;
  const padding = item.kind === 'letter' ? 8 : 20;
  const halfX = (Math.abs(Math.cos(r)) * width + Math.abs(Math.sin(r)) * height) / 2 + padding;
  const halfY = (Math.abs(Math.sin(r)) * width + Math.abs(Math.cos(r)) * height) / 2 + padding;
  return { ...value, x: Math.max(halfX / boardWidth, Math.min(1 - halfX / boardWidth, value.x)), y: Math.max(halfY / boardHeight, Math.min(1 - halfY / boardHeight, value.y)) };
}
