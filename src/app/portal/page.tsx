import MemberLayout from "@/components/layout/MemberLayout";

export default function PortalPage() {
  return (
    <MemberLayout>
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl bg-white p-12 shadow-sm">
        <p className="text-lg text-text-secondary text-center">
          Dashboard is being set up — Milestone 2 will populate this.
        </p>
      </div>
    </MemberLayout>
  );
}
