---
layout: article
title: "OpenAI’s Pig Fattening in ChatGPT: Helpful Enrichment or Conditioning for Ads?"
date: 2026-10-22 09:00:00 +0700
categories: technology
permalink: /technology/openais-pig-fattening-in-chatgpt/
canonical_url: https://working-draft.org/technology/openais-pig-fattening-in-chatgpt/
featured: false
summary: "ChatGPT is learning to answer in pictures. OpenAI is learning to advertise in pictures. The timing, the commercial incentives, and the direction of the product deserve scrutiny."
tags:
  - chatgpt
  - advertising
  - intelligent-ui
  - openai
image: /assets/images/openais-pig-fattening-in-chatgpt-hero.webp
image_alt: "A blurred ChatGPT microphone-placement response with three recording-related images annotated with arrows labelled AD?, Sponsored?, and Product Placement?"
---

OpenAI presents Intelligent UI as a richer, more interactive way to answer questions. In practice, my experience so far has been considerably less ambitious: basic instructional prose, loosely relevant stock imagery and simple widgets. While Intelligent UI is marketed as an interactive leap forward, its current fallback state, littering chats with generic web-scraped stock images, serves a more long-tailed purpose: it conditions the user to a visual canvas where native ads can eventually seamlessly sit.

While exploring the possibility that GPT-6's new Intelligent UI could help normalise visual content ahead of a broader shift towards visual advertising, I revisited a recent ChatGPT response. I wanted to determine whether the decidedly generic stock-style imagery I had received was AI-generated or retrieved from the web.

My prompt had been straightforward:

> Recording cackles and screams with iPhone mic. Placement tips?

The text response offered practical advice on microphone distance, off-axis placement, clipping, and recording technique. Then came three images.

<figure>
  <a href="https://mojogear.eu/en-eu/blogs/blog/what-do-you-need-to-record-a-podcast?utm_source=chatgpt.com">
    <img src="/assets/images/openais-pig-fattening-in-chatgpt-evidence-mojogear.png" alt="Screenshot of a woman recording a podcast at a desk, shown as the MOJOGEAR source image in a ChatGPT response.">
  </a>
  <figcaption>Source: <a href="https://mojogear.eu/en-eu/blogs/blog/what-do-you-need-to-record-a-podcast?utm_source=chatgpt.com">MOJOGEAR's guide to podcast equipment</a>.</figcaption>
</figure>

<figure>
  <a href="https://catchwisdom.com/course/home-vocal-recording-masterclass?utm_source=chatgpt.com">
    <img src="/assets/images/openais-pig-fattening-in-chatgpt-evidence-catch-wisdom.png" alt="Screenshot of a singer recording in a studio, shown as the Catch Wisdom source image in a ChatGPT response.">
  </a>
  <figcaption>Source: <a href="https://catchwisdom.com/course/home-vocal-recording-masterclass?utm_source=chatgpt.com">home vocal-recording course page at Catch Wisdom</a>.</figcaption>
</figure>

<figure>
  <a href="https://www.cined.com/rode-ai-micro-released-compact-dual-channel-interface-for-audio-recording/?utm_source=chatgpt.com">
    <img src="/assets/images/openais-pig-fattening-in-chatgpt-evidence-cined.png" alt="Screenshot of a mobile audio-recording setup with a phone on a tripod, shown as the CineD source image in a ChatGPT response.">
  </a>
  <figcaption>Source: <a href="https://www.cined.com/rode-ai-micro-released-compact-dual-channel-interface-for-audio-recording/?utm_source=chatgpt.com">CineD's coverage of the RØDE AI-Micro</a>.</figcaption>
</figure>

All three images and the WikiHow-style steps *were related to audio recording*. None of them demonstrated doing anything on a singular iPhone.

