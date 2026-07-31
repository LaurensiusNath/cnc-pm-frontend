import { LogoutButton } from "@/features/auth/components/LogoutButton";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b p-4">
        <span className="font-semibold">CNC Service PM</span>
        <LogoutButton />
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
