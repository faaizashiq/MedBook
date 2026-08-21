import { Footer } from '@/components/layout/Footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-full flex-1">
      <main className="flex-1" role="main">
        {children}
      </main>
      <Footer />
    </div>
  )
}
