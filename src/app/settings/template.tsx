import { MainLayout } from '@/components/layouts/MainLayout'

export default function SettingsTemplate({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  )
}