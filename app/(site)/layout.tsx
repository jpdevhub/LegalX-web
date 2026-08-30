import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PageTransition } from '@/components/motion/PageTransition'
import { InstallPWA } from '@/components/ui/InstallPWA'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-[calc(100vh-64px-320px)]">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <InstallPWA />
    </>
  )
}
