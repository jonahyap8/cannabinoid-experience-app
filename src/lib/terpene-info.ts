/** ──────────────────────────────────────────────
 *  Terpene descriptions & aromas
 *  ────────────────────────────────────────────── */

export interface TerpeneInfo {
  name: string;
  aroma: string;
  description: string;
  /** Common natural sources */
  foundIn: string[];
}

export const TERPENE_INFO: Record<string, TerpeneInfo> = {
  Myrcene: {
    name: "Myrcene",
    aroma: "Earthy, musky, herbal",
    description:
      "The most abundant terpene in cannabis. Associated with relaxing, sedative effects and may enhance cannabinoid absorption.",
    foundIn: ["Mangoes", "Lemongrass", "Hops", "Thyme"],
  },
  Limonene: {
    name: "Limonene",
    aroma: "Citrus, lemon, orange",
    description:
      "A mood-elevating terpene commonly linked to stress relief and uplifted energy. Known for its bright, citrusy character.",
    foundIn: ["Citrus peels", "Juniper", "Rosemary"],
  },
  Caryophyllene: {
    name: "Caryophyllene",
    aroma: "Spicy, peppery, woody",
    description:
      "Unique among terpenes for binding to CB2 receptors. Associated with anti-inflammatory properties and a warm, grounding sensation.",
    foundIn: ["Black pepper", "Cloves", "Cinnamon", "Oregano"],
  },
  Linalool: {
    name: "Linalool",
    aroma: "Floral, lavender, sweet",
    description:
      "A calming terpene widely used in aromatherapy. Promotes relaxation and may help ease anxiety and restlessness.",
    foundIn: ["Lavender", "Birch bark", "Coriander"],
  },
  Pinene: {
    name: "Pinene",
    aroma: "Pine, fresh, sharp",
    description:
      "The most common terpene in nature. Linked to alertness, mental clarity, and may help counteract some THC-related memory effects.",
    foundIn: ["Pine needles", "Rosemary", "Basil", "Dill"],
  },
  Humulene: {
    name: "Humulene",
    aroma: "Hoppy, earthy, woody",
    description:
      "A subtle terpene that contributes to the earthy aroma of hops. Associated with mild appetite suppression and calming effects.",
    foundIn: ["Hops", "Sage", "Ginseng"],
  },
  Terpinolene: {
    name: "Terpinolene",
    aroma: "Piney, floral, herbal",
    description:
      "A multi-dimensional terpene with uplifting and mildly energizing qualities. Often found in sativa-leaning strains.",
    foundIn: ["Nutmeg", "Tea tree", "Lilacs", "Apples"],
  },
  Ocimene: {
    name: "Ocimene",
    aroma: "Sweet, herbal, woody",
    description:
      "A lighter terpene with an uplifting, energetic character. Commonly found in tropical and citrus-forward strains.",
    foundIn: ["Mint", "Parsley", "Orchids", "Kumquats"],
  },
  Bisabolol: {
    name: "Bisabolol",
    aroma: "Floral, honey-like, delicate",
    description:
      "A gentle terpene prized for its soothing properties. Often linked to relaxation and skin-calming benefits.",
    foundIn: ["Chamomile", "Candeia tree"],
  },
  Eucalyptol: {
    name: "Eucalyptol",
    aroma: "Minty, cool, eucalyptus",
    description:
      "A refreshing terpene associated with mental clarity and focus. Known for its invigorating, cooling sensation.",
    foundIn: ["Eucalyptus", "Tea tree", "Bay leaves", "Sage"],
  },
  Nerolidol: {
    name: "Nerolidol",
    aroma: "Woody, floral, citrus",
    description:
      "A sedative-leaning terpene with a complex aroma. Associated with deep relaxation and calming body effects.",
    foundIn: ["Jasmine", "Ginger", "Tea tree", "Lemongrass"],
  },
  Guaiol: {
    name: "Guaiol",
    aroma: "Piney, rosy, woody",
    description:
      "A sesquiterpenoid with a pine-rose aroma. Associated with gentle relaxation and mild analgesic properties.",
    foundIn: ["Guaiacum", "Cypress pine"],
  },
  Camphene: {
    name: "Camphene",
    aroma: "Damp, woodsy, camphor",
    description:
      "A sharp, herbal terpene linked to focus and clarity. Often found alongside pinene in coniferous plants.",
    foundIn: ["Camphor", "Turpentine", "Ginger oil", "Valerian"],
  },
  Geraniol: {
    name: "Geraniol",
    aroma: "Rose, sweet, fruity",
    description:
      "A floral terpene with a pleasant, rosy scent. Associated with gentle relaxation and a sociable, warm mood.",
    foundIn: ["Roses", "Geraniums", "Citronella", "Peaches"],
  },
  Valencene: {
    name: "Valencene",
    aroma: "Citrus, sweet orange, fresh",
    description:
      "Named after Valencia oranges, this terpene is linked to uplifted mood and creative energy with a bright character.",
    foundIn: ["Valencia oranges", "Grapefruits", "Tangerines"],
  },
};
