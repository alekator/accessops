import { ROLE_COOKIE_KEY } from '@/features/auth/model/constants';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const role = (await cookies()).get(ROLE_COOKIE_KEY)?.value;
  if (!role) {
    redirect('/login');
  }
  redirect('/users');
}
