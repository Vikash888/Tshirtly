// Add your admin email addresses here
export const ADMIN_EMAILS = [
  'vikashspidey@gmail.com',
  'arunkumardurai0707@gmail.com',
  'santhoshsts9629@gmail.com',
  // Add more admin emails below:
];

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}
