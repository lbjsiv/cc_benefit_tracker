import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

type Frequency = "monthly" | "quarterly" | "half-yearly" | "yearly";
type BenefitType = "credit" | "free_night";

interface BenefitInput {
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
  benefits: BenefitInput[];
}

const cards: CardInput[] = [
  {
    card_id: "a1b2c3d4-0001-4000-8000-000000000001",
    card_name: "Amex Platinum",
    card_issuer: "American Express",
    image_url: "/cards/amex-platinum.png",
    benefits: [
      {
        benefit_description: "$15 Uber Cash Monthly Credit",
        benefit_category: "Travel",
        benefit_type: "credit",
        value: 15,
        frequency: "monthly",
        benefit_notes: "Uber & Uber Eats in the U.S. $35 in December ($15 + $20 bonus).",
      },
      {
        benefit_description: "$25 Digital Entertainment Credit",
        benefit_category: "Entertainment",
        benefit_type: "credit",
        value: 25,
        frequency: "monthly",
        benefit_notes: "Disney+, Hulu, ESPN+, Peacock, Paramount+, NYT, WSJ, YouTube Premium, YouTube TV.",
      },
      {
        benefit_description: "$12.95 Walmart+ Monthly Credit",
        benefit_category: "Shopping",
        benefit_type: "credit",
        value: 12.95,
        frequency: "monthly",
        benefit_notes: "Covers Walmart+ monthly membership fee (auto-renewal).",
      },
      {
        benefit_description: "$50 Saks Fifth Avenue Credit",
        benefit_category: "Shopping",
        benefit_type: "credit",
        value: 50,
        frequency: "half-yearly",
        benefit_notes: "Saks.com and Saks Fifth Avenue stores. Resets Jan–Jun and Jul–Dec.",
      },
      {
        benefit_description: "$100 Resy Dining Credit",
        benefit_category: "Dining",
        benefit_type: "credit",
        value: 100,
        frequency: "quarterly",
        benefit_notes: "Eligible U.S. restaurants on Resy. Must enroll.",
      },
      {
        benefit_description: "$75 lululemon Credit",
        benefit_category: "Shopping",
        benefit_type: "credit",
        value: 75,
        frequency: "quarterly",
        benefit_notes: "U.S. lululemon stores (excl. outlets) and lululemon.com.",
      },
      {
        benefit_description: "$200 Airline Fee Credit",
        benefit_category: "Travel",
        benefit_type: "credit",
        value: 200,
        frequency: "yearly",
        benefit_notes: "Incidental fees only (bags, seat upgrades, etc.). Select one airline per calendar year.",
      },
      {
        benefit_description: "$209 CLEAR+ Credit",
        benefit_category: "Travel",
        benefit_type: "credit",
        value: 209,
        frequency: "yearly",
        benefit_notes: "CLEAR+ membership auto-renewal. Must enroll.",
      },
      {
        benefit_description: "$200 Hotel Credit",
        benefit_category: "Travel",
        benefit_type: "credit",
        value: 200,
        frequency: "yearly",
        benefit_notes: "Prepaid hotels booked through American Express Travel.",
      },
      {
        benefit_description: "$300 Equinox Credit",
        benefit_category: "Fitness",
        benefit_type: "credit",
        value: 300,
        frequency: "yearly",
        benefit_notes: "Equinox+ digital fitness or Equinox club membership (auto-renewal).",
      },
    ],
  },
  {
    card_id: "a1b2c3d4-0002-4000-8000-000000000002",
    card_name: "Chase Sapphire Reserve",
    card_issuer: "Chase",
    image_url: "/cards/chase-sapphire-reserve.png",
    benefits: [
      {
        benefit_description: "$300 Annual Travel Credit",
        benefit_category: "Travel",
        benefit_type: "credit",
        value: 300,
        frequency: "yearly",
        benefit_notes: "Auto-applied to travel: flights, hotels, car rentals, tolls, transit, parking, and more.",
      },
      {
        benefit_description: "$5 DoorDash Monthly Credit",
        benefit_category: "Dining",
        benefit_type: "credit",
        value: 5,
        frequency: "monthly",
        benefit_notes: "DoorDash and Caviar orders. Must add card to DoorDash account.",
      },
      {
        benefit_description: "$10 Lyft Monthly Credit",
        benefit_category: "Travel",
        benefit_type: "credit",
        value: 10,
        frequency: "monthly",
        benefit_notes: "Lyft rides. Includes complimentary Lyft Pink membership.",
      },
      {
        benefit_description: "$15 Instacart+ Monthly Credit",
        benefit_category: "Shopping",
        benefit_type: "credit",
        value: 15,
        frequency: "monthly",
        benefit_notes: "Instacart orders. Includes complimentary Instacart+ membership.",
      },
      {
        benefit_description: "$10 Gopuff Monthly Credit",
        benefit_category: "Shopping",
        benefit_type: "credit",
        value: 10,
        frequency: "monthly",
        benefit_notes: "Gopuff delivery orders. Must add card to Gopuff account.",
      },
    ],
  },
  {
    card_id: "a1b2c3d4-0003-4000-8000-000000000003",
    card_name: "Chase Sapphire Preferred",
    card_issuer: "Chase",
    image_url: "/cards/chase-sapphire-preferred.png",
    benefits: [
      {
        benefit_description: "$50 Annual Hotel Credit",
        benefit_category: "Travel",
        benefit_type: "credit",
        value: 50,
        frequency: "yearly",
        benefit_notes: "Hotel stays booked through Chase Travel portal.",
      },
      {
        benefit_description: "$5 DoorDash Monthly Credit",
        benefit_category: "Dining",
        benefit_type: "credit",
        value: 5,
        frequency: "monthly",
        benefit_notes: "DoorDash and Caviar orders. Must add card to DoorDash account.",
      },
    ],
  },
  {
    card_id: "a1b2c3d4-0004-4000-8000-000000000004",
    card_name: "Chase IHG One Rewards Premier",
    card_issuer: "Chase",
    image_url: "/cards/chase-ihg-premier.png",
    benefits: [
      {
        benefit_description: "Free Night Certificate",
        benefit_category: "Hotel",
        benefit_type: "free_night",
        value: 0,
        frequency: "yearly",
        benefit_notes: "Valid at IHG hotels up to 40,000 points per night. Awarded on account anniversary.",
      },
    ],
  },
  {
    card_id: "a1b2c3d4-0005-4000-8000-000000000005",
    card_name: "Chase Marriott Bonvoy Boundless",
    card_issuer: "Chase",
    image_url: "/cards/chase-marriott-boundless.png",
    benefits: [
      {
        benefit_description: "Free Night Award",
        benefit_category: "Hotel",
        benefit_type: "free_night",
        value: 0,
        frequency: "yearly",
        benefit_notes: "Valid at Marriott properties up to 35,000 points per night. Awarded on account anniversary.",
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

  const { error: benefitError } = await supabase
    .from("card_benefits")
    .upsert(benefitRows, {
      onConflict: "card_id,benefit_description",
      ignoreDuplicates: false,
    });

  if (benefitError) {
    console.error("Error seeding benefits:", benefitError);
    process.exit(1);
  }
  console.log(`  ✓ Upserted ${benefitRows.length} benefits`);
  console.log("Seed complete!");
}

seed();
