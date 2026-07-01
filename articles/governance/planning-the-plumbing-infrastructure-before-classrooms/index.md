---
layout: article
title: "Planning the Plumbing: Infrastructure Before Classrooms"
date: 2026-07-01 11:15:00 +0700
categories: governance
permalink: /governance/planning-the-plumbing-infrastructure-before-classrooms/
canonical_url: https://working-draft.org/governance/planning-the-plumbing-infrastructure-before-classrooms/
featured: false
summary: "One of the more interesting projects I worked on never opened its doors. Before a single student could log into Moodle, the academy needed infrastructure plumbing."
tags:
  - governance
  - infrastructure
  - systems-architecture
  - identity
image: /assets/images/planning-the-plumbing-infrastructure-before-classrooms-hero.png
image_alt: "A system dependency planning diagram showing Google Workspace, DNS, and internal school infrastructure."
---

One of the more interesting projects I worked on never opened its doors.

Before a single student could log into Moodle, before the first teacher account existed, and before the website served its first page, the academy needed something much less visible.

It needed plumbing.

Not pipes.

Infrastructure.

[![Infrastructure Planning Diagram](/assets/images/planning-the-plumbing-infrastructure-before-classrooms-hero.png)](/assets/images/planning-the-plumbing-infrastructure-before-classrooms-hero.png)

*The planning diagram showing the relationship between identity, DNS, and internal systems. Click to view full-sized image.*

The diagram below is one of the planning artefacts from that project. It isn't polished. It isn't marketing material. It was a working document that helped answer one question repeatedly throughout the design process:

*If I add this system, what else have I just made responsible for it?*

When designing infrastructure from scratch, every new service creates dependencies. Good architecture isn't about choosing products. It's about understanding those dependencies before they become production outages.

## Starting from the outside

The design begins with something that most people never think about.

The domain.

Without a domain, nothing else exists.

- Email doesn't exist.
- Identity doesn't exist.
- Certificates don't exist.
- The website doesn't exist.

The first dependency in the diagram is therefore not a server. It's the registrar issuing ownership of the school's official `.edu.kh` domain.

Once delegated, authoritative DNS moves to Cloudflare. That immediately establishes a single point for DNS management, TLS termination, edge protection, and traffic routing.

Everything else grows from there.

## Two completely different kinds of traffic

One design decision appears very early.

Not all traffic deserves equal trust.

The public website exists to be visited by everyone.

The learning platform does not.

Administrative systems certainly do not.

Rather than putting everything behind one web server, the infrastructure deliberately separates public-facing services from internal operational systems.

The public website can be compromised without immediately exposing project management, learning platforms, automation systems, or administrative tooling.

Likewise, internal maintenance shouldn't affect the school's public presence.

Those systems solve different problems and should fail independently.

## Identity before applications

A common mistake is deploying applications first and worrying about user accounts later.

That usually ends with five different password databases and a helpdesk drowning in password resets.

Instead, the diagram places Google Workspace near the top of the dependency tree.

Not because it's email.

Because it's identity.

Once Google Workspace becomes the source of truth, applications stop managing users themselves.

Instead they ask a much simpler question:

*Has Google already authenticated this person?*

That decision unlocks several things simultaneously:

- Staff accounts
- Student accounts
- Groups
- Shared Drives
- Organisational Units
- Single Sign-On
- Lifecycle management

The applications become consumers of identity rather than owners of it.

That dramatically reduces operational complexity.

## Infrastructure is mostly relationships

The green box at the bottom isn't intended to represent one server.

It's a collection of responsibilities:

- **The VPS** provides compute.
- **Coolify** orchestrates containers.
- **Moodle** delivers learning.
- **OpenProject** supports internal project management.
- **n8n** automates repetitive workflows.
- **GitHub Actions** deploys software.
- **RustDesk** and **Tactical RMM** provide operational support.
- **Tailscale** creates a private management network.

None of those products are particularly interesting on their own.

What's interesting is why they exist together.

The infrastructure deliberately avoids having applications communicate directly with the public Internet unless they need to.

Management interfaces remain inside trusted paths.

Automation happens internally.

Deployment comes from version control rather than manual uploads.

Support happens through authenticated private tunnels rather than exposed administration ports.

Each decision removes another class of future problem.

## Designing for the administrator who comes next

Every box eventually needs patching.

Monitoring.

Documentation.

Backups.

Permission reviews.

Someone inherits every design decision.

Good infrastructure isn't measured by how clever it looks on launch day.

It's measured by whether another administrator can understand it two years later without reverse engineering the entire environment.

That's why the diagram spends more effort showing relationships than specifications.

Products change.

Dependencies last much longer.

## Looking back

The academy never reached deployment, so this design remained a planning artefact rather than a production system.

I would build parts of it differently today.

Coolify has matured.

Google Workspace has gained additional capabilities.

Cloudflare's Zero Trust platform has expanded significantly.

AI-assisted operational tooling has become genuinely useful rather than experimental.

The interesting part, however, isn't whether one box changes.

It's that the dependency graph barely does.

Good infrastructure planning ages surprisingly well because it's driven by principles rather than products.
