// Add your admin email addresses here
export const ADMIN_EMAILS = [
  'vikashspidey@gmail.com',
  // Add more admin emails below:
];

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}
