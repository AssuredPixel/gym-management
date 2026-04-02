import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import Gym from "@/models/Gym";
import User from "@/models/User";
import Membership from "@/models/Membership";
import ActivityLog from "@/models/ActivityLog";
import Payment from "@/models/Payment";
import WODClass from "@/models/WODClass";

export async function seedDatabase() {
  await dbConnect();

  // ─── 1. Gym ────────────────────────────────────────────────────────────────
  const gym = await Gym.findOneAndUpdate(
    { email: "contact@boxosfitness.com" },
    {
      $set: {
        name: "BoxOS Fitness",
        ownerName: "James Carter",
        email: "contact@boxosfitness.com",
        size: "medium",
        plan: "starter",
      },
    },
    { upsert: true, new: true }
  );
  console.log("Seeded/Updated Gym:", gym.name);

  // ─── 2. Owner ─────────────────────────────────────────────────────────────
  const ownerHash = await bcrypt.hash("password123", 10);
  const owner = await User.findOneAndUpdate(
    { email: "owner@gym.com" },
    {
      $set: {
        name: "James Carter",
        email: "owner@gym.com",
        hashedPassword: ownerHash,
        role: "owner",
        gymId: gym._id,
        isActive: true,
      },
    },
    { upsert: true, new: true }
  );
  console.log("Seeded Owner:", owner.email);

  // ─── 3. Five Test Members ──────────────────────────────────────────────────
  const memberHash = await bcrypt.hash("password123", 10);

  const daysAgo = (n: number): Date => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
  const daysFromNow = (n: number): Date => { const d = new Date(); d.setDate(d.getDate() + n); return d; };

  interface TestMemberDef {
    name: string;
    email: string;
    phone: string;
    plan: "monthly" | "quarterly" | "annual";
    status: "active" | "expiring" | "expired";
    startDate: Date;
    endDate: Date;
    isActive: boolean;
  }

  const testMembers: TestMemberDef[] = [
    {
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      phone: "+1 (555) 100-2001",
      plan: "annual",
      status: "active",
      startDate: daysAgo(90),
      endDate: daysFromNow(275),
      isActive: true,
    },
    {
      name: "Marcus Bell",
      email: "marcus.bell@example.com",
      phone: "+1 (555) 100-2002",
      plan: "monthly",
      status: "active",
      startDate: daysAgo(20),
      endDate: daysFromNow(10),
      isActive: true,
    },
    {
      name: "Priya Patel",
      email: "priya.patel@example.com",
      phone: "+1 (555) 100-2003",
      plan: "quarterly",
      status: "expiring",
      startDate: daysAgo(85),
      endDate: daysFromNow(5),
      isActive: true,
    },
    {
      name: "Tom Hughes",
      email: "tom.hughes@example.com",
      phone: "+1 (555) 100-2004",
      plan: "monthly",
      status: "expired",
      startDate: daysAgo(60),
      endDate: daysAgo(30),
      isActive: false,
    },
    {
      name: "Lena Moreau",
      email: "lena.moreau@example.com",
      phone: "+1 (555) 100-2005",
      plan: "annual",
      status: "active",
      startDate: daysAgo(14),
      endDate: daysFromNow(351),
      isActive: true,
    },
  ];

  const createdMembers = [];
  for (const m of testMembers) {
    const user = await User.findOneAndUpdate(
      { email: m.email },
      {
        $set: {
          name: m.name,
          email: m.email,
          phone: m.phone,
          hashedPassword: memberHash,
          role: "member",
          gymId: gym._id,
          isActive: m.isActive,
        },
      },
      { upsert: true, new: true }
    );

    await Membership.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          userId: user._id,
          gymId: gym._id,
          plan: m.plan,
          startDate: m.startDate,
          endDate: m.endDate,
          status: m.status,
          autoRenew: m.status !== "expired",
        },
      },
      { upsert: true, new: true }
    );

    createdMembers.push(user);
    console.log(`Seeded member: ${user.name} (${m.plan}, ${m.status})`);
  }

  // ─── 4. Activity Logs ─────────────────────────────────────────────────────
  await ActivityLog.deleteMany({ gymId: gym._id });
  await ActivityLog.create([
    { gymId: gym._id, type: "member_added", description: "Sarah Johnson joined the box", createdAt: daysAgo(90) },
    { gymId: gym._id, type: "member_added", description: "Marcus Bell joined the box", createdAt: daysAgo(20) },
    { gymId: gym._id, type: "member_added", description: "Priya Patel joined the box", createdAt: daysAgo(85) },
    { gymId: gym._id, type: "payment_received", description: "Payment of $840 received from Sarah Johnson", createdAt: daysAgo(90) },
    { gymId: gym._id, type: "payment_received", description: "Payment of $89 received from Marcus Bell", createdAt: daysAgo(20) },
    { gymId: gym._id, type: "class_created", description: "New Early Bird WOD class scheduled", createdAt: daysAgo(3) },
  ]);
  console.log("Seeded Activity Logs");

  // ─── 5. Payments ──────────────────────────────────────────────────────────
  await Payment.deleteMany({ gymId: gym._id });

  const planAmounts: Record<string, number> = { monthly: 89, quarterly: 240, annual: 840 };
  const paymentDocs = [];

  for (let i = 0; i < createdMembers.length; i++) {
    const user = createdMembers[i];
    const memberDef = testMembers[i];
    const amount = planAmounts[memberDef.plan];

    // All payments use recent createdAt so the dashboard monthly revenue filter picks them up
    paymentDocs.push({ gymId: gym._id, userId: user._id, amount, status: "completed", createdAt: daysAgo(3) });
    if (memberDef.status !== "expired") {
      // Active/expiring members get a second payment from earlier in the month
      paymentDocs.push({ gymId: gym._id, userId: user._id, amount, status: "completed", createdAt: daysAgo(1) });
    }
  }

  await Payment.create(paymentDocs);
  console.log(`Seeded ${paymentDocs.length} payments`);

  // ─── 6. WOD Classes (with member attendees) ───────────────────────────────
  await WODClass.deleteMany({ gymId: gym._id });

  // Grab active members to add as attendees
  const activeMembers = createdMembers.filter((_, i) => testMembers[i].status !== "expired");
  const allAttendees = activeMembers.map((m) => m._id);

  await WODClass.create([
    {
      gymId: gym._id,
      name: "Early Bird WOD",
      instructor: "James Carter",
      dateTime: daysAgo(7),
      capacity: 20,
      attendees: allAttendees,
    },
    {
      gymId: gym._id,
      name: "Lunch Strength",
      instructor: "James Carter",
      dateTime: daysAgo(3),
      capacity: 15,
      attendees: [createdMembers[0]._id, createdMembers[2]._id],
    },
    {
      gymId: gym._id,
      name: "Friday Conditioning",
      instructor: "James Carter",
      dateTime: daysAgo(1),
      capacity: 20,
      attendees: [createdMembers[0]._id, createdMembers[1]._id, createdMembers[4]._id],
    },
    {
      gymId: gym._id,
      name: "Saturday Throwdown",
      instructor: "James Carter",
      dateTime: daysFromNow(1),
      capacity: 20,
      attendees: [],
    },
  ]);
  console.log("Seeded WOD Classes");

  return {
    success: true,
    message: "Database seeded with 5 test members (active/expiring/expired) + payments + classes!",
    credentials: {
      owner: { email: "owner@gym.com", password: "password123" },
      members: testMembers.map((m) => ({
        name: m.name,
        email: m.email,
        password: "password123",
        plan: m.plan,
        status: m.status,
      })),
    },
  };
}
