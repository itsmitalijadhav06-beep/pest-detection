export const pestInfoMap: Record<string, any> = {
  "green leafhopper": {
    crop: "Rice",
    damage: [
      "Nymphs and adults suck sap from rice plants",
      "Spreads Tungro virus",
      "White patches, weak tillers, wilting",
      "Severe attack causes hopperburn (complete drying)"
    ],
    recommendations: {
      cultural: [
        "Use seedlings older than 3 weeks for transplanting",
        "Plant early in the season",
        "Remove weeds from field and bunds",
        "Rotate rice with non-rice crops in dry season"
      ],
      biological: [
        "Conserve natural enemies like spiders and parasitoids"
      ],
      chemical: [
        "Use neem-based sprays",
        "Chemical insecticides only during severe attack"
      ]
    }
  },

  "planthopper": {
    crop: "Rice",
    damage: [
      "Sucks plant sap causing yellowing and weakness",
      "Heavy infestation leads to hopperburn",
      "Spreads Ragged Stunt and Grassy Stunt viruses",
      "400–500 nymphs per plant may cause 100% crop loss"
    ],
    recommendations: {
      cultural: [
        "Use resistant rice varieties",
        "Install light traps at night",
        "Avoid excess nitrogen fertilizer",
        "Maintain proper plant spacing"
      ],
      biological: [
        "Protect spiders and beetles",
        "Entomopathogenic fungi and beneficial bacteria (NBAIR)"
      ],
      chemical: [
        "Chemical control only if infestation is severe"
      ]
    }
  },

  "rice bug": {
    crop: "Rice (flowering & milky stage)",
    damage: [
      "Sucks sap from grains at milky stage",
      "Grains become chaffy and shriveled",
      "Black feeding spots appear",
      "Strong buggy odor in field"
    ],
    recommendations: {
      cultural: [
        "Avoid staggered planting",
        "Remove weeds from bunds",
        "Burn bund grasses during off-season"
      ],
      biological: [
        "Egg parasitoids",
        "Spiders, ladybird beetles, dragonflies"
      ],
      chemical: [
        "Spray 5% Neem Seed Kernel Extract (two times)",
        "Apply KKM 10 D dust – 25 kg/ha (two times)"
      ]
    }
  },

  "rice leaf roller": {
    crop: "Rice",
    damage: [
      "Larvae fold leaves and feed inside",
      "White transparent streaks on leaves",
      "Reduced photosynthesis",
      "Flag leaf damage causes high yield loss"
    ],
    recommendations: {
      cultural: [
        "Use resistant varieties",
        "Avoid ratooning",
        "Remove grassy weeds",
        "Maintain proper fertilizer and spacing"
      ],
      biological: [
        "Use Beauveria or Metarhizium fungi",
        "Release Trichogramma parasitoids"
      ],
      chemical: [
        "Do NOT spray pesticides early in the season"
      ]
    }
  }
};
