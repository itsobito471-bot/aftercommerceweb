import { redirect } from 'next/navigation';

/**
 * Root Router Page
 * Redirects default landing requests straight to the admin console pathway
 */
export default function RootPage() {
  redirect('/admin');
}
