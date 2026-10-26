---
layout: default
title: PostFolio
description: A JSON-first, agent-assisted CV studio. One career record, tailored copies for each application.
summary: PostFolio treats career history as structured, reusable data. An agent composes a job-specific CV without making you rebuild your professional history for every application.
permalink: /postfolio/
---

<section class="hero" aria-labelledby="postfolio-title">
  <div class="hero-copy">
    <p class="eyebrow">IN DEVELOPMENT · STRUCTURED CAREER DATA</p>
    <h1 id="postfolio-title">PostFolio</h1>
    <p class="intro-copy">Your career. In copy.</p>
    <p class="intro-copy">A JSON-first CV studio where an agent turns one structured career record into a tailored copy for each job application.</p>
    <div class="hero-actions">
      <a href="https://github.com/reactive-resume/reactive-resume">Reactive Resume upstream</a>
      <a href="https://github.com/modelcontextprotocol/modelcontextprotocol/tree/main/docs/specification/2026-07-28">MCP 2026-07-28 specification</a>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="idea-title">
  <div class="section-heading">
    <h2 id="idea-title">One career. Every application. A tailored copy.</h2>
    <p>Stop rebuilding your professional history from top to bottom.</p>
  </div>
  <div class="technical-panel-grid">
    <article class="technical-panel">
      <p class="eyebrow">STRUCTURED BY DEFAULT</p>
      <h3>Career history as data</h3>
      <p>Employment, education, skills, projects and qualifications live in structured objects. Reuse and validate them instead of retyping the same facts into every new CV.</p>
    </article>
    <article class="technical-panel">
      <p class="eyebrow">CARBON COPY</p>
      <h3>Make a tailored version</h3>
      <p>Give the agent a job description. It selects and reorders relevant evidence, adjusts wording honestly, and creates a separate version while leaving the master record intact.</p>
    </article>
    <article class="technical-panel">
      <p class="eyebrow">OPEN INTERFACES</p>
      <h3>JSON in, JSON out</h3>
      <p>Preserve compatibility with the existing Reactive Resume data model first. The goal is a portable, schema-aware workflow, not another proprietary CV silo.</p>
    </article>
  </div>
</section>

<section class="section" aria-labelledby="engineering-title">
  <div class="section-heading">
    <h2 id="engineering-title">Engineering priorities</h2>
    <p>The project is being designed around portable data and ordinary HTTP operations.</p>
  </div>
  <div class="technical-panel">
    <ul>
      <li><strong>Data compatibility:</strong> keep Reactive Resume JSON import and export working; preserve the upstream schema unless there is a demonstrated reason to extend it.</li>
      <li><strong>Agent workflow:</strong> read the source CV, map job requirements to real evidence, make a new copy, validate it and export it.</li>
      <li><strong>Modern MCP:</strong> target the 2026-07-28 protocol, with per-request metadata, no protocol-level initialize handshake or sessions, and JSON responses by default. Use request-scoped SSE only where the protocol or operation needs it.</li>
      <li><strong>Authentication:</strong> let the PostFolio server own OAuth discovery, registration, consent and token validation. Never ship credentials in the plugin package.</li>
      <li><strong>Honest tailoring:</strong> no invented achievements, padded dates, fake skills, hidden keywords or edits to the master CV without permission.</li>
    </ul>
  </div>
</section>

<section class="section" aria-labelledby="status-title">
  <div class="section-heading">
    <h2 id="status-title">Current status</h2>
  </div>
  <div class="technical-panel">
    <p><strong>Prototype planning. Not a live CV service yet.</strong></p>
    <p>The dedicated source fork, runtime deployment and modern MCP implementation are not yet published. This page is the project home, not an upload form. Do not submit real CVs or personal information here.</p>
    <p>GitHub is intended to host the source and issue history. Working-Draft.org can host project documentation, while the authenticated application will need a server runtime for its API, database and OAuth endpoints. No new domain purchase is required to use a subdomain of Working-Draft.org later.</p>
  </div>
</section>
