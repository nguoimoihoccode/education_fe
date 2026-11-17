const urls = new Set<string>();
let sessionGeneration = 0;

export const artifactSessionGeneration = () => sessionGeneration;

export function createPrivateArtifactUrl(blob: Blob, generation: number): string {
  if (generation !== sessionGeneration) throw new Error('Phiên đăng nhập đã thay đổi.');
  const url = URL.createObjectURL(blob);
  urls.add(url);
  return url;
}

export function revokePrivateArtifactUrl(url: string) {
  if (urls.delete(url)) URL.revokeObjectURL(url);
}

export function clearPrivateArtifacts() {
  sessionGeneration++;
  for (const url of [...urls]) revokePrivateArtifactUrl(url);
}
