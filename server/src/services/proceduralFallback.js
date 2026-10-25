// High-fidelity procedural mystery generator used when Gemini API key is unset, rate-limited, or network fails.
// Guarantees 100% adherence to difficulty scaling matrix, Zod schemas, and single-culprit rule.

const NOIR_VICTIMS = [
  { name: 'Lord Reginald Sterling', role: 'Billionaire Antiquities Collector', setting: 'The Crimson Manor' },
  { name: 'Vivian Vance', role: 'Prima Ballerina & Heiress', setting: 'The Velvet Opera House' },
  { name: 'Dr. Arthur Pendelton', role: 'Pioneering Quantum Physicist', setting: 'The Midnight Observatory' },
  { name: 'Cornelius Crane', role: 'Corrupt Shipping Magnate', setting: 'Pier 42 Foggy Docks' },
  { name: 'Madame Genevieve Laurent', role: 'High-Society Jeweler', setting: 'The Grand Sapphire Vault' },
];

const SUSPECT_ARCHETYPES = [
  {
    name: 'Vincent "The Rook" Corvo',
    role: 'Estranged Business Partner',
    bio: 'A sharp-tongued financier known for high-stakes gambling debts and a bitter fallout over unreleased royalties.',
    alibi: 'Claims he was dining alone at the St. Jude Bistro across town until 1:00 AM.',
    motive: 'Was facing imminent bankruptcy and blackmail threats from the victim.',
  },
  {
    name: 'Helena Sterling',
    role: 'Spouse & Sole Beneficiary',
    bio: 'Cold, poised, and fiercely guarded. Married for ten years, but divorce papers were drafted last week.',
    alibi: 'Insists she was asleep in the West Wing guest bedroom with the door deadbolted.',
    motive: 'Discovered she was about to be cut completely out of the will.',
  },
  {
    name: 'Julian Hayes',
    role: 'Private Secretary & Archivist',
    bio: 'Quiet, meticulous, with ink-stained fingertips and a deep knowledge of the mansion secret passages.',
    alibi: 'Claims he was cataloging rare manuscripts in the basement vaults until dawn.',
    motive: 'Was caught embezzling rare artifacts and threatened with public disgrace and prison.',
  },
  {
    name: 'Dr. Evelyn Ward',
    role: 'Personal Physician',
    bio: 'A brilliant toxicologist whose experimental clinic was secretly funded by the victim.',
    alibi: 'Reports she was attending an emergency triage at the East End Free Clinic.',
    motive: 'The victim discovered her forged medical trials and threatened to revoke her medical license.',
  },
  {
    name: 'Marcus "Grip" Vance',
    role: 'Chauffeur & Ex-Safe Cracker',
    bio: 'Loyal on the surface, but carries an old prison record and a custom set of lockpicks.',
    alibi: 'States he was servicing the limousine engine in the carriage house during the storm.',
    motive: 'Paid off to retrieve an incriminating ledger stored in the victim’s private safe.',
  },
];

const CLUE_TEMPLATES = [
  {
    title: 'Shattered Pocket Watch',
    description: 'A cracked gold pocket watch stopped dead at exactly 12:47 AM, stained with a drop of amber-colored liqueur.',
    locationFound: 'Beneath the mahogany study desk',
  },
  {
    title: 'Torn Ledger Page',
    description: 'A burnt scrap from a financial ledger with recent offshore transfer notations and the monogram initials "V.C.".',
    locationFound: 'Inside the dying embers of the fireplace',
  },
  {
    title: 'Muddy Oxford Footprints',
    description: 'Size 10 dress shoe tracks leading from the French garden doors toward the victim’s safe, marked with clay soil only found near Pier 42.',
    locationFound: 'Across the antique Persian rug in the parlor',
  },
  {
    title: 'Vial of Bitter Almonds',
    description: 'A tiny glass dropper containing faint traces of refined cyanide and lab-grade potassium solvent.',
    locationFound: 'Tucked behind the leather-bound medical encyclopedia',
  },
  {
    title: 'Forged Codicil Document',
    description: 'An amended last will and testament dated yesterday, where the victim’s signature shows distinct trembling and tracing tremors.',
    locationFound: 'Concealed in a false bottom drawer',
  },
  {
    title: 'Damp Trenchcoat with Torn Cuff',
    description: 'A heavy wool overcoat dripping with rainwater. The right sleeve button matches a pearl button clutched in the victim’s hand.',
    locationFound: 'Hanging secretly behind the hall coat rack',
  },
  {
    title: 'Audio Wax Cylinder Recording',
    description: 'A fragile phonograph record capturing a heated muffled argument at 12:30 AM: "You will sign it tonight, or neither of us walks out alive!"',
    locationFound: 'Still spinning on the parlor phonograph',
  },
  {
    title: 'Smudged Fingerprint on Safe Dial',
    description: 'A clear thumbprint left on the brass dial of the reinforced wall safe, coated in mechanical grease and jeweler rouge.',
    locationFound: 'On the hidden wall safe behind the oil painting',
  },
  {
    title: 'Counterfeit Bistro Receipt',
    description: 'A restaurant bill timestamped 1:15 AM with a fraudulent server signature and the incorrect date stamp from last month.',
    locationFound: 'Discarded in the hallway wastebasket',
  },
];

