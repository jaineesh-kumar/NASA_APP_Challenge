// All user-facing text (Spec B4.10, B9). Written for ages 7-12: short sentences, one idea each,
// science words explained where they appear. Numbers are never typed here: screens read them
// from data/params.json or data/spaceWeather.json and pass them in.

export const copy = {
  header: {
    title: 'Moonbase Margin',
    subtitle: 'Junior Astronaut Mission Trainer',
    missionDuration: (days: number, crew: number) => `${days}-day Moon mission • crew of ${crew}`,
    realDataBadge: 'Uses real NASA data',
  },
  nav: {
    label: 'Main navigation',
    briefing: 'Briefing',
    design: 'Build',
    rules: 'Rules',
    rehearse: 'Test',
    review: 'Review',
    learn: 'Learn',
    modelCard: 'How it works',
  },
  flow: {
    routeLabel: 'Your mission route, from Earth to the Moon base',
    earth: 'Earth',
    moon: 'Moon base',
    stepOf: (n: number, total: number) => `Step ${n} of ${total}`,
    done: 'Done!',
    back: 'Back',
    backToMission: 'Back to my mission',
    next: {
      briefing: 'Start building',
      design: 'Next: set the rules',
      rules: 'Next: test it',
      rehearse: 'See the results',
      review: 'Change my base',
    },
    locked: {
      overBudget: 'Your rocket is too heavy. Take something off to go on.',
      noResult: 'Test your mission first, then see the results.',
      running: 'Wait for the tests to finish.',
    },
    stopCode: (n: number) => `MB-${String(n).padStart(2, '0')}`,
  },
  briefing: {
    heading: 'Welcome, Commander!',
    summary:
      'Your crew will live at the Moon’s south pole. You must keep them safe until the mission ends. They need air to breathe, water to drink, food to eat, power for every machine, and a shield from space radiation. You cannot pack everything. Every choice costs something.',
    taskTitle: 'How to play',
    step1Title: 'Build your base',
    step1Desc:
      'Pick a landing spot. Then choose what to bring: solar panels, batteries, recyclers, a greenhouse, radiation shields and spare parts. Your rocket can only lift so much.',
    step2Title: 'Set the rules',
    step2Desc:
      'Decide which machines keep power when energy runs low. Add simple “if this happens, then do that” rules, like “if a solar storm is coming, hide in the shelter.”',
    step3Title: 'Test it many times',
    step3Desc:
      'The computer flies your mission hundreds of times. Dust, breakdowns and solar storms change every time. You can also replay a real solar storm recorded by NASA.',
    step4Title: 'Review and improve',
    step4Desc:
      'See how often your crew stayed safe and what went wrong. Watch a replay of the hardest mission. Then change your plan and try again!',
    realDataTitle: 'Real NASA data inside',
    realDataBody:
      'You can test your base against real solar storms. NASA recorded them in a space weather database called DONKI. The game uses a saved copy, so it is not live.',
    startButton: 'Start building',
  },
  learnTabs: {
    missions: 'Guided missions',
    importHint: (prefix: string) =>
      `Paste a friend’s scenario code (it starts with ${prefix}) to test their base.`,
  },
  glossary: {
    title: 'Space words',
    terms: [
      {
        term: 'Radiation dose',
        meaning:
          'How much invisible space radiation a body has soaked up. Too much can make people sick.',
      },
      {
        term: 'Solar storm',
        meaning:
          'The Sun throws out a burst of fast particles. Scientists call it a solar particle event.',
      },
      {
        term: 'Dark window',
        meaning: 'Hours when tall mountains block the Sun, so solar panels make no power.',
      },
      { term: 'Margin', meaning: 'Extra you keep “just in case”, like a spare snack in your bag.' },
      {
        term: 'Recycling loop',
        meaning: 'A machine that cleans used water or air so the crew can use it again.',
      },
      { term: 'µSv (microsievert)', meaning: 'A tiny unit for radiation dose.' },
    ],
  },
  design: {
    heading: 'Build your base',
    subheading:
      'Choose what to pack. The rocket has a weight limit, so you cannot take everything.',
    budgetTitle: 'Rocket weight limit',
    budgetUsed: 'Used',
    budgetMax: (max: number) => `Limit ${max} mass units`,
    overBudgetWarning: 'Too heavy! Remove something before launch.',
    withinBudgetSuccess: 'Your base fits on the rocket.',
    presetsTitle: 'Start from an example base',
    siteTitle: 'Landing spot',
    siteLabel: 'Choose a landing spot',
    ridgeName: 'Sunny Ridge',
    ridgeDesc: (darkPct: number, waterKg: number) =>
      `High and sunny. Dark ${darkPct}% of the time. Starts with ${waterKg} kg of water.`,
    craterName: 'Crater Edge',
    craterDesc: (darkPct: number, waterKg: number) =>
      `Near ice, so more water (${waterKg} kg), but dark ${darkPct}% of the time.`,
    powerSectionTitle: 'Power',
    panelsLabel: 'Solar panels',
    panelsHelp: (kw: number, mu: number) => `Each makes ${kw} kW in sunlight. Weighs ${mu}.`,
    mastLabel: 'Tall mast for panels',
    mastHelp: (mu: number) =>
      `Lifts panels above shadows so dark windows are shorter. ${mu} per level.`,
    batteriesLabel: 'Batteries',
    batteriesHelp: (kwh: number, mu: number) =>
      `Each stores ${kwh} kWh for dark hours. Weighs ${mu}.`,
    lifeSupportSectionTitle: 'Air, water and food',
    waterLoopLabel: 'Water recycler',
    waterLoopBase: (pct: number) => `Saves ${pct}% of used water`,
    waterLoopUpgraded: (pct: number, mu: number) => `Saves ${pct}%. Adds ${mu} mu`,
    o2LoopLabel: 'Air recycler',
    o2LoopBase: 'Makes oxygen from water',
    o2LoopSabatier: (pct: number, mu: number) =>
      `Turns breathed-out gas back into water, up to ${pct}%. Adds ${mu} mu`,
    greenhouseLabel: 'Greenhouse modules',
    greenhouseHelp: (mu: number) =>
      `Grow fresh food. Plants need power, water and crew time. ${mu} each.`,
    shieldingLabel: 'Radiation shield layers',
    shieldingHelp: (mu: number) =>
      `Moon-dirt walls the crew builds. Each layer blocks more radiation. ${mu} each.`,
    sparesSectionTitle: 'Spare parts',
    sparesHelp: (mu: number) => `A spare lets the crew fix a broken machine. ${mu} each.`,
    co2ScrubberSpares: 'Air cleaner (removes CO₂)',
    o2GenSpares: 'Oxygen maker',
    waterProcSpares: 'Water recycler',
    powerArraySpares: 'Solar panel wiring',
    mu: 'mu',
    nextButton: 'Next: set the rules',
  },
  rules: {
    heading: 'Set the rules',
    subheading: 'Your crew follows these rules every hour, even when you are not watching.',
    priorityTitle: 'Who gets power first?',
    priorityHelp:
      'When power runs low, machines at the bottom switch off first. Keep the most important ones at the top.',
    priorityMoveUp: 'Move up',
    priorityMoveDown: 'Move down',
    commsNote:
      'Tip: In this game, solar storm warnings from Earth arrive by radio. If the radio is switched off, the warning cannot reach your crew.',
    ifThenTitle: 'If-then rules',
    ifThenHelp: (max: number) => `Add up to ${max} rules. The crew checks them every hour.`,
    addRuleButton: '+ Add rule',
    maxRulesReached: 'You have the most rules allowed.',
    noRulesYet: 'No rules yet. Try: “If a solar storm warning comes, hide in the shelter.”',
    ruleWhen: 'IF',
    ruleThen: 'THEN',
    removeRule: 'Remove',
    nextButton: 'Next: test it',
    backButton: 'Back to building',
  },
  storms: {
    title: 'Which solar storms will your base face?',
    intro: 'Pick random storms, or replay a real solar storm that NASA recorded.',
    pickerLabel: 'Storms for this test',
    randomName: 'Random storms',
    randomDesc:
      'Storms arrive at random times. How often and how strong they are is an illustrative game choice.',
    replayName: (date: string) => `Real storm of ${date}`,
    replayDesc: (flareClass: string) => `Linked to a class ${flareClass} solar flare.`,
    sourceBadge: 'NASA DONKI (S12)',
    archivedLabel: (date: string) => `Archived NASA data, retrieved ${date}. Not live.`,
    honesty:
      'Which storm happened, and when, is real NASA data. How strong it is in the game is our simplification: DONKI gives each linked flare a class, and in this game a C flare makes a small storm, M a medium one and X the biggest.',
    donkiLink: 'See this storm in NASA DONKI',
    evidenceLink: 'See the DONKI alert that names the flare class',
  },
  pass: {
    label: 'Mission pass',
    crewsHome: (n: number) => `${n}`,
    crewsHomeText: 'out of every 100 crews came home',
    science: 'Crews that finished the science',
    weight: 'Rocket weight',
    storms: 'Storms',
    trouble: 'Main trouble',
    noTrouble: 'Nothing went badly wrong',
    range: 'Likely range',
    of100: (n: number) => `${n} of 100`,
  },
  stormResult: {
    vsStorm: (date: string, perHundred: number) =>
      `Your crew vs the storm of ${date}: ${perHundred} out of every 100 came home.`,
    shieldLink: (layers: number, dose: string, limit: string) =>
      layers === 0
        ? `With no shield layers, the highest dose in the hard cases was ${dose} µSv (limit ${limit}).`
        : `With ${layers} shield layer${layers === 1 ? '' : 's'}, the highest dose in the hard cases was ${dose} µSv (limit ${limit}).`,
    randomSummary: (mean: string, max: number) =>
      `Random storms: about ${mean} solar storms per test mission, up to ${max} in one mission.`,
  },
  dataPanel: {
    title: 'Where our data comes from',
    intro:
      'Every dataset the game uses, what we use it for, and whether it is archived or live. Nothing in this game is live.',
    colDataset: 'Dataset',
    colUse: 'What we use it for',
    colStatus: 'Status',
    archived: (date: string) => `Archived, retrieved ${date}`,
    published: 'Published source',
    rows: [
      {
        id: 'donki',
        name: 'NASA DONKI space weather database (S12)',
        use: 'Real Storm Replay: which storm, its date and its linked flare class.',
      },
      {
        id: 'S02',
        name: 'Chang’e-4 Moon surface radiation measurement (S02)',
        use: 'The everyday radiation dose on the Moon’s surface.',
      },
      {
        id: 'S04',
        name: 'NASA space station life support fact sheet (S04)',
        use: 'How much used water the recyclers save.',
      },
      {
        id: 'S05',
        name: 'NASA Sabatier system (S05)',
        use: 'The most oxygen the Sabatier air recycler can win back.',
      },
      {
        id: 'S03',
        name: 'Sunlight at the lunar south pole (S03)',
        use: 'Why landing spots have dark hours, and why a taller mast helps.',
      },
    ],
  },
  rehearse: {
    heading: 'Test your mission',
    subheading:
      'The computer flies your base many times. Each time the Sun, the dust and the breakdowns are different.',
    summaryTitle: 'Your base',
    site: 'Landing spot',
    panels: 'Solar panels',
    batteries: 'Batteries',
    mast: 'Mast level',
    water: 'Water recycler',
    o2: 'Air recycler',
    shielding: 'Shield layers',
    rulesCount: 'If-then rules',
    basic: 'Basic',
    upgraded: 'Upgraded',
    runButton: (runs: number) => `Test ${runs} missions`,
    runningButton: 'Flying test missions…',
    progressLabel: 'Test progress',
    progressText: (done: number, total: number) => `${done} of ${total} missions done`,
    completedNotice: 'Tests finished! See what happened in Review.',
    rerunButton: 'Test again',
    proceedToReview: 'See the results',
    backToRules: 'Change rules',
    errorTitle: 'The test could not run',
    errorBody: (msg: string) => `Something went wrong: ${msg}. Check your rules and try again.`,
  },
  review: {
    heading: 'Mission review',
    subheading: 'How did your base do? Look for the weakest spot, then make it stronger.',
    noResultsTitle: 'No test results yet',
    noResultsBody: 'Test your mission first. Then come back here.',
    goTest: 'Go to testing',
    staleNotice: 'You changed your base after this test. Test again to see new results.',
    flightReadyTitle: 'Ready to fly!',
    flightReadyDesc: (surv: number, succ: number) =>
      `Great job! The crew stayed safe in at least ${surv}% of tests and finished the science in at least ${succ}%.`,
    needsWorkTitle: 'Needs more work',
    needsWorkDesc: (surv: number, succ: number) =>
      `Not ready yet. To fly, the crew must stay safe in ${surv}% of tests and finish the science in ${succ}%. Find the weak spot below.`,
    survivalRateTitle: 'Crew stayed safe',
    successRateTitle: 'Safe and science done',
    confidenceIntervalLabel: 'Likely range',
    confidenceHelp:
      'We tested a few hundred times, not forever, so the true chance is probably inside this range.',
    marginsTitle: 'How close did it get? (hard cases)',
    batteryP5Label: 'Lowest battery (hard cases)',
    o2P5Label: 'Lowest oxygen in tanks (hard cases)',
    doseP95Label: 'Highest radiation dose (hard cases)',
    doseLimit: (limit: string) => `limit ${limit} µSv`,
    days: 'days',
    massUsedTitle: 'Rocket weight used',
    massOf: (used: number, max: number) => `${used} / ${max} mu`,
    stormsTitle: 'Solar storms in your tests',
    riskChartTitle: 'What went wrong?',
    massRiskChartTitle: 'Weight vs. risk for every base you tested',
    massRiskEmpty: 'Test more designs to compare them here.',
    redesignButton: 'Change my base',
    rerunButton: 'Test again',
  },
  replay: {
    title: (seed: number) => `Replay of the hardest mission (test #${seed})`,
    intro: 'Drag the slider or press play to watch what happened, hour by hour.',
    stormsTitle: 'Solar storms in this mission',
    noStorms: 'No solar storm hit this mission.',
    stormLine: (onsetH: number, sheltered: boolean) =>
      `Hour ${onsetH}: solar storm. ${sheltered ? 'The crew was in the shelter.' : 'The crew was NOT in the shelter.'}`,
    replayStorm: (date: string, flareClass: string) =>
      `This mission replayed the real storm of ${date} (flare class ${flareClass}).`,
    donkiLink: 'See this storm in NASA DONKI',
    play: 'Play',
    pause: 'Pause',
    scrubberLabel: 'Mission hour',
    hourNow: (h: number, max: number) => `Hour ${h} of ${max}`,
    hourTick: (h: number) => `h${h}`,
    eventsTitle: 'What happened in the last day',
    noEvents: 'A quiet day.',
    resourcesTitle: 'Supplies over time',
    battery: 'Battery %',
    o2: 'Oxygen (days left in tanks)',
    dose: 'Radiation dose (µSv)',
    darkBand: 'dark',
    stormBand: 'storm',
  },
  logText: {
    dark_window_start: 'Darkness: the Sun went behind the mountains.',
    dark_window_end: 'Sunlight is back.',
    dust_start: 'Moon dust covered the solar panels.',
    spe_warning: (h: string) => `Radio message from Earth: solar storm in ${h} hours!`,
    warning_missed: 'A storm warning was sent, but the radio was off.',
    spe_start: (sheltered: boolean) =>
      sheltered
        ? 'Solar storm hit. The crew was safe in the shelter.'
        : 'Solar storm hit, and the crew was outside the shelter!',
    spe_end: 'The solar storm is over.',
    component_failed: (name: string, noSpare: boolean) =>
      noSpare
        ? `${name} broke, and there is no spare!`
        : `${name} broke. The crew can fix it with a spare.`,
    component_repaired: (name: string) => `${name} is fixed.`,
    battery_empty: 'The batteries are empty!',
    load_off: (name: string) => `Not enough power: ${name} switched off.`,
    shield_layer_built: (n: string) => `Shield layer ${n} is finished.`,
    rule_fired: (rule: string) => `A rule switched on: ${rule}`,
    failure: (cause: string) => `Mission lost: ${cause}.`,
  },
  components: {
    co2_scrubber: 'Air cleaner',
    o2_generator: 'Oxygen maker',
    water_processor: 'Water recycler',
    power_array: 'Solar panel wiring',
  },
  causesShort: {
    oxygen: 'Oxygen',
    co2: 'CO₂',
    water: 'Water',
    food: 'Food',
    dose: 'Radiation',
    science_missed: 'Science',
  },
  ruleText: {
    battery_below_pct: (v: number) => `Battery is below ${v}%`,
    spe_warning: 'A solar storm warning comes',
    o2_days_below: (v: number) => `Oxygen tanks have fewer than ${v} days left`,
    dark_window_within_h: (v: number) => `Darkness starts within ${v} hours`,
    component_failed: 'A machine breaks',
    shed: (load: string) => `Switch off: ${load}`,
    addTitle: 'Add a rule',
    valueLabel: 'Number',
    loadLabel: 'Machine to switch off',
  },
  ladder: {
    first: 'Keeps power longest',
    last: 'Switched off first',
  },
  causes: {
    oxygen: 'ran out of oxygen',
    co2: 'too much carbon dioxide (CO₂) in the air',
    water: 'ran out of water',
    food: 'ran out of food',
    dose: 'too much radiation',
    science_missed: 'safe, but science not finished',
  },
  causeChain: {
    title: 'Why did it happen?',
    intro:
      'We follow the clues backward from the problem. Every step really happened in the replay.',
    none: 'Nothing went badly wrong in this mission.',
    because: 'because',
  },
  charts: {
    intro: (runs: number) => `What went wrong in the ${runs} test missions.`,
    tableToggle: 'Show the numbers as a table',
    noFailures: 'No mission failed in these tests. Nice margins!',
    hourLabel: 'Hour',
    riskLabel: 'Risk (% of tests lost)',
    massLabel: 'Rocket weight (mu)',
    current: 'Latest test',
    tried: (n: number) => `Test ${n}`,
  },
  loads: {
    life_support: 'Life support (air and water)',
    thermal: 'Heaters',
    comms: 'Radio to Earth',
    greenhouse: 'Greenhouse',
    science: 'Science experiments',
    construction: 'Shield building',
  },
  conditions: {
    battery_below_pct: 'Battery is below (%)',
    spe_warning: 'A solar storm warning is on',
    o2_days_below: 'Oxygen tanks have fewer days than',
    dark_window_within_h: 'Darkness starts within (hours)',
    component_failed: 'A machine is broken',
  },
  actions: {
    shed: 'Switch off',
    shelter: 'Crew hides in the storm shelter',
    repair_first: 'Fix machines before other jobs',
    greenhouse_low_power: 'Put the greenhouse on low power',
    pause_science: 'Pause science',
  },
  modelCard: {
    tableHeading: (shown: number, total: number) =>
      `Every number in the game (${shown} of ${total})`,
    tableIntro:
      'The Source column shows where each number comes from. ASSUMPTION means an illustrative game choice made by our team.',
    colId: 'Number',
    colValue: 'Value',
    colSource: 'Source',
    colConfidence: 'How sure',
    colNotes: 'Notes',
    colDetails: 'Details',
    heading: 'How the game works',
    intro: (version: string, count: number) =>
      `Model version ${version}. Every number the game uses is listed below (${count} in all), with where it came from and how sure we are. Numbers marked ASSUMPTION are illustrative game choices, not NASA requirements.`,
    stormStats: (n: number, date: string) =>
      `${n} archived NASA DONKI storms are available for Real Storm Replay. Retrieved ${date}. Not live.`,
    commsTitle: 'Talking to Earth',
    commsBody: (moonS: number, marsMin: readonly number[]) =>
      `A radio message takes about ${moonS} seconds to travel between Earth and the Moon. To Mars it takes ${marsMin[0]} to ${marsMin[1]} minutes, depending on where the planets are. On the Moon that delay is tiny, so the game does not slow messages down. What matters is whether the radio is on when a warning is sent.`,
    simplificationsTitle: 'What we simplified',
    simplifications: [
      {
        topic: 'Hour by hour',
        detail:
          'The game moves in one-hour steps. Power, air and work are averaged over each hour.',
      },
      {
        topic: 'Same crew',
        detail:
          'Every crew member eats, drinks and breathes the same amount. Tiredness, mood and sleep are not modeled.',
      },
      {
        topic: 'Real storms, simplified strength',
        detail:
          'Replayed storms are real DONKI events. In the game every storm lasts the same time, and its strength depends only on the letter of its flare class (an illustrative table).',
      },
      {
        topic: 'No spacewalks',
        detail: 'Extra radiation from working outside the base is not counted.',
      },
      {
        topic: 'Simple heating',
        detail: 'Heaters use more power in the dark by one fixed multiplier.',
      },
      {
        topic: 'Two example landing spots',
        detail:
          'Dark hours follow simple schedules that shift a little each test. Real shadows are more complex.',
      },
      {
        topic: 'Radio is on or off',
        detail:
          'Warnings arrive if the radio has power. Signal blockages and relay satellites are not modeled.',
      },
      {
        topic: 'No internet needed',
        detail: 'All tests run inside your browser. Nothing is sent anywhere.',
      },
    ],
  },
  illustrative: 'illustrative',
};
