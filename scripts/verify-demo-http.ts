import { buildServer } from "../src/server";
import { signDemoToken } from "../src/auth";
import { loadConfig } from "../src/config";

async function main() {
  const config = loadConfig();
  const { fastify } = await buildServer();
  const token = signDemoToken(config);

  try {
    const response = await fastify.inject({
      method: "POST",
      url: "/workflows/demo-dashboard",
      headers: {
        authorization: `Bearer ${token}`,
      },
      payload: {
        emphasis: "artifact velocity",
      },
    });

    console.log(`Status: ${response.statusCode}`);
    console.log(response.body);

    if (response.statusCode >= 400) {
      process.exitCode = 1;
    }
  } finally {
    await fastify.close();
  }
}

main().catch((error) => {
  console.error("Browserlane demo verification failed:", error);
  process.exit(1);
});