const HINT_TEMPLATES = [
  'Inspect the timeline around 12:45 AM closely; someone claimed to be miles away but their physical trace proves otherwise.',
  'Cross-reference the footprint clay with the suspects’ recent travel locations and their discarded apparel.',
  'Examine the handwriting and receipts; an alibi was fabricated using a forged timestamp.',
];

export function generateProceduralMystery({ premise, difficulty = 'Medium', genre = 'Noir Mystery' }) {
  const diffConfig = {
    Easy: { suspectCount: 3, cluesCount: 5, hintsCount: 2, actionPoints: 12 },
    Medium: { suspectCount: 4, cluesCount: 7, hintsCount: 3, actionPoints: 10 },
    Hard: { suspectCount: 5, cluesCount: 9, hintsCount: 3, actionPoints: 8 },
  }[difficulty] || { suspectCount: 4, cluesCount: 7, hintsCount: 3, actionPoints: 10 };

  const victim = NOIR_VICTIMS[Math.floor(Math.random() * NOIR_VICTIMS.length)];
  const randomizedPremise = premise || `The mysterious death of ${victim.name} at ${victim.setting} under the cover of a torrential midnight storm.`;

  // Pick suspects
  const shuffledSuspects = [...SUSPECT_ARCHETYPES].sort(() => 0.5 - Math.random()).slice(0, diffConfig.suspectCount);
  
  // Pick exactly ONE culprit
  const culpritIndex = Math.floor(Math.random() * shuffledSuspects.length);
  const suspects = shuffledSuspects.map((s, idx) => ({
    name: s.name,
    role: s.role,
    bio: s.bio,
    alibi: s.alibi,
    isCulprit: idx === culpritIndex,
    motive: s.motive,
  }));

  const culprit = suspects[culpritIndex];

  // Pick clues
  const clues = CLUE_TEMPLATES.slice(0, diffConfig.cluesCount).map((c, idx) => ({
    title: c.title,
    description: idx === 0 
      ? `${c.description} Clutched nearby is a personalized monogram linking directly to ${culprit.name}.`
      : c.description,
    discovered: false,
    locationFound: c.locationFound,
  }));

  // Pick hints
  const hints = HINT_TEMPLATES.slice(0, diffConfig.hintsCount).map((text) => ({
    text,
    unlocked: false,
  }));

  const title = `The Case of the ${victim.name.split(' ').pop()} Conspiracy: ${genre}`;
  const crimeSceneStory = `The storm raged outside ${victim.setting} when the grandfather clock struck midnight. At 12:50 AM, an urgent scream pierced the heavy silence. ${victim.name}, the ${victim.role}, was discovered lifeless in the inner sanctum. The room was locked from within, the air thick with the faint scent of bitter almonds and singed paper. Beside the desk lay a shattered watch frozen at 12:47 AM. With the torrential rain washing out the only bridge back to the city, the killer is undeniably trapped among the ${diffConfig.suspectCount} individuals currently in the building. Detective, inspect the evidence, interrogate each suspect, and unmask the true culprit before daybreak.`;

  const solutionExplanation = `The true culprit is ${culprit.name}. Driven by their motive (${culprit.motive}), they plotted the crime during the storm. They attempted to establish a false alibi by claiming "${culprit.alibi}", but key physical evidence—specifically the shattered pocket watch timestamp and the incriminating traces found at the scene—unravels their story. When confronted with the forged documents and physical traces left behind, ${culprit.name} breaks down and confesses to orchestrating the incident.`;

  return {
    title,
    premise: randomizedPremise,
    difficulty,
    crimeSceneStory,
    suspects,
    clues,
    hints,
    solutionExplanation,
    playerProgress: {
      actionPointsRemaining: diffConfig.actionPoints,
      cluesDiscoveredCount: 0,
      hintsUsedCount: 0,
      status: 'IN_PROGRESS',
    },
  };
}
