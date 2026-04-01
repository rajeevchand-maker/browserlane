import { describe, expect, it } from "vitest";
import type { FastifyReply, FastifyRequest } from "fastify";
import { createAuthHook, signDemoToken, verifyToken } from "../src/auth";
import type { BrowserlaneConfig } from "../src/config";
import { listWorkflows, workflowRegistry } from "../src/workflows/registry";

const config: BrowserlaneConfig = {
  port: 3100,
  headless: true,
  jwtSecret: "browserlane-demo-secret",
  jwtIssuer: "browserlane-local",
  jwtAudience: "browserlane",
  artifactDir: "/tmp/browserlane-test-artifacts",
};

function createReplyDouble() {
  return {
    statusCode: 200,
    payload: undefined as unknown,
    code(status: number) {
      this.statusCode = status;
      return this;
    },
    send(payload: unknown) {
      this.payload = payload;
      return this;
    },
  };
}

describe("auth helpers", () => {
  it("signs and verifies a demo token with the configured issuer and audience", () => {
    const token = signDemoToken(config);
    const payload = verifyToken(token, config);

    expect(payload.scope).toBe("workflow:execute");
    expect(payload.iss).toBe(config.jwtIssuer);
    expect(payload.aud).toBe(config.jwtAudience);
    expect(payload.sub).toBe("browserlane-local-demo");
  });

  it("rejects missing authorization headers through the auth hook", async () => {
    const authHook = createAuthHook(config);
    const reply = createReplyDouble();

    await authHook({ headers: {} } as FastifyRequest, reply as unknown as FastifyReply);

    expect(reply.statusCode).toBe(401);
    expect(reply.payload).toEqual({ error: "Missing or malformed Authorization header" });
  });

  it("rejects malformed bearer tokens", async () => {
    const authHook = createAuthHook(config);
    const reply = createReplyDouble();

    await authHook(
      { headers: { authorization: "Bearer definitely-not-a-jwt" } } as FastifyRequest,
      reply as unknown as FastifyReply,
    );

    expect(reply.statusCode).toBe(401);
    expect(reply.payload).toMatchObject({ error: expect.any(String) });
  });
});

describe("workflow registry", () => {
  it("lists the bundled demo workflows with their replay fixtures", () => {
    expect(listWorkflows()).toEqual([
      expect.objectContaining({
        name: "demo-dashboard",
        replayFixture: "demo/replays/demo-dashboard.json",
      }),
      expect.objectContaining({
        name: "demo-intake",
        replayFixture: "demo/replays/demo-intake.json",
      }),
    ]);
    expect([...workflowRegistry.keys()]).toEqual(["demo-dashboard", "demo-intake"]);
  });
});
