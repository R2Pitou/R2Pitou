---
layout: article
title: "Planning the Plumbing: Infrastructure Before Classrooms"
date: 2026-07-01 11:15:00 +0700
categories: governance
permalink: /governance/planning-the-plumbing-infrastructure-before-classrooms/
canonical_url: https://working-draft.org/governance/planning-the-plumbing-infrastructure-before-classrooms/
featured: false
summary: "One of the more interesting projects I worked on that unfortunately never deployed past domain registration. Before a single student could log into Moodle, the academy needed infrastructure and identity plumbing."
tags:
  - governance
  - infrastructure
  - systems-architecture
  - identity
image: /assets/images/planning-the-plumbing-infrastructure-before-classrooms-hero.png
image_alt: "A system dependency planning diagram showing Google Workspace, DNS, and internal school infrastructure."
---

Before a single student could log into Moodle, before the first teacher account existed, and before the website served its first page, the academy needed something much less visible. It needed the plumbing required to manage identity, DNS, and internal systems. The diagram below shows the relationships between those components and the dependencies that had to be satisfied before the inauguration ceremony.

[![Infrastructure Planning Diagram](/assets/images/planning-the-plumbing-infrastructure-before-classrooms-hero.png)](/assets/images/planning-the-plumbing-infrastructure-before-classrooms-hero.png)

*The planning diagram showing the relationship between identity, DNS, and internal systems. Click to view full-sized image.*

The diagram above is one of the planning artefacts from that project. It isn't polished nor is it meant to be used as a brochure. It was my working document that helped answer one question repeatedly throughout the design process:

*How does identity flow through the system, and where does that trust begin and end?*

When designing infrastructure from scratch, every new service creates dependencies. Good architecture isn't about choosing products. It's about understanding those dependencies before they become production outages.

## Starting from the outside

The design begins with something that most people never think about. Before a single server could be provisioned or DNS delegated, the institution first had to qualify for an educational domain. Educational domains aren't something you simply register. Whether it's `.edu.kh`, `.edu`, `.ac.uk`, or another education namespace, eligibility is generally tied to formal recognition by an appropriate authority. That administrative milestone becomes the root of the technical infrastructure because it establishes the institution's digital identity.

From there, the institution can apply for services such as Google Workspace for Education Fundamentals and Microsoft Education A1, both of which have their own verification processes before educational licensing is granted. In this case, qualifying for educational licensing represented an estimated annual saving of approximately US$240,000 compared with an equivalent Google Workspace Flex deployment.

Google's verification process introduced another unexpected dependency. The public website became part of the infrastructure plan rather than a marketing exercise. Google expects to see evidence that the institution exists and that the domain genuinely represents it, so even a simple landing page became a prerequisite for establishing the identity platform. Only after those requirements had been satisfied could DNS authority be delegated to Cloudflare, identity services configured, and the rest of the infrastructure begin to take shape.

## Two completely different kinds of traffic

One of the earliest design decisions was to separate public-facing services from internal operational systems. Although both are accessed through the same domain, they serve completely different purposes, operate under different trust assumptions, and have very different consequences if something goes wrong.

The public website is designed to be visited by anyone. The learning platform, project management tools, remote administration, and automation services are not. Putting everything behind the same web server would unnecessarily increase the attack surface and make maintenance riskier. By splitting public traffic from internal infrastructure, a compromise of the website doesn't automatically expose operational systems, and routine maintenance of internal services doesn't take the public presence offline. They solve different problems and should be able to fail independently.

## Identity before applications

With the network boundaries established, the next architectural decision was identity. A common mistake in greenfield deployments is to build applications first and let each one maintain its own users. That usually results in multiple password databases, inconsistent user lifecycle management, and duplicated authentication policies. Students and staff already have enough on their plates without remembering a dozen different passwords for a dozen different systems, so Single Sign-On was a requirement from the start.

The architecture deliberately separates identity from applications. Google Workspace becomes the authoritative identity provider for the environment, while applications become consumers of that identity through OpenID Connect and other federated authentication standards. User lifecycle management, group membership, organisational units, and authentication policies remain centralised instead of being reimplemented by every application.

That decision means applications no longer need to answer the question, "Who is this user?" They only need to trust the answer provided by the identity platform. Onboarding, offboarding, permission changes, and MFA policies are managed once and immediately become consistent across the entire environment instead of being maintained separately by every application.

## Infrastructure is mostly relationships

The green section of the diagram isn't intended to represent a single server. It's a collection of services that each fulfil a specific operational role while depending on one another in predictable ways. The VPS provides the compute resources, Orchestrator manages containers, Moodle delivers the learning platform, OpenProject manages internal projects, n8n automates repetitive tasks, GitHub Actions handles deployments, RustDesk and Tactical RMM provide remote support, and Tailscale creates a private management network for administrative access.

None of those individual products are particularly remarkable. The interesting part is how they relate to one another. Management interfaces remain on private networks, deployments originate from version control rather than manual uploads, automation runs internally, and services only communicate with the public Internet when there is a clear operational reason to do so. Most of the architectural work wasn't choosing software. It was deciding where each component belonged, what it should trust, and what should happen if any individual service failed.

## Infrastructure outlives infrastructure

The software shown in the diagram isn't the interesting part. If I were designing the same environment today, I'd almost certainly make different product choices. Coolify hopefully has matured, but in hindsight I can say it wasn't production ready at the time, Cloudflare's Zero Trust platform is far more capable than it was at the time, and AI-assisted operational tooling has become genuinely useful.

What has changed far less is the dependency graph.

Identity still sits above applications because applications come and go while user identities persist. Public-facing services are still separated from operational systems because they have different trust models. Administrative access still belongs on private networks rather than the public Internet. Those relationships don't depend on a particular vendor or product.

### Trust flows downhill

Every component in the infrastructure inherits trust from something above it.

- The VPS trusts Tailscale to identify administrators.
- Tailscale trusts Google Workspace to authenticate users.
- Google Workspace trusts the institution's verified domain.
- The verified domain exists because the institution satisfied the accreditation requirements needed to obtain it.

By the time someone reaches a server, they have already passed through several independent trust decisions. None of the applications need to maintain privileged administrator accounts because identity has already been established before the connection reaches them.

That's why I drew dependencies instead of servers. Servers get replaced, products come and go, but trust relationships tend to last much longer.

Good infrastructure planning isn't about predicting which products will still exist in five years. It's about designing an environment that can survive replacing them.
