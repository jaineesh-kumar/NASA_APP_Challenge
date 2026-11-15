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
  | 'cargo-weigh'
  | 'night-still'
  | 'ladder-still'
  | 'ladder-alt'
  | 'share-banner'
  | 'cutaway-still'
  | 'crew-wave'
  | 'crew-celebrate'
  | 'crew-celebrate-copy'
  | 'recycler-still'
  | 'greenhouse-still'
  | 'greenhouse-still-copy'
  | 'storm-still'
  | 'classroom'
  | 'badge-first-flight'
  | 'badge-first-flight-alt'
  | 'badge-debrief'
  | 'badge-goal'
  | 'badge-commander'
  | 'icon-power'
  | 'icon-air'
  | 'icon-water'
  | 'icon-food'
  | 'icon-shield'
  | 'icon-radio'
  | 'base-tour'
  | 'night-falls'
  | 'recycler-fix'
  | 'greenhouse-grow'
  | 'storm-warning'
  | 'crew-cheer';

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
const SQUARE = 1254; // badges, icons, mascot poses and the ladder are square too
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
    poster: 'storm-still',
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
  'night-still': {
    id: 'night-still',
    file: 'images/Cozy Lunar Base Under Earthshine.png',
    kind: 'image',
    ratio: '1/1',
    width: SQUARE,
    height: SQUARE,
    alt: 'A dome base sits on the grey Moon at night. Its windows glow yellow. Earth and stars shine in the dark sky.',
  },
  'ladder-still': {
    id: 'ladder-still',
    file: 'images/Fan-Topped Ladder of Icons-2.png',
    kind: 'image',
    ratio: '1/1',
    width: SQUARE,
    height: SQUARE,
    alt: 'A ladder of machines. An air fan glows at the top, then a heater, a radio dish, a plant and a microscope at the bottom.',
  },
  'ladder-alt': {
    id: 'ladder-alt',
    file: 'images/Radiant Fan Shelf Collection.png',
    kind: 'image',
    ratio: '1/1',
    width: SQUARE,
    height: SQUARE,
    alt: 'Another ladder of machines with a purple fan at the top and a microscope at the bottom.',
  },
  'share-banner': {
    id: 'share-banner',
    file: 'images/Moonbound Friends and Lunar Base-1.png',
    kind: 'image',
    ratio: '16/9',
    width: IMG2_W,
    height: IMG2_H,
    alt: 'A young astronaut and a robot wave on the Moon. A dotted red path joins Earth to a small Moon base.',
  },
  'cutaway-still': {
    id: 'cutaway-still',
    file: 'images/Lunar Base Life and Science.png',
    kind: 'image',
    ratio: '16/9',
    width: IMG2_W,
    height: IMG2_H,
    alt: 'Inside a Moon base: two young astronauts at a laptop, a small greenhouse, a battery and a water tank. Solar panels stand outside.',
  },
  'crew-wave': {
    id: 'crew-wave',
    file: 'images/Cheerful Astronaut and Robot Wave-3.png',
    kind: 'image',
    ratio: '1/1',
    width: SQUARE,
    height: SQUARE,
    alt: 'A smiling young astronaut and a small robot wave hello.',
  },
  'crew-celebrate': {
    id: 'crew-celebrate',
    file: 'images/Kawaii Astronaut and Robot Celebration.png',
    kind: 'image',
    ratio: '1/1',
    width: SQUARE,
    height: SQUARE,
    alt: 'A young astronaut and a robot jump for joy.',
  },
  'crew-celebrate-copy': {
    id: 'crew-celebrate-copy',
    file: 'images/Kawaii Astronaut and Robot Celebration (1).png',
    kind: 'image',
    ratio: '1/1',
    width: SQUARE,
    height: SQUARE,
    alt: 'A young astronaut and a robot jump for joy (a second copy of the same picture).',
  },
  'recycler-still': {
    id: 'recycler-still',
    file: 'images/Kawaii Space Recycler Repair Lab.png',
    kind: 'image',
    ratio: '16/9',
    width: IMG2_W,
    height: IMG2_H,
    alt: 'A young astronaut fixes the water recycler with a wrench and a spare part. A toolbox sits on the floor.',
  },
  'greenhouse-still': {
    id: 'greenhouse-still',
    file: 'images/Moon Greenhouse Harvest.png',
    kind: 'image',
    ratio: '16/9',
    width: IMG2_W,
    height: IMG2_H,
    alt: 'A young astronaut picks lettuce in a Moon greenhouse. Tomatoes grow under purple lamps.',
  },
  'greenhouse-still-copy': {
    id: 'greenhouse-still-copy',
    file: 'images/Moon Greenhouse Harvest (1).png',
    kind: 'image',
    ratio: '16/9',
    width: IMG2_W,
    height: IMG2_H,
    alt: 'A young astronaut picks lettuce in a Moon greenhouse (a second copy of the same picture).',
  },
  'storm-still': {
    id: 'storm-still',
    file: 'images/Solar Storm Shelter Dash.png',
    kind: 'image',
    ratio: '16/9',
    width: IMG2_W,
    height: IMG2_H,
    alt: 'The Sun sends wavy orange streaks across the sky. A young astronaut and a robot run into the base to hide.',
  },
  classroom: {
    id: 'classroom',
    file: 'images/Cheerful Classroom Moon Base Discovery-4.png',
    kind: 'image',
    ratio: '16/9',
    width: IMG2_W,
    height: IMG2_H,
    alt: 'A teacher and four children smile and point at a Moon base on a tablet.',
  },
  'badge-first-flight': {
    id: 'badge-first-flight',
    file: 'images/Sunny Yellow Rocket Badge.png',
    kind: 'image',
    ratio: '1/1',
    width: SQUARE,
    height: SQUARE,
    alt: 'A yellow badge with a rocket taking off.',
  },
  'badge-first-flight-alt': {
    id: 'badge-first-flight-alt',
    file: 'images/Rocket Launch Badge-1.png',
    kind: 'image',
    ratio: '1/1',
    width: SQUARE,
    height: SQUARE,
    alt: 'A yellow badge with a rocket taking off (version with a smudge).',
  },
  'badge-debrief': {
    id: 'badge-debrief',
    file: 'images/Clipboard Checkmark Badge-2.png',
    kind: 'image',
    ratio: '1/1',
    width: SQUARE,
    height: SQUARE,
    alt: 'A yellow badge with a clipboard and a check mark.',
  },
  'badge-goal': {
    id: 'badge-goal',
    file: 'images/Navy and Gold Crosshair Badge-3.png',
    kind: 'image',
    ratio: '1/1',
    width: SQUARE,
    height: SQUARE,
    alt: 'A yellow badge with a target and a star.',
  },
  'badge-commander': {
    id: 'badge-commander',
    file: 'images/Cartoon Moon Base Star Badge-4.png',
    kind: 'image',
    ratio: '1/1',
    width: SQUARE,
    height: SQUARE,
    alt: 'A yellow badge with a star above a Moon base.',
  },
  'icon-power': {
    id: 'icon-power',
    file: 'images/Sunny Yellow Battery Icon-1.png',
    kind: 'image',
    ratio: '1/1',
    width: SQUARE,
    height: SQUARE,
    alt: 'A yellow battery with a lightning bolt.',
  },
  'icon-air': {
    id: 'icon-air',
    file: 'images/Stylized Desk Fan with Air Bubbles-2.png',
    kind: 'image',
    ratio: '1/1',
    width: SQUARE,
    height: SQUARE,
    alt: 'A blue fan with little air bubbles.',
  },
  'icon-water': {
    id: 'icon-water',
    file: 'images/Recycling Water Droplet Icon-3.png',
    kind: 'image',
    ratio: '1/1',
    width: SQUARE,
    height: SQUARE,
    alt: 'A water drop inside green recycling arrows.',
  },
  'icon-food': {
    id: 'icon-food',
    file: 'images/Cartoon Sprout in Soil-4.png',
    kind: 'image',
    ratio: '1/1',
    width: SQUARE,
    height: SQUARE,
    alt: 'A green sprout growing from soil.',
  },
  'icon-shield': {
    id: 'icon-shield',
    file: 'images/Purple Shield on Lunar Mound-5.png',
    kind: 'image',
    ratio: '1/1',
    width: SQUARE,
    height: SQUARE,
    alt: 'A purple shield in front of a pile of Moon soil.',
  },
  'icon-radio': {
    id: 'icon-radio',
    file: 'images/Colorful Satellite Dish Icon-6.png',
    kind: 'image',
    ratio: '1/1',
    width: SQUARE,
    height: SQUARE,
    alt: 'A white radio dish sending signals.',
  },
  'base-tour': {
    id: 'base-tour',
    file: 'video/Astronauts_working_on_Moon_base_1f0eabf9.mp4',
    kind: 'video',
    poster: 'cutaway-still',
    ratio: '16/9',
    width: VID_W,
    height: VID_H,
    alt: 'Short cartoon: astronauts at work inside their Moon base.',
  },
  'night-falls': {
    id: 'night-falls',
    file: 'video/Sunset_on_Moon_base_5ef23fa5.mp4',
    kind: 'video',
    poster: 'night-still',
    ratio: '16/9',
    width: VID_W,
    height: VID_H,
    alt: 'Short cartoon: the Sun sets and night falls over the Moon base.',
  },
  'recycler-fix': {
    id: 'recycler-fix',
    file: 'video/Kid_astronaut_fixes_water_recycler_4304aa2d.mp4',
    kind: 'video',
    poster: 'recycler-still',
    ratio: '16/9',
    width: VID_W,
    height: VID_H,
    alt: 'Short cartoon: a young astronaut fixes the water recycler with a spare part.',
  },
  'greenhouse-grow': {
    id: 'greenhouse-grow',
    file: 'video/Robot_waters_plants_in_greenhouse_7b3659e5.mp4',
    kind: 'video',
    poster: 'greenhouse-still',
    ratio: '16/9',
    width: VID_W,
    height: VID_H,
    alt: 'Short cartoon: a robot waters the plants in the Moon greenhouse.',
  },
  'storm-warning': {
    id: 'storm-warning',
    file: 'video/Astronaut_and_robot_enter_shelter_fdd562ba.mp4',
    kind: 'video',
    poster: 'storm-still',
    ratio: '16/9',
    width: VID_W,
    height: VID_H,
    alt: 'Short cartoon: a young astronaut and a robot go into the shelter before a solar storm.',
  },
  'crew-cheer': {
    id: 'crew-cheer',
    file: 'video/Astronaut_and_robot_celebrating_6bd0580c.mp4',
    kind: 'video',
    ratio: '16/9',
    width: VID_W,
    height: VID_H,
    alt: 'Short cartoon: a young astronaut and a robot cheer and jump.',
  },
};

/** Badge pictures by badge id (src/content/badges.ts). Badges without a picture keep their icon. */
export const badgeMedia: Readonly<Record<string, MediaId>> = {
  first_test: 'badge-first-flight',
  first_debrief: 'badge-debrief',
  goal_getter: 'badge-goal',
  all_missions: 'badge-commander',
};

/** System icons beside Space words, by glossary term (src/content/copy.ts glossary). */
export const wordMedia: Readonly<Record<string, MediaId>> = {
  Battery: 'icon-power',
  'Oxygen scrubber': 'icon-air',
  'Recycling loop': 'icon-water',
  Greenhouse: 'icon-food',
  Shelter: 'icon-shield',
  'Mission Control': 'icon-radio',
};

/** Card clip for each guided mission (src/content/missions.ts). */
export const missionMedia: Readonly<Record<string, MediaId>> = {
  M1: 'night-falls',
  M2: 'recycler-fix',
  M3: 'storm-shelter',
  M4: 'greenhouse-grow',
  M5: 'storm-warning',
};
