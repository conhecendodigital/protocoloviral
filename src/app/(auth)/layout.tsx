export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 w-full h-full bg-black flex items-center justify-center overflow-auto z-50">
      {children}
    </div>
  )
}
