import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

type Frequency = "monthly" | "quarterly" | "half-yearly" | "yearly";

interface BenefitInput {
  benefit_description: string;
  benefit_category: string;
  value: number;
  frequency: Frequency;
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
    card_name: "Chase Sapphire Reserve",
    card_issuer: "Chase",
    image_url: "/cards/chase-sapphire-reserve.png",
    benefits: [
      {
        benefit_description: "$300 Annual Travel Credit",
        benefit_category: "Travel",
        value: 300,
        frequency: "yearly",
      },
      {
        benefit_description: "$100 Global Entry / TSA PreCheck Credit",
        benefit_category: "Travel",
        value: 100,
        frequency: "yearly",
      },
      {
        benefit_description: "$10 DoorDash Monthly Credit",
        benefit_category: "Dining",
        value: 10,
        frequency: "monthly",
      },
      {
        benefit_description: "$5 Lyft Pink Monthly Ride Credit",
        benefit_category: "Travel",
        value: 5,
        frequency: "monthly",
      },
      {
        benefit_description: "$25 Instacart Quarterly Credit",
        benefit_category: "Shopping",
        value: 25,
        frequency: "quarterly",
      },
    ],
  },
  {
    card_id: "a1b2c3d4-0002-4000-8000-000000000002",
    card_name: "Amex Platinum",
    card_issuer: "American Express",
    image_url: "/cards/amex-platinum.png",
    benefits: [
      {
        benefit_description: "$200 Airline Fee Credit",
        benefit_category: "Travel",
        value: 200,
        frequency: "yearly",
      },
      {
        benefit_description: "$200 Hotel Credit",
        benefit_category: "Travel",
        value: 200,
        frequency: "yearly",
      },
      {
        benefit_description: "$15 Uber Cash Monthly Credit",
        benefit_category: "Travel",
        value: 15,
        frequency: "monthly",
      },
      {
        benefit_description: "$20 Digital Entertainment Monthly Credit",
        benefit_category: "Entertainment",
        value: 20,
        frequency: "monthly",
      },
      {
        benefit_description: "$50 Saks Fifth Avenue Semi-Annual Credit",
        benefit_category: "Shopping",
        value: 100,
        frequency: "half-yearly",
      },
      {
        benefit_description: "$189 CLEAR Plus Credit",
        benefit_category: "Travel",
        value: 189,
        frequency: "yearly",
      },
    ],
  },
  {
    card_id: "a1b2c3d4-0003-4000-8000-000000000003",
    card_name: "Capital One Venture X",
    card_issuer: "Capital One",
    image_url: "/cards/capital-one-venture-x.png",
    benefits: [
      {
        benefit_description: "$300 Annual Travel Credit (via Capital One Travel)",
        benefit_category: "Travel",
        value: 300,
        frequency: "yearly",
      },
      {
        benefit_description: "10,000 Anniversary Miles Bonus",
        benefit_category: "Rewards",
        value: 100,
        frequency: "yearly",
      },
      {
        benefit_description: "$100 Global Entry / TSA PreCheck Credit",
        benefit_category: "Travel",
        value: 100,
        frequency: "yearly",
      },
    ],
  },
  {
    card_id: "a1b2c3d4-0004-4000-8000-000000000004",
    card_name: "Citi Strata Premier",
    card_issuer: "Citi",
    image_url: "/cards/citi-strata-premier.png",
    benefits: [
      {
        benefit_description: "$100 Annual Hotel Credit",
        benefit_category: "Travel",
        value: 100,
        frequency: "yearly",
      },
      {
        benefit_description: "$10 Monthly Streaming Credit",
        benefit_category: "Entertainment",
        value: 10,
        frequency: "monthly",
      },
      {
        benefit_description: "$50 Semi-Annual Dining Credit",
        benefit_category: "Dining",
        value: 50,
        frequency: "half-yearly",
      },
    ],
  },
  {
    card_id: "a1b2c3d4-0005-4000-8000-000000000005",
    card_name: "US Bank Altitude Reserve",
    card_issuer: "US Bank",
    image_url: "/cards/us-bank-altitude-reserve.png",
    benefits: [
      {
        benefit_description: "$325 Annual Travel Credit",
        benefit_category: "Travel",
        value: 325,
        frequency: "yearly",
      },
      {
        benefit_description: "$12 Monthly Streaming Credit",
        benefit_category: "Entertainment",
        value: 12,
        frequency: "monthly",
      },
      {
        benefit_description: "$100 Global Entry / TSA PreCheck Credit",
        benefit_category: "Travel",
        value: 100,
        frequency: "yearly",
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
