import { describe, expect, it } from "vitest";

import { agentResponse } from "./agent-response";
import { personJsonLd } from "./person-json-ld";

const BARE_EMAIL = /^[^\s:@]+@[^\s@]+\.[^\s@]+$/u;

describe("personJsonLd", () => {
  it("gives contact emails as bare addresses, without a mailto: scheme", () => {
    expect(personJsonLd.email).toMatch(BARE_EMAIL);
    expect(personJsonLd.contactPoint.email).toMatch(BARE_EMAIL);
  });

  it("points its contact point at a page the site serves", () => {
    const { url } = personJsonLd.contactPoint;

    expect(new URL(url).origin).toBe(new URL(personJsonLd.url).origin);
    expect(agentResponse(new Request(`${url}.md`))?.status).toBe(200);
  });

  it("declares no Organization of its own, so the site reads as a person", () => {
    expect(JSON.stringify(personJsonLd)).not.toMatch(/"@type":"Organization"/u);
  });

  it("names the employer by the @id its own site publishes", () => {
    expect(personJsonLd.worksFor["@id"]).toMatch(
      /^https:\/\/[^#]+#organization$/u
    );
  });

  it("serialises without a sequence that would close its script tag", () => {
    expect(JSON.stringify(personJsonLd)).not.toContain("</");
  });
});
