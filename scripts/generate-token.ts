import { signDemoToken } from "../src/auth";
import { loadConfig } from "../src/config";

const config = loadConfig();
const token = signDemoToken(config);

console.log(token);
