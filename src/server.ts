import Fastify from "fastify";
import { createAuthHook } from "./auth";
import { loadConfig } from "./config";
import { BrowserManager } from "./runtime/browser-manager";
import { executeWorkflow } from "./runtime/execute-workflow";
import { listWorkflows, workflowRegistry } from "./workflows/registry";

export async function buildServer() {
  const config = loadConfig();
  const fastify = Fastify({ logger: true });
  const browserManager = new BrowserManager(config.headless);
  const running = new Set<string>();

  fastify.get("/health", async () => {
    return {
      status: await browserManager.health(),
      workflowCount: workflowRegistry.size,
    };
  });

  fastify.get("/workflows", async () => {
    return {
      workflows: listWorkflows(),
    };
  });

  fastify.post<{ Params: { name: string }; Body: unknown }>(
    "/workflows/:name",
    { onRequest: createAuthHook(config) },
    async (request, reply) => {
      const { name } = request.params;
      const workflow = workflowRegistry.get(name);

      if (!workflow) {
        return reply.code(404).send({ error: `Unknown workflow: ${name}` });
      }

      if (running.has(name)) {
        return reply.code(409).send({ error: `Workflow "${name}" is already running` });
      }

      running.add(name);

      try {
        const parsedParams = workflow.parseParams(request.body);
        const result = await executeWorkflow({
          workflow,
          params: parsedParams,
          browserManager,
          config,
        });

        if (!result.success) {
          return reply.code(500).send(result);
        }

        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown execution error";
        request.log.error({ workflow: name, error: message }, "Browserlane workflow failed");
        return reply.code(500).send({ success: false, error: message });
      } finally {
        running.delete(name);
      }
    }
  );

  fastify.addHook("onClose", async () => {
    await browserManager.shutdown();
  });

  return { fastify, config };
}

async function start() {
  const { fastify, config } = await buildServer();
  await fastify.listen({ port: config.port, host: "0.0.0.0" });
}

if (require.main === module) {
  start().catch((error) => {
    console.error("Failed to start browserlane:", error);
    process.exit(1);
  });
}
