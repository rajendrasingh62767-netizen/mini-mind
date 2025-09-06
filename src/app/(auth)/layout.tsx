import { ConnectNowLogo } from "@/components/ConnectNowLogo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
       <div className="mb-8">
        <ConnectNowLogo />
      </div>
      {children}
    </main>
  )
}
