export const message = "Hello from target.ts!";
console.log(message);

// テスト用の関数
export function add(a: number, b: number) {
  return a + b + 4;
}

console.log(add(1, 2));
