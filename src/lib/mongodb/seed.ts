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
        phone: "+234 812 345 6789",
        address: "123 Gym Street, Victoria Island, Lagos",
        size: "medium",
        plan: "starter",
        businessHours: [
          { day: "Monday", open: "06:00", close: "21:00", isClosed: false },
          { day: "Tuesday", open: "06:00", close: "21:00", isClosed: false },
          { day: "Wednesday", open: "06:00", close: "21:00", isClosed: false },
          { day: "Thursday", open: "06:00", close: "21:00", isClosed: false },
          { day: "Friday", open: "06:00", close: "21:00", isClosed: false },
          { day: "Saturday", open: "08:00", close: "18:00", isClosed: false },
          { day: "Sunday", open: "08:00", close: "14:00", isClosed: true },
        ]
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

  // ─── 2b. Instructors ──────────────────────────────────────────────────────
  const instructorHash = await bcrypt.hash("password123", 10);
  const instructorData = [
    { name: "Coach Mike", email: "mike@boxos.com", phone: "+234 701 111 2222" },
    { name: "Sarah Coach", email: "sarah@boxos.com", phone: "+234 701 333 4444" },
  ];

  for (const inst of instructorData) {
    await User.findOneAndUpdate(
      { email: inst.email },
      {
        $set: {
          name: inst.name,
          email: inst.email,
          phone: inst.phone,
          hashedPassword: instructorHash,
          role: "instructor",
          gymId: gym._id,
          isActive: true,
        },
      },
      { upsert: true }
    );
  }
  console.log("Seeded Instructors");

  // ─── 2c. Notifications ────────────────────────────────────────────────────
  // Clear old notifications and add fresh ones
  const Notification = (await import("@/models/Notification")).default;
  await Notification.deleteMany({ userId: owner._id });
  await Notification.create([
    {
      gymId: gym._id,
      userId: owner._id,
      title: "New Member Signup",
      message: "Sarah Johnson has just joined as an annual member!",
      type: "success",
      isRead: false,
      link: "/owner/dashboard/members"
    },
    {
      gymId: gym._id,
      userId: owner._id,
      title: "Overdue Payment",
      message: "Tom Hughes's monthly subscription payment has failed.",
      type: "alert",
      isRead: false,
      link: "/owner/dashboard/payments"
    },
    {
      gymId: gym._id,
      userId: owner._id,
      title: "System Update",
      message: "The BoxOS V2.0 dashboard is now live. Enjoy the new features!",
      type: "info",
      isRead: true
    }
  ]);
  console.log("Seeded Notifications");

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
  console.log("Seeding Activity Logs...");
  await ActivityLog.deleteMany({ gymId: gym._id });
  await ActivityLog.create([
    { gymId: gym._id, type: "member_added", description: "Sarah Johnson joined the box", createdAt: daysAgo(90) },
    { gymId: gym._id, type: "member_added", description: "Marcus Bell joined the box", createdAt: daysAgo(20) },
    { gymId: gym._id, type: "member_added", description: "Priya Patel joined the box", createdAt: daysAgo(85) },
    { gymId: gym._id, type: "payment_received", description: "Payment of $840 received from Sarah Johnson", createdAt: daysAgo(90) },
    { gymId: gym._id, type: "payment_received", description: "Payment of $89 received from Marcus Bell", createdAt: daysAgo(20) },
    { gymId: gym._id, type: "class_created", description: "New Early Bird WOD class scheduled", createdAt: daysAgo(3) },
  ]);
  console.log("SUCCESS: Activity Logs seeded");

  // ─── 5. Payments ──────────────────────────────────────────────────────────
  await Payment.deleteMany({ gymId: gym._id });

  const planPriceInCents: Record<string, number> = { monthly: 8900, quarterly: 24000, annual: 84000 };
  const paymentDocs = [];
  let invoiceCounter = 1;
  const year = new Date().getFullYear();

  // 5a. Create historical payments for the last 6 months to populate the chart
  for (let monthOffset = 5; monthOffset >= 1; monthOffset--) {
    const historicalDate = new Date();
    historicalDate.setMonth(historicalDate.getMonth() - monthOffset);
    
    createdMembers.forEach((user, idx) => {
      if (testMembers[idx].plan === 'monthly' || (monthOffset % 3 === 0)) {
        paymentDocs.push({
          gymId: gym._id,
          userId: user._id,
          amount: planPriceInCents[testMembers[idx].plan],
          method: Math.random() > 0.5 ? 'cash' : 'paystack',
          status: 'paid',
          description: "Monthly Membership Fee",
          createdAt: historicalDate,
          invoiceNumber: `INV-${year}-S${String(invoiceCounter++).padStart(4, '0')}` // Using 'S' prefix for seeded data
        });
      }
    });
  }

  // 5b. Create current month payments (dashboard default view)
  for (let i = 0; i < createdMembers.length; i++) {
    const user = createdMembers[i];
    const memberDef = testMembers[i];
    const amount = planPriceInCents[memberDef.plan];

    if (memberDef.status === "active" || memberDef.status === "expiring") {
      paymentDocs.push({ 
        gymId: gym._id, 
        userId: user._id, 
        amount, 
        method: i % 2 === 0 ? 'cash' : 'paystack',
        status: "paid", 
        description: `Payment for ${memberDef.plan} plan`,
        createdAt: daysAgo(1),
        invoiceNumber: `INV-${year}-S${String(invoiceCounter++).padStart(4, '0')}`
      });
    } else if (memberDef.status === "expired") {
      paymentDocs.push({ 
        gymId: gym._id, 
        userId: user._id, 
        amount, 
        method: 'paystack',
        status: "failed", 
        description: "Declined: Insufficient Funds",
        createdAt: daysAgo(30),
        invoiceNumber: `INV-${year}-S${String(invoiceCounter++).padStart(4, '0')}`
      });
    }
  }

  console.log(`Starting individual payment insertion for ${paymentDocs.length} documents...`);
  // Insert documents individually if bulk create is failing
  for (let i = 0; i < paymentDocs.length; i++) {
    try {
      await Payment.create(paymentDocs[i]);
    } catch (err) {
      console.error(`FAILED to create payment ${i}:`, paymentDocs[i].invoiceNumber);
      throw err;
    }
  }
  console.log(`SUCCESS: Seeded ${paymentDocs.length} payments with historical data`);

  // ─── 6. WOD Classes (with member attendees) ───────────────────────────────
  await WODClass.deleteMany({ gymId: gym._id });

  // Grab active members to add as attendees
  const activeMembers = createdMembers.filter((_, i) => testMembers[i].status !== "expired");
  const allAttendees = activeMembers.map((m) => m._id);

  await WODClass.create([
    {
      gymId: gym._id,
      title: "Early Bird WOD",
      coach: "James Carter",
      dateTime: daysAgo(7),
      capacity: 20,
    },
    {
      gymId: gym._id,
      title: "Lunch Strength",
      coach: "James Carter",
      dateTime: daysAgo(3),
      capacity: 15,
    },
    {
      gymId: gym._id,
      title: "Friday Conditioning",
      coach: "James Carter",
      dateTime: daysAgo(1),
      capacity: 20,
    },
    {
      gymId: gym._id,
      title: "Saturday Throwdown",
      coach: "James Carter",
      dateTime: daysFromNow(1),
      capacity: 20,
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