The URLs also carried the referral parameter `?utm_source=`[chatgpt.com](http://chatgpt.com) which I’ve left in the original source links on purpose.

Why did Intelligent UI consider these worthwhile additions to a response? And what happens when the same interface increasingly accommodates commercial imagery?

## Two developments, one commercial opportunity

On October 5, 2026, OpenAI announced [a new visual advertising format for ChatGPT](https://openai.com/index/new-chatgpt-ads-format-and-measurement/). Its stated purpose is to help people explore products and services through images showing product inspiration, product usage, and the experiences products make possible. The announcement explicitly connects the format to helping people discover brands, understand offerings, and decide what to buy.

Two days later, OpenAI announced [GPT-6 and Intelligent UI](https://help.openai.com/en/articles/6825453-chatgpt-release-notes), a response format that combines text, visuals, and interactive elements. The rollout began with paid tiers on October 7 and expanded to Free and Go from October 8.

One makes visual content a more ordinary part of the previously text-based ChatGPT experience. The second makes visual content a more useful format for advertising.

My hypothesis is that the transition to a more visual conversational interface helps prepare users for a more visual advertising environment. If people become accustomed to ChatGPT producing images, diagrams, product comparisons, and illustrated instructions, visual commercial placements may feel less like a new intrusion and more like a familiar part of the experience.

Synthetic testing elicited working examples across all three advertised Intelligent UI categories: visual planning, interactive explanations, and tools generated on request. When the desired functionality failed to materialise, however, responses fell back to a three-image, WikiHow-style format which, in my view, is particularly well suited to advertising placements. In organic threads my experience limited to that same three-image format and a single achievement-style graphic congratulating me on a baguette-shaped pun.

## From advertising beside an answer to advertising inside the task

OpenAI's current advertising documentation says ads appear separately from ChatGPT's answers and cannot influence what the model says. Its [advertising FAQ](https://help.openai.com/en/articles/20001047-ads-in-chatgpt) describes ads as distinct, labelled placements and explains that ad selection may take account of the current conversation's context and intent.

A sponsored placement can influence attention and purchasing decisions without changing a single sentence in the answer.

The more interesting question is what happens when visual interfaces become more sophisticated.

## Conditioning does not require a conspiracy

The word *conditioning* makes this argument sound sinister but hear me out.

First, users become accustomed to receiving visual responses. Then visual advertising becomes a familiar format within the same product. Eventually, the appearance of commercial imagery may feel less disruptive because the interaction has already trained users to expect images (however unrelated) as part of the experience. OpenAI's commercial incentives are explicit.

In its October 21 engineering account, [OpenAI described how it built ChatGPT's advertising system](https://openai.com/index/building-chatgpt-ad-stack/). The company says its ad stack uses a specialised language model to interpret conversational context and underlying intent, retrieve and rank possible ads, assess relevance, and select placements. It also describes retaining information across turns and, where applicable, across conversations, while running ad selection separately from answer generation.

OpenAI reported that ChatGPT Ads reached a $1 billion annualised revenue run rate in fewer than 200 days after launch, making their commercial stakes rather clear.

The advertising business is not incidental to the interface. It is a substantial product in its own right, built around understanding what people are trying to accomplish and identifying opportunities to show relevant ads.

The question is whether the increasingly visual interface will remain a neutral way to explain things, or whether it will eventually become an environment where ad spots are integrated more deeply into the content itself, like we’ve seen in similar offerings across Meta and Google Search Results.

## What should users expect?

We already know the ads are coming… The infrastructure for this transition is already live. Inspecting the client-side session payload sent via [Statsig](https://www.statsig.com/) telemetry shows that users are explicitly categorized by ad profiles. My ads_segment_id is 9610, neatly embedded alongside app build 26.1021.91524. The ad engine isn't a future feature on a roadmap; the potential targeting and A/B segmentation pipelines are running silently in the background of current production builds.

My question is:

> How much longer will users be able to unequivocally identify where ‘organic’ reasoning ends and sponsored influence begins?

If an illustrated instruction shows a particular brand of microphone, is that because it is the best example for the task, because it is readily available, or because an advertiser paid for the placement? If a product appears in a generated diagram, will the sponsorship remain visible when the image is saved or shared outside the conversation? If a model presents a comparison, will paid products be clearly distinguished from options selected on their merits?

Disclosure is not a minor interface detail. It is what allows users to understand why they are seeing something and to decide how much weight to give it.

**The *Fattening* has begun. For now an unprompted “helpful visual” might look just silly and out of place, but it’s preparing us Go-tier gutter trash for something much more profitable.**

*Sources:* [OpenAI, “Building advertising for the way people use AI” (October 5, 2026)](https://openai.com/index/new-chatgpt-ads-format-and-measurement/); [OpenAI, GPT-6 and Intelligent UI release notes (October 7, 2026)](https://help.openai.com/en/articles/6825453-chatgpt-release-notes); [OpenAI, “How we built ChatGPT’s novel ad stack for user trust and relevance” (October 21, 2026)](https://openai.com/index/building-chatgpt-ad-stack/); [OpenAI Help Center, “Ads in ChatGPT”](https://help.openai.com/en/articles/20001047-ads-in-chatgpt)
