/* MapleHome Budget seed data: a fictional four-person household, Nov 2026.
   Amounts in USD. Categories and monthly budget limits are the household's own. */
const CATEGORIES = ["Housing", "Food", "Transport", "Utilities", "Health", "Education", "Leisure", "Clothing", "Savings", "Other"];
const CATEGORY_COLORS = { Housing: "#2f5d8a", Food: "#0e7a6d", Transport: "#c96a1e", Utilities: "#7a4a8a",
  Health: "#a03a3a", Education: "#3a7a3a", Leisure: "#8a6d1f", Clothing: "#5a7a8a", Savings: "#17324a", Other: "#9aa7b0" };
const DEFAULT_BUDGETS = { Housing: 1900, Food: 900, Transport: 350, Utilities: 280, Health: 250,
  Education: 300, Leisure: 250, Clothing: 150, Savings: 600, Other: 120 };
const DEFAULT_GOALS = [
  { id: "g1", name: "Emergency fund", target: 10000, saved: 6400, note: "Six months of essentials, kept in a separate savings account." },
  { id: "g2", name: "Summer holiday", target: 3000, saved: 1150, note: "Two weeks by the coast in July — flights, stay and food." },
  { id: "g3", name: "New laptop for school", target: 1400, saved: 620, note: "Replaces the 2019 laptop the kids share for homework." },
];
function seedTransactions() {
  let id = 1;
  const t = (date, type, category, amount, note) => ({ id: "t" + (id++), date, type, category, amount, note });
  return [
    t("2026-11-01", "income", "Other", 4800, "Salary — Ana Rivera"),
    t("2026-11-01", "income", "Other", 3900, "Salary — Marco Rivera"),
    t("2026-11-01", "expense", "Housing", 1850, "Monthly rent"),
    t("2026-11-03", "expense", "Food", 182, "Weekly shop — supermarket"),
    t("2026-11-04", "expense", "Transport", 96, "Fuel — family car"),
    t("2026-11-05", "expense", "Utilities", 148, "Electricity bill"),
    t("2026-11-06", "expense", "Education", 120, "Piano lessons — Sofia"),
    t("2026-11-07", "expense", "Food", 64, "Farmers market"),
    t("2026-11-08", "expense", "Leisure", 58, "Cinema — family of four"),
    t("2026-11-10", "expense", "Food", 176, "Weekly shop — supermarket"),
    t("2026-11-11", "expense", "Health", 85, "Pharmacy — prescriptions"),
    t("2026-11-12", "expense", "Transport", 45, "Bus passes — kids"),
    t("2026-11-14", "income", "Other", 650, "Freelance design — Ana"),
    t("2026-11-14", "expense", "Leisure", 92, "Birthday dinner out"),
    t("2026-11-15", "expense", "Utilities", 74, "Water bill"),
    t("2026-11-17", "expense", "Food", 194, "Weekly shop — supermarket"),
    t("2026-11-18", "expense", "Clothing", 118, "Winter coats — kids"),
    t("2026-11-19", "expense", "Education", 60, "School trip — Leo"),
    t("2026-11-20", "expense", "Savings", 600, "Transfer to emergency fund"),
    t("2026-11-21", "expense", "Food", 71, "Bakery and fruit"),
    t("2026-11-23", "expense", "Health", 140, "Dentist check-up — Marco"),
    t("2026-11-24", "expense", "Food", 169, "Weekly shop — supermarket"),
    t("2026-11-25", "expense", "Transport", 88, "Fuel — family car"),
    t("2026-11-26", "expense", "Leisure", 46, "Streaming and books"),
    // October 2026, for the month-to-month comparison
    t("2026-10-01", "income", "Other", 4800, "Salary — Ana Rivera"),
    t("2026-10-01", "income", "Other", 3900, "Salary — Marco Rivera"),
    t("2026-10-01", "expense", "Housing", 1850, "Monthly rent"),
    t("2026-10-06", "expense", "Food", 720, "Groceries — October"),
    t("2026-10-09", "expense", "Utilities", 210, "Electricity and water"),
    t("2026-10-12", "expense", "Transport", 240, "Fuel and bus passes"),
    t("2026-10-15", "expense", "Education", 180, "Lessons and school costs"),
    t("2026-10-18", "expense", "Health", 110, "Pharmacy"),
    t("2026-10-20", "expense", "Savings", 600, "Transfer to emergency fund"),
    t("2026-10-22", "expense", "Leisure", 210, "Weekend trip and cinema"),
    t("2026-10-26", "expense", "Clothing", 95, "School shoes — Leo"),
  ];
}
