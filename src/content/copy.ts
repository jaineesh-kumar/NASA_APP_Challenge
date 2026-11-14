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
    design: '1. Build',
    rules: '2. Rules',
    rehearse: '3. Test',
    review: '4. Review',
    learn: 'Learn',
    modelCard: 'How it works',
  },
  briefing: {
    heading: 'Welcome, Commander!',
    summary:
      'Your crew will live at the Moon’s south pole. You must keep them safe until the mission ends. They need air to breathe, water to drink, food to eat, power for every machine, and a shield from space radiation. You cannot pack everything. Every choice costs something.',
    taskTitle: 'How to play',
    step1Title: '1. Build your base',
    step1Desc:
      'Pick a landing spot. Then choose what to bring: solar panels, batteries, recyclers, a greenhouse, radiation shields and spare parts. Your rocket can only lift so much.',
    step2Title: '2. Set the rules',
    step2Desc:
      'Decide which machines keep power when energy runs low. Add simple “if this happens, then do that” rules, like “if a solar storm is coming, hide in the shelter.”',
    step3Title: '3. Test it many times',
    step3Desc:
      'The computer flies your mission hundreds of times. Each test uses a real stretch of the Sun’s history, with real solar storms recorded by NASA.',
    step4Title: '4. Review and improve',
    step4Desc:
      'See how often your crew stayed safe and what went wrong. Watch a replay of the hardest mission. Then change your plan and try again!',
    realDataTitle: 'Real NASA data inside',
    realDataBody:
      'The solar storms in this game really happened. NASA scientists recorded them in a database called DONKI. The game uses a saved copy, so it is not live.',
    startButton: 'Start building →',
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
    waterLoopBase: (pct: number) => `Basic: saves ${pct}% of used water`,
    waterLoopUpgraded: (pct: number, mu: number) => `Upgraded: saves ${pct}% (+${mu})`,
    o2LoopLabel: 'Air recycler',
    o2LoopBase: 'Basic: oxygen from water only',
    o2LoopSabatier: (pct: number, mu: number) =>
      `Sabatier: turns breathed-out gas back into water, up to ${pct}% (+${mu})`,
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
    nextButton: 'Next: set the rules →',
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
    nextButton: 'Next: test the mission →',
    backButton: '← Back to building',
  },
  spaceWeather: {
    title: 'Which Sun will you face?',
    intro:
      'Each test mission replays a real 30-day stretch of the Sun’s history. The bars show how many solar storms NASA recorded each year.',
    eraLabel: 'Pick the Sun’s mood',
    eras: {
      all: { name: 'Any time', desc: 'Any 30 days from the whole record.' },
      quiet: {
        name: 'Calm Sun',
        desc: (years: string) => `Years with the fewest storms: ${years}.`,
      },
      stormy: {
        name: 'Stormy Sun',
        desc: (years: string) => `Years with the most storms: ${years}.`,
      },
    },
    chartTitle: 'Solar storms recorded per year',
    chartDesc: (from: number, to: number) =>
      `Bar chart of solar storms per year, ${from} to ${to}.`,
    stats: (storms: number, medianLeadH: number, noWarnPct: number) =>
      `${storms} storms in the record. The early sign (a flare or a cloud of gas leaving the Sun) usually came only about ${medianLeadH} hours before the particles arrived. ${noWarnPct}% had no early sign at all.`,
    attribution: (fetchedAt: string, from: string, to: string) =>
      `Data: NASA DONKI space weather database (source S12), ${from} to ${to}. Saved copy from ${fetchedAt}, not live.`,
    legendQuiet: 'calm year',
    legendStormy: 'stormy year',
    legendOther: 'other year',
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
    proceedToReview: 'See results →',
    backToRules: '← Change rules',
    errorTitle: 'The test could not run',
    errorBody: (msg: string) => `Something went wrong: ${msg}. Check your rules and try again.`,
  },
  review: {
    heading: 'Mission review',
    subheading: 'How did your base do? Look for the weakest spot, then make it stronger.',
    noResultsTitle: 'No test results yet',
    noResultsBody: 'Test your mission first. Then come back here.',
    goTest: 'Go to testing →',
    staleNotice: 'You changed your base after this test. Test again to see new results.',
    flightReadyTitle: 'READY TO FLY',
    flightReadyDesc: (surv: number, succ: number) =>
      `Great job! The crew stayed safe in at least ${surv}% of tests and finished the science in at least ${succ}%.`,
    needsWorkTitle: 'NEEDS MORE WORK',
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
    sunTitle: 'The real Sun in your tests',
    sunSummary: (era: string, mean: string, max: number) =>
      `${era}: about ${mean} solar storms per test mission, up to ${max} in one mission.`,
    warningsMissed: (n: number) =>
      n === 0
        ? 'Every storm warning reached your base by radio.'
        : `${n} storm warnings never reached your base because the radio was off.`,
    riskChartTitle: 'What went wrong?',
    massRiskChartTitle: 'Weight vs. risk for every base you tested',
    massRiskEmpty: 'Test more designs to compare them here.',
    redesignButton: '← Change my base',
    rerunButton: 'Test again',
  },
  replay: {
    title: (seed: number) => `Replay of the hardest mission (test #${seed})`,
    intro: 'Drag the slider or press play to watch what happened, hour by hour.',
    sunWindow: (date: string) => `This test used the real Sun starting ${date}.`,
    noStorms: 'No solar storms happened in this stretch.',
    stormLine: (onsetH: number, lead: string, received: string, sheltered: string) =>
      `Hour ${onsetH}: storm. ${lead} ${received} ${sheltered}`,
    leadNone: 'No warning was possible.',
    lead: (h: number) => `Forecast came ${h} h early.`,
    receivedYes: (h: number) => `Heard by radio at hour ${h}.`,
    receivedNo: 'Warning never arrived.',
    shelteredYes: 'Crew was in the shelter.',
    shelteredNo: 'Crew was NOT in the shelter.',
    donkiLink: 'See this storm in NASA DONKI',
    play: 'Play',
    pause: 'Pause',
    scrubberLabel: 'Mission hour',
    hourNow: (h: number, max: number) => `Hour ${h} of ${max}`,
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
    hintTitle: 'Big idea',
  },
  charts: {
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
    heading: 'How the game works',
    intro: (version: string, count: number) =>
      `Model version ${version}. Every number the game uses is listed below (${count} in all), with where it came from and how sure we are. Numbers marked ASSUMPTION are illustrative game choices, not NASA requirements.`,
    dataTitle: 'Real NASA data in this game',
    dataIntro:
      'These parts of the game use real measurements or records. Everything else is a labeled game choice.',
    dataRows: [
      {
        name: 'Solar storms (NASA DONKI, S12)',
        use: 'When storms happen and how much warning was possible. Each test replays a real 30-day stretch.',
      },
      {
        name: 'Moon surface radiation (Chang’e-4 measurement, S02)',
        use: 'The everyday radiation dose on the Moon’s surface.',
      },
      {
        name: 'Space station water and air recycling (S04, S05, S08)',
        use: 'How much water the recyclers save, and the Sabatier air-recycler limit.',
      },
      {
        name: 'Sunlight at the south pole (S03, S09)',
        use: 'Why landing spots have dark hours, and why a taller mast helps.',
      },
    ],
    stormStats: (n: number, raw: number, from: string, to: string, fetched: string) =>
      `${n} storms built from ${raw} DONKI records, ${from} to ${to}. Saved copy from ${fetched}. It is not live.`,
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
        topic: 'Storms from real dates, strength illustrative',
        detail:
          'Storm dates and warning times come from DONKI. How strong a storm is and how long it lasts are illustrative game numbers, the same for every storm.',
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
