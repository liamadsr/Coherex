import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to login page - in a real app you'd check auth status
  redirect('/login')
}
