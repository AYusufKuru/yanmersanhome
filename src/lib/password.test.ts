import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hashPassword, verifyPassword } from "./password";

describe("parola", () => {
  it("doğru parolayı kabul eder, yanlış ve bozuk kaydı reddeder", async () => {
    const stored = await hashPassword("Deneme1234");
    assert.equal(await verifyPassword("Deneme1234", stored), true);
    assert.equal(await verifyPassword("yanlis", stored), false);
    assert.equal(await verifyPassword("Deneme1234", "düz-metin"), false);
  });
});
