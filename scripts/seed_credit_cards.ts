import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

type Frequency = "monthly" | "quarterly" | "half-yearly" | "yearly";
type BenefitType = "credit" | "free_night";

interface BenefitInput {
  benefit_id: string;
  benefit_description: string;
  benefit_category: string;
  benefit_type: BenefitType;
  value: number;
  frequency: Frequency;
  benefit_notes?: string;
}

interface CardInput {
  card_id: string;
  card_name: string;
  card_issuer: string;
  image_url: string;
  card_points_multipliers: string;
  card_badge_acronym: string;
  card_badge_color: string;
  card_annual_fee: number;
  benefits: BenefitInput[];
}

const cards: CardInput[] = [
  {
    card_id: "a1b2c3d4-0001-4000-8000-000000000001",
    card_name: "Amex Platinum",
    card_issuer: "American Express",
    image_url: "/cards/amex-platinum.png",
    card_points_multipliers: "5X Flights (direct or Amex Travel) · 5X Hotels (Amex Travel)",
    card_badge_acronym: "AP",
    card_badge_color: "#64748b",
    card_annual_fee: 895,
    benefits: [
      {
        benefit_id: "b0000000-0001-4000-8000-000000000001",
        benefit_description: "$15 Uber Cash Credit",
        benefit_category: "Travel",
        benefit_type: "credit",
        value: 15,
        frequency: "monthly",
        benefit_notes: "Total $200 annually, with a $20 bonus in December.",
      },
      {
        benefit_id: "b0000000-0001-4000-8000-000000000002",
        benefit_description: "$25 Digital Entertainment Credit",
        benefit_category: "Entertainment",
        benefit_type: "credit",
        value: 25,
        frequency: "monthly",
        benefit_notes: "Disney+, Hulu, ESPN+, Peacock, Paramount+, NYT, WSJ, YouTube. Total $300 annually.",
      },
      {
        benefit_id: "b0000000-0001-4000-8000-000000000003",
        benefit_description: "$50 Saks Fifth Avenue Credit",
        benefit_category: "Shopping",
        benefit_type: "credit",
        value: 50,
        frequency: "half-yearly",
        benefit_notes: "Total $100 annually.",
      },
      {
        benefit_id: "b0000000-0001-4000-8000-000000000004",
        benefit_description: "$300 Hotel Credit",
        benefit_category: "Travel",
        benefit_type: "credit",
        value: 300,
        frequency: "half-yearly",
        benefit_notes: "Total $600 annually for prepaid FHR or The Hotel Collection bookings.",
      },
      {
        benefit_id: "b0000000-0001-4000-8000-000000000005",
        benefit_description: "$200 Airline Fee Credit",
        benefit_category: "Travel",
        benefit_type: "credit",
        value: 200,
        frequency: "yearly",
        benefit_notes: "Incidental fees on one selected airline.",
      },
      {
        benefit_id: "b0000000-0001-4000-8000-000000000006",
        benefit_description: "$300 Equinox Credit",
        benefit_category: "Fitness",
        benefit_type: "credit",
        value: 300,
        frequency: "yearly",
        benefit_notes: "Equinox+ digital or club membership.",
      },
      {
        benefit_id: "b0000000-0001-4000-8000-000000000007",
        benefit_description: "$100 Resy Credit",
        benefit_category: "Dining",
        benefit_type: "credit",
        value: 100,
        frequency: "quarterly",
        benefit_notes: "Total $400 annually at U.S. Resy restaurants.",
      },
      {
        benefit_id: "b0000000-0001-4000-8000-000000000008",
        benefit_description: "$75 lululemon Credit",
        benefit_category: "Shopping",
        benefit_type: "credit",
        value: 75,
        frequency: "quarterly",
        benefit_notes: "Total $300 annually.",
      },
    ],
  },
  {
    card_id: "a1b2c3d4-0002-4000-8000-000000000002",
    card_name: "Chase Sapphire Reserve",
    card_issuer: "Chase",
    image_url: "/cards/chase-sapphire-reserve.png",
    card_points_multipliers: "10X Hotels & Cars (Chase Travel) · 10X Chase Dining · 5X Flights (Chase Travel) · 3X Dining · 3X Travel",
    card_badge_acronym: "CSR",
    card_badge_color: "#1e3a8a",
    card_annual_fee: 795,
    benefits: [
      {
        benefit_id: "b0000000-0002-4000-8000-000000000001",
        benefit_description: "$300 Travel Credit",
        benefit_category: "Travel",
        benefit_type: "credit",
        value: 300,
        frequency: "yearly",
        benefit_notes: "Auto-applied to broad travel purchases.",
      },
      {
        benefit_id: "b0000000-0002-4000-8000-000000000002",
        benefit_description: "$5 DoorDash Restaurant Credit",
        benefit_category: "Dining",
        benefit_type: "credit",
        value: 5,
        frequency: "monthly",
        benefit_notes: "Total $60 annually.",
      },
      {
        benefit_id: "b0000000-0002-4000-8000-000000000003",
        benefit_description: "$20 DoorDash Non-Restaurant Credit",
        benefit_category: "Shopping",
        benefit_type: "credit",
        value: 20,
        frequency: "monthly",
        benefit_notes: "Total $240 annually.",
      },
      {
        benefit_id: "b0000000-0002-4000-8000-000000000004",
        benefit_description: "$10 Lyft Credit",
        benefit_category: "Travel",
        benefit_type: "credit",
        value: 10,
        frequency: "monthly",
        benefit_notes: "Total $120 annually.",
      },
      {
        benefit_id: "b0000000-0002-4000-8000-000000000005",
        benefit_description: "$150 Dining Credit",
        benefit_category: "Dining",
        benefit_type: "credit",
        value: 150,
        frequency: "half-yearly",
        benefit_notes: "Total $300 annually for Sapphire Reserve Exclusive Tables.",
      },
      {
        benefit_id: "b0000000-0002-4000-8000-000000000006",
        benefit_description: "$250 'The Edit' Hotel Credit",
        benefit_category: "Travel",
        benefit_type: "credit",
        value: 250,
        frequency: "half-yearly",
        benefit_notes: "Total $500 annually for bookings via 'The Edit by Chase Travel'.",
      },
      {
        benefit_id: "b0000000-0002-4000-8000-000000000007",
        benefit_description: "$150 StubHub Credit",
        benefit_category: "Entertainment",
        benefit_type: "credit",
        value: 150,
        frequency: "half-yearly",
        benefit_notes: "Total $300 annually.",
      },
      {
        benefit_id: "b0000000-0002-4000-8000-000000000008",
        benefit_description: "$250 Select Hotel Credit",
        benefit_category: "Travel",
        benefit_type: "credit",
        value: 250,
        frequency: "yearly",
        benefit_notes: "One-time credit available through 12/31/26 for select hotel partners.",
      },
    ],
  },
  {
    card_id: "a1b2c3d4-0003-4000-8000-000000000003",
    card_name: "Chase Sapphire Preferred",
    card_issuer: "Chase",
    image_url: "/cards/chase-sapphire-preferred.png",
    card_points_multipliers: "5X Travel (Chase Travel) · 3X Dining · 3X Online grocery · 3X Streaming · 2X Travel",
    card_badge_acronym: "CSP",
    card_badge_color: "#2563eb",
    card_annual_fee: 95,
    benefits: [
      {
        benefit_id: "b0000000-0003-4000-8000-000000000001",
        benefit_description: "$50 Hotel Credit",
        benefit_category: "Travel",
        benefit_type: "credit",
        value: 50,
        frequency: "yearly",
        benefit_notes: "Hotels booked through the Chase Travel portal.",
      },
    ],
  },
  {
    card_id: "a1b2c3d4-0004-4000-8000-000000000004",
    card_name: "Chase IHG Premier",
    card_issuer: "Chase",
    image_url: "/cards/chase-ihg-premier.png",
    card_points_multipliers: "Up to 26X IHG · 5X Travel, dining & gas",
    card_badge_acronym: "IHG",
    card_badge_color: "#15803d",
    card_annual_fee: 99,
    benefits: [
      {
        benefit_id: "b0000000-0004-4000-8000-000000000001",
        benefit_description: "Free Night Certificate",
        benefit_category: "Hotel",
        benefit_type: "free_night",
        value: 0,
        frequency: "yearly",
        benefit_notes: "Valid at IHG hotels up to 40,000 points/night.",
      },
    ],
  },
  {
    card_id: "a1b2c3d4-0005-4000-8000-000000000005",
    card_name: "Chase Marriott Bonvoy Boundless",
    card_issuer: "Chase",
    image_url: "/cards/chase-marriott-boundless.png",
    card_points_multipliers: "Up to 17X Marriott · 3X Gas, groceries & dining (on first $6k/yr) · 2X Other Travel",
    card_badge_acronym: "CMB",
    card_badge_color: "#991b1b",
    card_annual_fee: 95,
    benefits: [
      {
        benefit_id: "b0000000-0005-4000-8000-000000000001",
        benefit_description: "Free Night Award",
        benefit_category: "Hotel",
        benefit_type: "free_night",
        value: 0,
        frequency: "yearly",
        benefit_notes: "Valid at Marriott properties up to 35,000 points/night.",
      },
    ],
  },
  {
    card_id: "a1b2c3d4-0006-4000-8000-000000000006",
    card_name: "Chase World of Hyatt",
    card_issuer: "Chase",
    image_url: "/cards/chase-world-of-hyatt.png",
    card_points_multipliers: "Up to 9X Hyatt · 2X Dining, flights, local transit & gyms",
    card_badge_acronym: "WoH",
    card_badge_color: "#1a56db",
    card_annual_fee: 95,
    benefits: [
      {
        benefit_id: "b0000000-0006-4000-8000-000000000001",
        benefit_description: "Category 1-4 Hyatt Free Night",
        benefit_category: "Hotel",
        benefit_type: "free_night",
        value: 0,
        frequency: "yearly",
        benefit_notes: "One free night at any Category 1-4 Hyatt hotel.",
      },
    ],
  },
  {
    card_id: "a1b2c3d4-0007-4000-8000-000000000007",
    card_name: "Amex Hilton Aspire",
    card_issuer: "American Express",
    image_url: "/cards/amex-hilton-aspire.png",
    card_points_multipliers: "14X Hilton · 7X Flights, car rentals & U.S. restaurants",
    card_badge_acronym: "HLT",
    card_badge_color: "#5b21b6",
    card_annual_fee: 550,
    benefits: [
      {
        benefit_id: "b0000000-0007-4000-8000-000000000001",
        benefit_description: "$200 Hilton Resort Credit",
        benefit_category: "Travel",
        benefit_type: "credit",
        value: 200,
        frequency: "half-yearly",
        benefit_notes: "Total $400 annually.",
      },
      {
        benefit_id: "b0000000-0007-4000-8000-000000000002",
        benefit_description: "$50 Flight Credit",
        benefit_category: "Travel",
        benefit_type: "credit",
        value: 50,
        frequency: "quarterly",
        benefit_notes: "Total $200 annually.",
      },
      {
        benefit_id: "b0000000-0007-4000-8000-000000000003",
        benefit_description: "Annual Free Night Reward",
        benefit_category: "Hotel",
        benefit_type: "free_night",
        value: 0,
        frequency: "yearly",
        benefit_notes: "One free night at a Hilton property.",
      },
    ],
  },
  {
    card_id: "a1b2c3d4-0008-4000-8000-000000000008",
    card_name: "Amex Gold",
    card_issuer: "American Express",
    image_url: "/cards/amex-gold.png",
    card_points_multipliers: "4X Restaurants · 4X U.S. Supermarkets · 3X Flights",
    card_badge_acronym: "AG",
    card_badge_color: "#fcd34d",
    card_annual_fee: 325,
    benefits: [
      {
        benefit_id: "b0000000-0008-4000-8000-000000000001",
        benefit_description: "$10 Uber Cash Credit",
        benefit_category: "Travel",
        benefit_type: "credit",
        value: 10,
        frequency: "monthly",
        benefit_notes: "Total $120 annually for U.S. Uber rides or Uber Eats.",
      },
      {
        benefit_id: "b0000000-0008-4000-8000-000000000002",
        benefit_description: "$10 Dining Credit",
        benefit_category: "Dining",
        benefit_type: "credit",
        value: 10,
        frequency: "monthly",
        benefit_notes: "Total $120 annually. Partners include Grubhub, The Cheesecake Factory, and more.",
      },
      {
        benefit_id: "b0000000-0008-4000-8000-000000000003",
        benefit_description: "$7 Dunkin' Credit",
        benefit_category: "Dining",
        benefit_type: "credit",
        value: 7,
        frequency: "monthly",
        benefit_notes: "Total $84 annually at U.S. Dunkin' locations.",
      },
      {
        benefit_id: "b0000000-0008-4000-8000-000000000004",
        benefit_description: "$50 Resy Credit",
        benefit_category: "Dining",
        benefit_type: "credit",
        value: 50,
        frequency: "half-yearly",
        benefit_notes: "Total $100 annually for dining at U.S. Resy restaurants.",
      },
    ],
  },
  {
    card_id: "a1b2c3d4-0009-4000-8000-000000000009",
    card_name: "HSBC Premier",
    card_issuer: "HSBC",
    image_url: "/cards/hsbc-premier.png",
    card_points_multipliers: "3X Gas & Groceries · 2X Travel",
    card_badge_acronym: "HSBC",
    card_badge_color: "#db0011",
    card_annual_fee: 95,
    benefits: [
      {
        benefit_id: "b0000000-0009-4000-8000-000000000001",
        benefit_description: "$5 Streaming Credit",
        benefit_category: "Entertainment",
        benefit_type: "credit",
        value: 5,
        frequency: "monthly",
        benefit_notes: "Total $60 annually for TV and radio streaming services.",
      },
      {
        benefit_id: "b0000000-0009-4000-8000-000000000002",
        benefit_description: "$5 Lyft Credit",
        benefit_category: "Travel",
        benefit_type: "credit",
        value: 5,
        frequency: "monthly",
        benefit_notes: "Credit received after taking 3 rides each month.",
      },
    ],
  },
  {
    card_id: "a1b2c3d4-0010-4000-8000-000000000010",
    card_name: "Amex Marriott Bonvoy Brilliant",
    card_issuer: "American Express",
    image_url: "/cards/marriott-bonvoy-brilliant.png",
    card_points_multipliers: "6X Marriott · 3X Flights & Restaurants · 2X Everywhere Else",
    card_badge_acronym: "MBB",
    card_badge_color: "#708090",
    card_annual_fee: 650,
    benefits: [
      {
        benefit_id: "b0000000-0010-4000-8000-000000000001",
        benefit_description: "$25 Dining Credit",
        benefit_category: "Dining",
        benefit_type: "credit",
        value: 25,
        frequency: "monthly",
        benefit_notes: "Total $300 annually for restaurants worldwide.",
      },
      {
        benefit_id: "b0000000-0010-4000-8000-000000000002",
        benefit_description: "Free Night Award",
        benefit_category: "Hotel",
        benefit_type: "free_night",
        value: 0,
        frequency: "yearly",
        benefit_notes: "Valid for one night up to 85,000 points.",
      },
    ],
  },
];

