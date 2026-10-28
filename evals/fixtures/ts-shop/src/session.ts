let current = "anonymous";

export function signIn(userId: string): void {
  current = userId;
}

export function currentUser(): string {
  return current;
}
