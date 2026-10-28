export interface Profile {
  id: string;
  displayName: string;
}

export interface ProfileClient {
  getProfile(id: string): Promise<Profile>;
}

/** Loads profiles one by one from the profile service. */
export async function loadProfiles(ids: string[], client: ProfileClient): Promise<Profile[]> {
  const profiles: Profile[] = [];
  for (const id of ids) {
    profiles.push(await client.getProfile(id));
  }
  return profiles;
}
