type Hash = {
  update(value: string | Uint8Array, encoding?: string): Hash;
  digest(encoding: "hex"): string;
};

declare module "node:crypto" {
  export function createHash(algorithm: string): Hash;

  export function randomInt(min: number, max: number): number;

  export function randomUUID(): string;
}

declare module "node:fs" {
  export function readFileSync(path: string): Uint8Array;
}

declare module "node:path" {
  export function join(...parts: string[]): string;
  export function dirname(p: string): string;
  export function resolve(...parts: string[]): string;
}

declare module "node:url" {
  export function fileURLToPath(url: string | URL): string;
}

declare const process: {
  env: Record<string, string | undefined>;
};
