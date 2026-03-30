export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 w-full h-full bg-slate-50 dark:bg-black flex items-center justify-center overflow-auto z-50 text-slate-900 dark:text-slate-100">
      {children}
    </div>
  )
}
