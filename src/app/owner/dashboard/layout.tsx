import OwnerLayout from "@/components/layout/OwnerLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OwnerLayout>{children}</OwnerLayout>;
}