async function seed() {
  console.log("Seeding credit cards...");

  const cardRows = cards.map(({ benefits: _, ...card }) => card);
  const { error: cardError } = await supabase
    .from("dim_all_cards")
    .upsert(cardRows, { onConflict: "card_id" });

  if (cardError) {
    console.error("Error seeding cards:", cardError);
    process.exit(1);
  }
  console.log(`  ✓ Upserted ${cardRows.length} cards`);

  const benefitRows = cards.flatMap((card) =>
    card.benefits.map((b) => ({
      card_id: card.card_id,
      ...b,
    }))
  );

  // Remove stale benefits BEFORE upserting so old rows with random IDs
  // don't collide with new deterministic-ID rows on any unique constraints.
  // ON DELETE CASCADE on user_used_benefits.benefit_id handles cleanup of usage records.
  const seededBenefitIds = benefitRows.map((b) => b.benefit_id);
  const seededCardIds = cards.map((c) => c.card_id);

  const { data: existingBenefits } = await supabase
    .from("card_benefits")
    .select("benefit_id")
    .in("card_id", seededCardIds);

  const staleIds = (existingBenefits ?? [])
    .map((b) => b.benefit_id)
    .filter((id: string) => !seededBenefitIds.includes(id));

  if (staleIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("card_benefits")
      .delete()
      .in("benefit_id", staleIds);

    if (deleteError) {
      console.error("Error removing stale benefits:", deleteError);
      process.exit(1);
    }
    console.log(`  ✓ Removed ${staleIds.length} stale benefit(s)`);
  } else {
    console.log("  ✓ No stale benefits to remove");
  }

  const { error: benefitError } = await supabase
    .from("card_benefits")
    .upsert(benefitRows, { onConflict: "benefit_id" });

  if (benefitError) {
    console.error("Error seeding benefits:", benefitError);
    process.exit(1);
  }
  console.log(`  ✓ Upserted ${benefitRows.length} benefits`);

  console.log("Seed complete!");
}

seed();