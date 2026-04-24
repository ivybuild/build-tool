import { ReactNode } from 'react'
import Navbar from '@/components/layout/Navbar'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-20 sm:pb-0">
        {children}
      </main>
    </div>
  )
}
