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
  | 'storm-shelter'
  | 'launch-still'
  | 'landing-still'
  | 'base-setup-still'
  | 'crew-duo'
  | 'cargo-still'
  | 'rocket-launch'
  | 'rocket-landing'
  | 'base-setup'
  | 'crew-walk'
  | 'cargo-weigh';

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
// The second batch of pictures is 1536x1024 (3:2); the cargo picture is square.
const IMG2_W = 1536;
const IMG2_H = 1024;
const SQUARE = 1254;
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
  'launch-still': {
    id: 'launch-still',
    file: 'images/Cartoon Rocket Over Earth.png',
    kind: 'image',
    ratio: '16/9',
    width: IMG2_W,
    height: IMG2_H,
    alt: 'A red and white rocket zooms up from Earth. A dotted red line shows where it flew.',
  },
  'landing-still': {
    id: 'landing-still',
    file: 'images/Cartoon Rocket Landing on the Moon.png',
    kind: 'image',
    ratio: '16/9',
    width: IMG2_W,
    height: IMG2_H,
    alt: 'A rocket stands on its legs on the Moon. Little dust clouds puff up. Earth is in the sky.',
  },
  'base-setup-still': {
    id: 'base-setup-still',
    file: 'images/Cheerful Moon Base Adventure.png',
    kind: 'image',
    ratio: '16/9',
    width: IMG2_W,
    height: IMG2_H,
    alt: 'A young astronaut gives a thumbs up. A robot carries a box past a dome base and two solar panels.',
  },
  'crew-duo': {
    id: 'crew-duo',
    file: 'images/Cheerful Astronaut and Robot Duo.png',
    kind: 'image',
    ratio: '16/9',
    width: IMG2_W,
    height: IMG2_H,
    alt: 'A smiling young astronaut in a navy space suit stands next to a small round robot.',
  },
  'cargo-still': {
    id: 'cargo-still',
    file: 'images/Rocket and Space Supply Scale.png',
    kind: 'image',
    ratio: '1/1',
    width: SQUARE,
    height: SQUARE,
    alt: 'A rocket stands next to a scale piled with a solar panel, a battery, a water tank, a plant and a shield. The weight bar is almost full.',
  },
  'rocket-launch': {
    id: 'rocket-launch',
    file: 'video/Rocket_lifting_off_from_Earth_b8805c34.mp4',
    kind: 'video',
    poster: 'launch-still',
    ratio: '16/9',
    width: VID_W,
    height: VID_H,
    alt: 'Short cartoon: a rocket lifts off from Earth and flies up into space.',
  },
  'rocket-landing': {
    id: 'rocket-landing',
    file: 'video/Rocket_landing_on_the_Moon_56e5ec1f.mp4',
    kind: 'video',
    poster: 'landing-still',
    ratio: '16/9',
    width: VID_W,
    height: VID_H,
    alt: 'Short cartoon: a rocket slowly lands on the Moon next to a crater.',
  },
  'base-setup': {
    id: 'base-setup',
    file: 'video/Astronaut_and_robot_on_Moon_e769c974.mp4',
    kind: 'video',
    poster: 'base-setup-still',
    ratio: '16/9',
    width: VID_W,
    height: VID_H,
    alt: 'Short cartoon: a young astronaut and a robot set up their base on the Moon.',
  },
  'crew-walk': {
    id: 'crew-walk',
    file: 'video/Astronaut_and_robot_walking_42b5a8b6.mp4',
    kind: 'video',
    poster: 'crew-duo',
    ratio: '16/9',
    width: VID_W,
    height: VID_H,
    alt: 'Short cartoon: a young astronaut and a robot helper walk together.',
  },
  'cargo-weigh': {
    id: 'cargo-weigh',
    file: 'video/Cargo_boxes_weighing_rocket_8571283e.mp4',
    kind: 'video',
    poster: 'cargo-still',
    ratio: '16/9',
    width: VID_W,
    height: VID_H,
    alt: 'Short cartoon: cargo hops onto a scale next to a rocket until the weight bar is full.',
  },
};
