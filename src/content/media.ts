// Media catalog: one entry per file in public/images and public/video (see docs/MEDIA.md).
// Pages refer to media only by id. Files are used where they are; never moved or renamed.
// Alt text is written for a 7-year-old. Sizes come from the files' own headers.

export type MediaKind = 'image' | 'video';
export type MediaRatio = '16/9' | '4/3' | '1/1';

export type MediaId =
  | 'base-scene'
  | 'rocket-journey'
  | 'missions-grid-still'
  | 'moon-horizon'
  | 'concept-sheet'
  | 'crew-walkout'
  | 'rocket-flight'
  | 'missions-grid'
  | 'storm-shelter';

export interface MediaEntry {
  id: MediaId;
  /** Path inside public/, e.g. "images/Moonbase Under a Starry Sky.png". */
  file: string;
  kind: MediaKind;
  /** An image entry shown before a video plays. */
  poster?: MediaId;
  ratio: MediaRatio;
  width: number;
  height: number;
  alt: string;
  credit?: string;
}

const IMG_W = 1672;
const IMG_H = 941;
const VID_W = 1280;
const VID_H = 720;

export const media: Record<MediaId, MediaEntry> = {
  'base-scene': {
    id: 'base-scene',
    file: 'images/Moonbase Under a Starry Sky.png',
    kind: 'image',
    ratio: '16/9',
    width: IMG_W,
    height: IMG_H,
    alt: 'A Moon base with round white rooms, solar panels and a rocket. The Sun and Earth shine in the black sky.',
  },
  'rocket-journey': {
    id: 'rocket-journey',
    file: 'images/Cartoon Rocket Journey to the Moon.png',
    kind: 'image',
    ratio: '16/9',
    width: IMG_W,
    height: IMG_H,
    alt: 'A rocket flies from Earth to a small base on the Moon along a dotted red path.',
  },
  'missions-grid-still': {
    id: 'missions-grid-still',
    file: 'images/Grid of Lunar Moon Bases.png',
    kind: 'image',
    ratio: '16/9',
    width: IMG_W,
    height: IMG_H,
    alt: 'Rows and rows of the same Moon base. Most have yellow lights. A few glow red because they ran into trouble.',
  },
  'moon-horizon': {
    id: 'moon-horizon',
    file: 'images/Playful Moon Landing Adventure.png',
    kind: 'image',
    ratio: '16/9',
    width: IMG_W,
    height: IMG_H,
    alt: 'A rocket stands on the grey Moon. Earth hangs in the dark sky.',
  },
  'concept-sheet': {
    id: 'concept-sheet',
    file: 'images/Cartoon Space Education Collage.png',
    kind: 'image',
    ratio: '16/9',
    width: IMG_W,
    height: IMG_H,
    alt: 'A sheet of small space pictures: an astronaut and a robot, a Moon base, icons, a solar storm, badges and a classroom.',
  },
  'crew-walkout': {
    id: 'crew-walkout',
    file: 'video/Astronauts_walk_out_of_base_ee9ac35b.mp4',
    kind: 'video',
    poster: 'base-scene',
    ratio: '16/9',
    width: VID_W,
    height: VID_H,
    alt: 'Short cartoon: astronauts walk out of their Moon base.',
  },
  'rocket-flight': {
    id: 'rocket-flight',
    file: 'video/Rocket_flies_from_Earth_to_51a6615d.mp4',
    kind: 'video',
    poster: 'rocket-journey',
    ratio: '16/9',
    width: VID_W,
    height: VID_H,
    alt: 'Short cartoon: a rocket flies from Earth to the Moon.',
  },
  'missions-grid': {
    id: 'missions-grid',
    file: 'video/Camera_reveals_moon_bases_grid_88fd8381.mp4',
    kind: 'video',
    poster: 'missions-grid-still',
    ratio: '16/9',
    width: VID_W,
    height: VID_H,
    alt: 'Short cartoon: the camera pulls back to show many copies of the same Moon base being tested.',
  },
  'storm-shelter': {
    id: 'storm-shelter',
    file: 'video/Astronauts_run_into_shelter_fce23b44.mp4',
    kind: 'video',
    ratio: '16/9',
    width: VID_W,
    height: VID_H,
    alt: 'Short cartoon: astronauts run into the shelter as a solar storm comes.',
  },
};
