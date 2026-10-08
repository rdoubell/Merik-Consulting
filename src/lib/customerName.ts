type NamedUser = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profile?: { firstName: string; lastName: string } | null;
};

export function customerDisplayName(user: NamedUser): string {
  if (user.profile) return `${user.profile.firstName} ${user.profile.lastName}`;
  if (user.firstName || user.lastName) return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return user.email;
}
