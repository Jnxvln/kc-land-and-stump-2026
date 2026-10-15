import { createInterface } from "node:readline/promises";
import { hashPassword } from "../src/server/password";

const rl = createInterface({ input: process.stdin, output: process.stdout });
const password = await rl.question("Password to hash: ");
rl.close();

if (password.length < 12) {
	console.error("Use at least 12 characters. A few random words works well.");
	process.exit(1);
}
console.log(`\nADMIN_PASSWORD_HASH=${hashPassword(password)}`);