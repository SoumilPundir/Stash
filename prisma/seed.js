import { PrismaClient } from "@prisma/client";
import { subDays } from "date-fns";

const prisma = new PrismaClient();

// Categories with ranges
const CATEGORIES = {
  INCOME: [
    { name: "salary", range: [5000, 8000] },
    { name: "freelance", range: [1000, 3000] },
    { name: "investments", range: [500, 2000] },
    { name: "other-income", range: [100, 1000] },
  ],
  EXPENSE: [
    { name: "housing", range: [1000, 2000] },
    { name: "transportation", range: [100, 500] },
    { name: "groceries", range: [200, 600] },
    { name: "utilities", range: [100, 300] },
    { name: "entertainment", range: [50, 200] },
    { name: "food", range: [50, 150] },
    { name: "shopping", range: [100, 500] },
    { name: "healthcare", range: [100, 1000] },
    { name: "education", range: [200, 1000] },
    { name: "travel", range: [500, 2000] },
  ],
};

function randomAmount(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

function randomCategory(type) {
  const list = CATEGORIES[type];
  const category = list[Math.floor(Math.random() * list.length)];
  return { category: category.name, amount: randomAmount(...category.range) };
}

async function main() {
  console.log("🌱 Seeding Stash local data...");

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: "test@stash.dev" },
    update: {},
    create: {
      clerkUserId: "local-test-user",
      email: "test@stash.dev",
      name: "Test User",
    },
  });

  // Create an account
  const account = await prisma.account.upsert({
    where: { id: "local-test-account" },
    update: {},
    create: {
      id: "local-test-account",
      name: "Test Account",
      type: "CURRENT",
      balance: 0,
      userId: user.id,
      isDefault: true,
    },
  });

  let totalBalance = 0;
  const transactions = [];

  // Generate 60 days of random data
  for (let i = 60; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const count = Math.floor(Math.random() * 3) + 1;

    for (let j = 0; j < count; j++) {
      const type = Math.random() < 0.4 ? "INCOME" : "EXPENSE";
      const { category, amount } = randomCategory(type);

      transactions.push({
        id: crypto.randomUUID(),
        type,
        amount,
        description:
          type === "INCOME" ? `Received ${category}` : `Paid for ${category}`,
        date,
        category,
        status: "COMPLETED",
        userId: user.id,
        accountId: account.id,
        createdAt: date,
        updatedAt: date,
      });

      totalBalance += type === "INCOME" ? amount : -amount;
    }
  }

  await prisma.$transaction([
    prisma.transaction.deleteMany({ where: { accountId: account.id } }),
    prisma.transaction.createMany({ data: transactions }),
    prisma.account.update({
      where: { id: account.id },
      data: { balance: totalBalance },
    }),
  ]);

  console.log(`✅ Created ${transactions.length} transactions`);
  console.log("🌱 Seeding complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
  });
