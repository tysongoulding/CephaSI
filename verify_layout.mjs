import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require("playwright");
} catch {
  playwright = require("/home/tyson/.npm/_npx/e41f203b7505f1fb/node_modules/playwright");
}

const { chromium } = playwright;

const TARGET_URL = process.env.TARGET_URL || "http://192.168.144.110:3899/";
const SCRATCH_DIR =
  process.env.SCRATCH_DIR ||
  "/home/tyson/.gemini/antigravity/brain/7374f029-b139-4782-9a9f-b5e6f803d9ca/scratch";

fs.mkdirSync(SCRATCH_DIR, { recursive: true });

async function runVerification() {
  console.log(`Launching headless Chromium against ${TARGET_URL} ...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  await page.goto(TARGET_URL, { waitUntil: "networkidle" });

  // 0. Global Branding Sanity Check: No "Baymax" or "Grok Bot" anywhere
  const fullHtml = await page.content();
  assert(!fullHtml.includes("Baymax"), "DOM must not contain 'Baymax'");
  assert(!fullHtml.includes("Grok Bot"), "DOM must not contain 'Grok Bot'");
  console.log("✔ Branding check passed: 0 'Baymax' and 0 'Grok Bot' references.");

  // 1. View 1: Atlas Chat View (Screenshot 1)
  await page.click('.bot-list-item[data-bot-id="atlas"]');
  await page.waitForSelector('[data-thread="atlas"]');
  const atlasText = await page.textContent('[data-thread="atlas"]');
  assert(atlasText.includes("2 messages with"), "Atlas chat must show '2 messages with CephaSI'");
  assert(atlasText.includes("CephaSI says you approved a change to my profile."), "Atlas chat must reference CephaSI");
  assert(atlasText.includes("Apply CephaSI's profile update to me?"), "Atlas prompt card must reference CephaSI");
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_01_atlas_chat.png") });
  console.log("✔ View 01 verified: Atlas Chat with CephaSI references.");

  // Switch back to CephaSI for subsequent views
  await page.click('.pinned-bot-card[data-bot-id="cephasi"]');

  // 2. View 2: Create New Bot Modal — 48 Tentacle Styles (+1 Main AI = 49) & 12 Color Swatches (Default + 11 Colors)
  await page.click("#btn-open-create");
  await page.waitForSelector("#modal-bot-editor:not(.hidden)");
  const tentacleCount = await page.locator("#tentacle-picker-grid .tentacle-option-btn").count();
  const colorCount = await page.locator("#color-picker-grid .color-swatch-btn").count();
  assert.equal(tentacleCount, 49, "Must render all 49 SVG avatar designs (Main AI + 48 Tentacle Styles)");
  assert.equal(colorCount, 12, "Must render 12 color swatches (Default Style Original + 11 Colors)");
  // Verify category filters
  await page.click('#tentacle-cat-tabs .tentacle-cat-btn[data-tcat="core"]');
  assert.equal(await page.locator("#tentacle-picker-grid .tentacle-option-btn").count(), 12, "Core & Classic must have 12 tentacle styles");
  await page.click('#tentacle-cat-tabs .tentacle-cat-btn[data-tcat="thematic"]');
  assert.equal(await page.locator("#tentacle-picker-grid .tentacle-option-btn").count(), 12, "Thematic & Material must have 12 tentacle styles");
  await page.click('#tentacle-cat-tabs .tentacle-cat-btn[data-tcat="elemental"]');
  assert.equal(await page.locator("#tentacle-picker-grid .tentacle-option-btn").count(), 24, "Elemental & Types must have 24 tentacle styles");
  await page.click('#tentacle-cat-tabs .tentacle-cat-btn[data-tcat="all"]');
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_02_create_new_bot_modal.png") });
  await page.click("#btn-close-bot-editor");
  console.log("✔ View 02 verified: Create New Bot modal (48 tentacle styles + Main AI, Default + 11 colors).");

  // 3. View 3: Search Modal (Screenshot 3)
  await page.click("#btn-open-search");
  await page.waitForSelector("#modal-search:not(.hidden)");
  const searchRows = await page.locator("#search-results-container .search-result-row").count();
  assert(searchRows >= 8, "Search modal must list all bots with preview snippets");
  const firstSearchBot = await page.textContent("#search-results-container .search-result-row:first-child .search-result-name");
  assert.equal(firstSearchBot.trim(), "CephaSI", "First bot in search results must be CephaSI");
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_03_search_modal.png") });
  await page.evaluate(() => document.getElementById("modal-search").classList.add("hidden"));
  console.log("✔ View 03 verified: Search modal.");

  // 4. View 4: Right Inspector — Artifacts Tab (Screenshot 4)
  await page.click("#btn-toggle-inspector");
  await page.waitForSelector("#right-inspector:not(.hidden)");
  await page.click('.inspector-tab-btn[data-inspector-tab="Artifacts"]');
  const inspectorTabsText = await page.textContent(".inspector-tabs");
  assert(inspectorTabsText.includes("Artifacts") && !inspectorTabsText.includes("Library"), "Inspector tab must be named 'Artifacts'");
  const libText = await page.textContent("#inspector-tab-content");
  assert(libText.includes("Bot Fleet Audit & Access Map (V2 + V3)"), "Artifacts tab must show This week items");
  assert(libText.includes("BEAR row 60 with updated Explain why and 2.1"), "Artifacts tab must show Older items");
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_04_right_inspector_library.png") });
  console.log("✔ View 04 verified: Right Inspector — Artifacts tab.");

  // 5. View 5: CephaSI Chat + Right Inspector Details Tab (Screenshot 5)
  await page.click('.inspector-tab-btn[data-inspector-tab="Details"]');
  const detailsText = await page.textContent("#inspector-tab-content");
  assert(detailsText.includes("Routines are recurring tasks this Bot runs on a schedule."), "Details tab must show routines note");
  assert(detailsText.includes("Helix"), "Details tab must show Helix voice setting");
  const cephaChatText = await page.textContent('[data-thread="cephasi"]');
  assert(cephaChatText.includes("Their responsibilities are in the 4.8 section"), "CephaSI chat must show user bubble");
  assert(cephaChatText.includes("4.8 Network Architecture Team"), "CephaSI chat must show 4.8 response card");
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_05_cephasi_chat_and_details.png") });
  await page.click("#btn-close-inspector");
  console.log("✔ View 05 verified: CephaSI Chat + Right Inspector — Details tab.");

  // 6. View 6: User Profile Popover & Support Flyout Submenu (Screenshot 6)
  await page.click("#btn-user-menu");
  await page.waitForSelector("#user-popover:not(.hidden)");
  await page.hover("#menu-support-trigger");
  await page.waitForSelector("#support-submenu:not(.hidden)");
  const popoverText = await page.textContent("#user-popover");
  assert(popoverText.includes("CephaSI for Mobile"), "User menu must say 'CephaSI for Mobile'");
  assert(!popoverText.includes("Grok Bot"), "User menu must not mention Grok Bot");
  const supportText = await page.textContent("#support-submenu");
  assert(supportText.includes("Keyboard shortcuts"), "Support submenu must list Keyboard shortcuts");
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_06_user_popover_and_support.png") });
  console.log("✔ View 06 verified: User Popover ('CephaSI for Mobile') & Support Submenu.");

  // 7. View 7: Settings -> General (Screenshot 7)
  await page.click("#btn-open-settings");
  await page.waitForSelector("#modal-settings:not(.hidden)");
  const generalText = await page.textContent("#settings-tab-body");
  assert(generalText.includes("tyson.goulding@optconnect.com"), "General tab must display user email");
  assert(generalText.includes("Auto-detect (America/Denver)"), "General tab must display timezone");
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_07_settings_general.png") });
  console.log("✔ View 07 verified: Settings — General.");

  // 8. View 8: Settings -> Computer (Screenshot 8)
  await page.click('.settings-nav-btn[data-settings-tab="Computer"]');
  const computerText = await page.textContent("#settings-tab-body");
  assert(computerText.includes("Let CephaSI open files and run tasks on your computer."), "Computer tab must reference CephaSI");
  assert(computerText.includes("goulding-pc"), "Computer tab must list goulding-pc");
  assert(computerText.includes("Your computer is on the latest version"), "Computer tab must show blue status banner");
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_08_settings_computer.png") });
  console.log("✔ View 08 verified: Settings — Computer.");

  // 9. View 9: Settings -> Permissions (Screenshot 9)
  await page.click('.settings-nav-btn[data-settings-tab="Permissions"]');
  const permText = await page.textContent("#settings-tab-body");
  assert(permText.includes("Review CephaSI actions based on custom rules"), "Permissions tab must reference CephaSI");
  assert(permText.includes("Allow python commands to read network group passwords from secrets.json"), "Permissions tab must list all 4 rules");
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_09_settings_permissions.png") });
  console.log("✔ View 09 verified: Settings — Permissions.");

  // 10. View 10: Settings -> Vault (Screenshot 10)
  await page.click('.settings-nav-btn[data-settings-tab="Vault"]');
  const vaultText = await page.textContent("#settings-tab-body");
  assert(vaultText.includes("Nothing saved yet. Add a login, card, or contact info with New item."), "Vault tab must show empty state");
  assert(vaultText.includes("CephaSI never sees a saved card's number or security code."), "Vault privacy note must reference CephaSI");
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_10_settings_vault.png") });
  console.log("✔ View 10 verified: Settings — Vault.");

  // 11. View 11: Settings -> Usage & Billing (Screenshot 11)
  await page.click('.settings-nav-btn[data-settings-tab="Usage & Billing"]');
  const usageText = await page.textContent("#settings-tab-body");
  assert(usageText.includes("Weekly usage limit") && usageText.includes("36%"), "Usage & Billing must show 36% used");
  assert(usageText.includes("Request Upgrade"), "Usage & Billing must show Request Upgrade button");
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_11_settings_usage_billing.png") });
  console.log("✔ View 11 verified: Settings — Usage & Billing.");

  // 12. View 12: Settings -> Updates (Screenshot 12)
  await page.click('.settings-nav-btn[data-settings-tab="Updates"]');
  const updatesText = await page.textContent("#settings-tab-body");
  assert(updatesText.includes("CephaSI Updates"), "Updates tab must show 'CephaSI Updates'");
  assert(updatesText.includes("Version 0.78.4"), "Updates tab must show Version 0.78.4");
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_12_settings_updates.png") });
  console.log("✔ View 12 verified: Settings — Updates.");

  // 13. View 13: Invite Teammates Nested Modal (Screenshot 13)
  await page.click("#btn-open-invite");
  await page.waitForSelector("#modal-invite:not(.hidden)");
  const inviteText = await page.textContent("#modal-invite");
  assert(inviteText.includes("Add teammates by email or share an invite link"), "Invite modal must display subtitle");
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_13_invite_teammates_modal.png") });
  await page.click("#btn-close-invite");
  await page.click("#btn-close-settings");
  console.log("✔ View 13 verified: Invite teammates modal.");

  // 14. Bonus E2E Check: Create a new custom Tentacle Bot AND Rename an existing Bot
  await page.click("#btn-open-create");
  await page.click('#tentacle-picker-grid .tentacle-option-btn[data-tentacle-id="11"]'); // Starburst 8-Arm Octo
  await page.click('#color-picker-grid .color-swatch-btn[data-color-id="8"]'); // Purple
  await page.fill("#bot-editor-name-input", "KrakenOps");
  await page.click("#btn-save-bot-editor");

  const activePillAfterCreate = await page.textContent("#top-pill-name");
  assert.equal(activePillAfterCreate.trim(), "KrakenOps", "Newly created bot 'KrakenOps' must become active");

  // Open Right Inspector & Rename KrakenOps -> KrakenPrime
  await page.click("#btn-toggle-inspector");
  await page.click("#btn-rename-bot");
  await page.waitForSelector("#modal-bot-editor:not(.hidden)");
  await page.fill("#bot-editor-name-input", "KrakenPrime");
  await page.click('#tentacle-picker-grid .tentacle-option-btn[data-tentacle-id="13"]'); // Coral Reef Tang-Octo
  await page.click("#btn-save-bot-editor");

  const activePillAfterRename = await page.textContent("#top-pill-name");
  const inspectorNameAfterRename = await page.textContent("#inspector-bot-name");
  assert.equal(activePillAfterRename.trim(), "KrakenPrime", "Top pill must reflect renamed bot 'KrakenPrime'");
  assert.equal(inspectorNameAfterRename.trim(), "KrakenPrime", "Inspector must reflect renamed bot 'KrakenPrime'");
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_14_custom_bot_created_and_renamed.png") });
  console.log("✔ View 14 verified: Custom Tentacle Bot creation & live renaming ('KrakenOps' -> 'KrakenPrime').");

  // 15. View 15: Architecture Deep-Dive Card + Composer '+' Popover ('Attach files' / 'Teach a task')
  await page.click("#btn-close-inspector");
  await page.click('.pinned-bot-card[data-bot-id="cephasi"]');
  await page.locator("#architecture-deep-dive-card").scrollIntoViewIfNeeded();
  const archText = await page.textContent("#architecture-deep-dive-card");
  assert(archText.includes("The three layers:"), "Architecture card must include 'The three layers:'");
  assert(archText.includes("Guardrails built into the setup:"), "Architecture card must include 'Guardrails built into the setup:'");
  assert(archText.includes("Data sources the bots read:"), "Architecture card must include 'Data sources the bots read:'");
  await page.click("#composer-plus-btn");
  await page.waitForSelector("#composer-plus-popover:not(.hidden)");
  const plusPopoverText = await page.textContent("#composer-plus-popover");
  assert(plusPopoverText.includes("Attach files") && plusPopoverText.includes("Teach a task"), "Composer + popover must show Attach files and Teach a task");
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_15_composer_plus_and_architecture.png") });
  console.log("✔ View 15 verified: Architecture Deep-Dive Card & Composer '+' Popover ('Attach files' / 'Teach a task').");

  // 16. View 16: Composer Mic Hover Tooltip ('Click or hold Ctrl D to dictate')
  await page.click("#composer-plus-btn"); // close + popover
  await page.hover("#composer-mic-btn");
  await page.waitForSelector("#dictate-tooltip:not(.hidden)");
  const tooltipText = await page.textContent("#dictate-tooltip");
  assert(tooltipText.includes("Click or hold") && tooltipText.includes("to dictate"), "Mic tooltip must show 'Click or hold Ctrl D to dictate'");
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_16_mic_dictate_tooltip.png") });
  console.log("✔ View 16 verified: Mic Dictate Tooltip ('Click or hold Ctrl D to dictate').");

  // 17. View 17: Live Voice Chat HUD & Voice Session Footer
  await page.click("#composer-wave-btn");
  await page.waitForSelector("#voice-call-hud:not(.hidden)");
  await page.waitForSelector("#voice-session-log");
  const voiceLogText = await page.textContent("#voice-session-log");
  assert(voiceLogText.includes("Voice chat · 00:01"), "Voice session footer must show 'Voice chat · 00:01'");
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_17_live_voice_chat_hud.png") });
  console.log("✔ View 17 verified: Live Voice Call HUD & Voice Session Footer.");

  // End voice call before testing Mobile Views
  await page.click("#btn-end-voice-call");

  // 18. View 18: Mobile Viewport (390x844) Chat & Architecture View
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_18_mobile_chat_view.png") });
  console.log("✔ View 18 verified: Mobile Viewport (390x844) Chat & Architecture View.");

  // 19. View 19: Mobile Viewport Slide-Out Fleet Sidebar Drawer
  await page.click("#btn-mobile-sidebar");
  await page.waitForSelector("#left-sidebar.mobile-open");
  await page.waitForTimeout(220);
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_19_mobile_sidebar_drawer.png") });
  console.log("✔ View 19 verified: Mobile Slide-Out Fleet Sidebar Drawer.");

  // Close mobile sidebar & test Desktop Mobile Frame Preview ('CephaSI for Mobile')
  await page.click("#btn-close-mobile-sidebar");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.click("#btn-toggle-mobile-view");
  await page.waitForSelector("body.mobile-mode");
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_20_desktop_mobile_frame_preview.png") });
  console.log("✔ View 20 verified: Desktop 'CephaSI for Mobile' Phone Frame Preview.");

  // Return to Desktop View
  await page.click("#btn-exit-mobile-preview");

  // 21. View 21: Connect Apps Modal (triggered by bottom-left #btn-workspace-grid) + Connectors Chat Cards
  await page.locator("#connectors-list-card").scrollIntoViewIfNeeded();
  await page.click("#btn-workspace-grid");
  await page.waitForSelector("#modal-connect-apps:not(.hidden)");
  const caText = await page.textContent("#connect-apps-body");
  assert(caText.includes("Connect Apps") && caText.includes("27 connected") && caText.includes("Bot templates"), "Connect Apps modal must show header, 27 connected, and Bot templates button");
  assert(caText.includes("HubSpot") && caText.includes("1Password") && caText.includes("Atlassian"), "Connect Apps modal must list HubSpot, 1Password, and Atlassian");
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_21_connect_apps_modal.png") });
  console.log("✔ View 21 verified: Connect Apps Modal (with 20 Connectors & 507 Catalog chat background).");

  // 22. View 22: HubSpot App Detail View inside Modal
  await page.click('.ca-app-row[data-app-id="hubspot"]');
  const detailText = await page.textContent("#connect-apps-body");
  assert(detailText.includes("Search and update contacts, companies, deals, and tickets.") && detailText.includes("Capabilities"), "HubSpot detail view must show description and Information table");
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_22_hubspot_app_detail_modal.png") });
  console.log("✔ View 22 verified: HubSpot App Detail View inside Connect Apps Modal.");

  // 23. View 23: Bot Templates Marketplace View IN-APP MODAL (clicking Back -> 'Bot templates ↗')
  await page.click("#btn-ca-back");
  await page.click("#btn-open-bot-templates");
  const mpText = await page.textContent("#connect-apps-body");
  assert(mpText.includes("Marketplace") && mpText.includes("Featured") && mpText.includes("From CephaSI Team"), "Bot Templates Marketplace modal must render inside the app");
  assert(mpText.includes("dr eggbot") && mpText.includes("Overheard") && mpText.includes("Tradbot") && mpText.includes("Projects Manager"), "Marketplace modal must show all 4 Featured bots");
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_23_bot_templates_marketplace_modal.png") });
  await page.click("#btn-close-connect-apps");
  console.log("✔ View 23 verified: Bot Templates Marketplace Modal View (in-app modal state change).");

  // 24. View 24: Customize Main AI (CephaSI) — Crowned Sovereign Logo + 12 Illustrated Octopus Species + Main AI Lock
  await page.click("#sidebar-brand-lockup");
  await page.waitForSelector("#modal-bot-editor:not(.hidden)");
  const lockBannerVisible = await page.locator("#main-ai-lock-banner:not(.hidden)").count();
  const deleteBtnHiddenForMain = await page.locator("#btn-delete-bot-editor.hidden").count();
  const styleLabelText = await page.textContent("#bot-editor-style-label");
  assert.equal(lockBannerVisible, 1, "Main AI Lock Banner must be visible when editing CephaSI");
  assert.equal(deleteBtnHiddenForMain, 1, "Delete button must be hidden when editing Main AI CephaSI");
  assert(styleLabelText.includes("CephaSI Sovereign (Main AI)"), "CephaSI must default to Crowned CephaSI Sovereign (Main AI)");
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_24_customize_main_ai_cephasi_modal.png") });
  await page.click("#btn-close-bot-editor");
  console.log("✔ View 24 verified: Customize Main AI (CephaSI) Crowned Sovereign Logo + 12 Octopus Species + Main AI Core Lock.");

  // 25. View 25: CephaConnect Button (above User Name in bottom-left) -> Bot Fleet Audit & Access Map Bipartite Graph
  const ccBtnText = await page.textContent("#btn-cephaconnect");
  assert(ccBtnText.includes("CephaConnect"), "CephaConnect button must appear above user name in bottom-left");
  await page.click("#btn-cephaconnect");
  await page.waitForSelector("#cephaconnect-view:not(.hidden)");
  await page.waitForSelector("#cc-bipartite-svg");
  const svgBotNodes = await page.locator("#cc-bipartite-svg .cc-svg-bot-node").count();
  const svgResNodes = await page.locator("#cc-bipartite-svg .cc-svg-res-node").count();
  assert.equal(svgBotNodes, 18, "Bipartite graph must render all 18 bots from data.ts");
  assert.equal(svgResNodes, 65, "Bipartite graph must render all 65 resources from data.ts");
  // Click jAWS (Broken) to pin its edges and open its Side Panel
  await page.click('#cc-bipartite-svg .cc-svg-bot-node[data-bot-id="jaws"]');
  await page.waitForSelector("#cc-side-panel:not(.hidden)");
  const sidePanelText = await page.textContent("#cc-side-panel");
  assert(sidePanelText.includes("jAWS") && sidePanelText.includes("CA sign-in expired"), "Side panel must show jAWS details and issues");
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_25_cephaconnect_bipartite_graph.png") });
  console.log("✔ View 25 verified: CephaConnect Bipartite Access Graph + Pinning & Side Panel.");

  // 26. View 26: CephaConnect Secondary View — Bots Sortable Table Tab
  await page.click("#cc-tab-bots");
  await page.waitForSelector("#cc-bots-table");
  const botTableRows = await page.locator("#cc-bots-table tbody tr").count();
  assert.equal(botTableRows, 18, "Bots table must list all 18 bots");
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_26_cephaconnect_bots_table.png") });
  console.log("✔ View 26 verified: CephaConnect Bots Sortable Table + Side Panel.");

  // 27. View 27: CephaConnect Secondary View — Resources Table + Light Theme Toggle
  await page.click("#cc-tab-resources");
  await page.waitForSelector("#cc-resources-table");
  await page.click("#btn-cc-theme");
  await page.waitForSelector("#cephaconnect-view.cc-light");
  await page.click('#cc-resources-table tbody tr[data-res-row="zpriv"]');
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_27_cephaconnect_resources_light_theme.png") });
  console.log("✔ View 27 verified: CephaConnect Resources Table + Light Theme + Resource Side Panel.");

  // 28. View 28: Elemental Tentacle Hover Loops + 5-Second Thinking Tentacle Demo ('Doctor' -> 'hello' -> 'Putting it together')
  await page.click("#btn-close-cephaconnect");
  await page.waitForSelector("#cephaconnect-view", { state: "hidden" });

  // Verify tentacle SVGs carry data-tfx elemental animation archetypes & motion groups
  const tfxCount = await page.locator("svg.tentacle-svg[data-tfx] g.t-body-motion").count();
  assert(tfxCount >= 18, "All sidebar tentacles must render with data-tfx elemental loop attributes and .t-body-motion");

  // Select Doctor (matching user reference screenshot)
  await page.click('.bot-list-item[data-bot-id="doctor"]');
  const doctorStreamText = await page.textContent("#chat-stream");
  assert(
    doctorStreamText.includes("The California routers need one extra step") &&
      doctorStreamText.includes("ip access-list standard SNMP_ACCESS"),
    "Doctor thread must display the California routers SNMP_ACCESS card"
  );

  // Hover over Doctor's sidebar tentacle & top pill tentacle to trigger elemental hover state
  await page.hover('.bot-list-item[data-bot-id="doctor"]');

  // Trigger the 5-second Thinking Prompt Demo ('hello' on Doctor)
  await page.click("#btn-demo-5s-prompt");
  await page.waitForSelector("#bot-thinking-indicator");
  await page.waitForTimeout(600);

  const thinkingTentacleActive = await page.locator("#bot-thinking-indicator .thinking-tentacle-stage svg.tentacle-svg.thinking-active").count();
  const thinkingDotsCount = await page.locator("#bot-thinking-indicator .thinking-dots span").count();
  const thinkingStatusText = await page.textContent("#thinking-status-text");
  const thinkingTimerText = await page.textContent("#thinking-timer-badge");
  assert.equal(thinkingTentacleActive, 1, "Animated tentacle must appear with .thinking-active inside #bot-thinking-indicator");
  assert.equal(thinkingDotsCount, 3, "Three pulsing dots must appear next to the thinking tentacle");
  assert(thinkingStatusText.includes("Putting it together"), "Thinking indicator must display 'Putting it together'");
  assert(thinkingTimerText.endsWith("s"), "5-second countdown badge must display remaining seconds");

  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_28_tentacle_thinking_5s_demo.png") });
  console.log("✔ View 28a verified: Active 5s Thinking Tentacle Animation ('Putting it together' + pulsing dots + countdown).");

  // Wait for the 5-second demo prompt to finish and verify the reply card appears
  await page.waitForTimeout(4700);
  const thinkingAfter5s = await page.locator("#bot-thinking-indicator").count();
  const replyCardCount = await page.locator(".demo-reply-card").count();
  assert.equal(thinkingAfter5s, 0, "Thinking indicator must clear after 5 seconds");
  assert.equal(replyCardCount, 1, "Simulated reply card must appear after 5 seconds");
  console.log("✔ View 28b verified: 5-second made-up prompt completed and rendered reply card.");

  // 29. View 29: Right-Click a Tentacle / Bot in the Sidebar (Screenshot 1: Pin, Move to, Mark as Unread, Rename Bot, Copy conversation ID, Hide from sidebar, Delete)
  await page.click('.bot-list-item[data-bot-id="dojo"]', { button: "right" });
  await page.waitForSelector("#bot-context-menu:not(.hidden)");
  const botMenuText = await page.textContent("#bot-context-menu");
  assert(
    botMenuText.includes("Pin") &&
      botMenuText.includes("Move to") &&
      botMenuText.includes("Mark as Unread") &&
      botMenuText.includes("Rename Bot") &&
      botMenuText.includes("Copy conversation ID") &&
      botMenuText.includes("Hide from sidebar") &&
      botMenuText.includes("Delete"),
    "Tentacle right-click menu must include all 7 items from Screenshot 1"
  );
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_29_tentacle_right_click_menu.png") });
  console.log("✔ View 29 verified: Tentacle Right-Click Context Menu (Pin, Move to, Mark as Unread, Rename Bot, Copy conversation ID, Hide from sidebar, Delete).");

  // 30. View 30: Select a Section Header (Screenshot 2: Rename, Move up, Move down, Delete) & Verify 'Unassigned' CANNOT be deleted
  await page.click('.bot-group-header[data-section-name="Important - Droplets"]');
  await page.waitForSelector("#section-context-menu:not(.hidden)");
  const secMenuText = await page.textContent("#section-context-menu");
  assert(
    secMenuText.includes("Rename") &&
      secMenuText.includes("Move up") &&
      secMenuText.includes("Move down") &&
      secMenuText.includes("Delete"),
    "Section context menu must include Rename, Move up, Move down, and Delete"
  );
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_30_section_context_menu.png") });

  // Verify Unassigned section cannot be deleted
  await page.click('.bot-group-header[data-section-name="Unassigned"]');
  await page.waitForSelector("#section-context-menu:not(.hidden)");
  const unassignedDeleteDisabled = await page.locator('#section-context-menu [data-section-action="delete"][data-disabled="true"]').count();
  assert.equal(unassignedDeleteDisabled, 1, "Delete must be disabled on the Unassigned section");
  await page.click('#section-context-menu [data-section-action="delete"]');
  const unassignedStillPresent = await page.locator('.bot-group-header[data-section-name="Unassigned"]').count();
  assert.equal(unassignedStillPresent, 1, "Unassigned section must never be deleted");
  console.log("✔ View 30 verified: Section Context Menu (Rename, Move up, Move down, Delete) & Unassigned Deletion Guardrail.");

  // 31. View 31: Active Working Tentacle Movement + Blue Dot (Done Working / Pending New Message) + Orange Dot (Blocked by HITL / Guardrail)
  await page.keyboard.press("Escape");
  const workingBotsCount = await page.locator(".bot-list-item.is-working").count();
  const workingWaveIndicators = await page.locator(".bot-list-item.is-working .working-wave-indicator").count();
  const blueDotsCount = await page.locator(".bot-list-item .unread-dot.blue-dot").count();
  const orangeDotsCount = await page.locator(".bot-list-item .blocked-dot.orange-dot").count();
  const doctorHasBlueDotAfter5s = await page.locator('.bot-list-item[data-bot-id="doctor"] .unread-dot.blue-dot').count();

  assert(workingBotsCount >= 2, "At least 2 tentacles (Carrier/Portal, Builder) must be actively moving in .is-working state");
  assert.equal(workingWaveIndicators, workingBotsCount, "Every working tentacle row must show the .working-wave-indicator");
  assert(blueDotsCount >= 3, "Blue dots (.unread-dot.blue-dot) must appear for done-working / pending new message bots (Sentry, Overwatch, Doctor)");
  assert.equal(doctorHasBlueDotAfter5s, 1, "Doctor must automatically receive a Blue Dot (.unread-dot.blue-dot) after finishing its 5s thinking task");
  assert(orangeDotsCount >= 2, "Orange dots (.blocked-dot.orange-dot) must appear for HITL / Guardrail blocked bots (Atlas, jAWS)");

  // Select Atlas (blocked by HITL/Guardrail) so the HITL banner is also visible in chat alongside the sidebar states
  await page.click('.bot-list-item[data-bot-id="atlas"]');
  await page.waitForSelector('.hitl-guardrail-banner[data-blocked-banner="atlas"]');
  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_31_tentacle_working_blue_orange_dots.png") });
  console.log("✔ View 31 verified: Working Tentacle Movement (.is-working) + Blue Dot (.unread-dot.blue-dot) + Orange Dot (.blocked-dot.orange-dot) & HITL Banner.");

  // 32. View 32: Ubuntu Font Default + GrokBot Icon/Font Proportions + Major Font Style Selector in Settings
  await page.click('.bot-list-item[data-bot-id="doctor"]');
  const metrics = await page.evaluate(() => {
    const bodyFont = getComputedStyle(document.body).fontFamily;
    const chatCardFontSize = getComputedStyle(document.querySelector(".chat-card")).fontSize;
    const botItemNameFontSize = getComputedStyle(document.querySelector(".bot-item-name")).fontSize;
    const pinnedSvgWidth = document.querySelector(".pinned-avatar-wrap svg")?.getAttribute("width");
    const listSvgWidth = document.querySelector(".bot-item-avatar svg")?.getAttribute("width");
    return { bodyFont, chatCardFontSize, botItemNameFontSize, pinnedSvgWidth, listSvgWidth };
  });

  assert(metrics.bodyFont.includes("Ubuntu"), `Default font family must be Ubuntu, got: ${metrics.bodyFont}`);
  assert.equal(metrics.chatCardFontSize, "14.5px", "Chat card font size must match GrokBot (14.5px)");
  assert.equal(metrics.botItemNameFontSize, "14px", "Sidebar bot name font size must match GrokBot (14px)");
  assert.equal(metrics.pinnedSvgWidth, "62", "Pinned bot icon width must match GrokBot (62px)");
  assert.equal(metrics.listSvgWidth, "38", "Sidebar bot list icon width must match GrokBot (38px)");

  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_32a_ubuntu_grokbot_icon_font_sizes.png") });

  // Open Settings -> General and verify the 12 major font styles selector
  await page.click("#btn-user-menu");
  await page.waitForSelector("#user-popover:not(.hidden)");
  await page.click("#btn-open-settings");
  await page.waitForSelector("#modal-settings:not(.hidden)");
  await page.click('.settings-nav-btn[data-settings-tab="General"]');

  const fontOptionsCount = await page.locator("#settings-font-style-grid .font-style-option-btn").count();
  assert.equal(fontOptionsCount, 12, "Settings -> General must display 12 major font style options");

  // Test switching to Poppins and back to Ubuntu
  await page.click('.font-style-option-btn[data-font-id="poppins"]');
  const poppinsApplied = await page.evaluate(() => getComputedStyle(document.body).fontFamily.includes("Poppins"));
  assert(poppinsApplied, "Clicking Poppins in Settings must update document.body font-family to Poppins");

  await page.click('.font-style-option-btn[data-font-id="ubuntu"]');
  const ubuntuRestored = await page.evaluate(() => getComputedStyle(document.body).fontFamily.includes("Ubuntu"));
  assert(ubuntuRestored, "Clicking Ubuntu in Settings must restore document.body font-family to Ubuntu");

  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_32b_settings_font_styles.png") });
  console.log("✔ View 32 verified: Ubuntu Font Default + GrokBot Icon/Font Sizes (62px/38px icons, 14.5px chat) + 12 Major Font Styles in Settings.");

  // 33. View 33: Typing in Composer dynamically switches Voice Chat button (#composer-wave-btn) to Enter / Send Arrow (#composer-send-icon)
  await page.click("#btn-close-settings");
  await page.waitForSelector("#modal-settings.hidden", { state: "hidden" });

  const initialMode = await page.getAttribute("#composer-wave-btn", "data-mode");
  const initialWaveIconCount = await page.locator("#composer-wave-btn #composer-wave-icon").count();
  assert.equal(initialMode, "voice", "Composer button must start in voice mode when input is empty");
  assert.equal(initialWaveIconCount, 1, "Composer button must show voice waveform icon when input is empty");

  // Type "hello" into the composer input
  await page.fill("#chat-composer-input", "hello");
  const typingMode = await page.getAttribute("#composer-wave-btn", "data-mode");
  const sendArrowIconCount = await page.locator("#composer-wave-btn #composer-send-icon").count();
  assert.equal(typingMode, "send", "Composer button must switch to send/enter mode as soon as user starts typing");
  assert.equal(sendArrowIconCount, 1, "Composer button must display upward Enter/Send arrow (#composer-send-icon) while typing");

  await page.screenshot({ path: path.join(SCRATCH_DIR, "view_33_composer_typing_enter_arrow.png") });

  // Clicking the Enter/Send arrow button submits the message and reverts button back to voice mode
  await page.click("#composer-wave-btn");
  const afterSendMode = await page.getAttribute("#composer-wave-btn", "data-mode");
  const inputAfterSend = await page.inputValue("#chat-composer-input");
  const thinkingTriggered = await page.locator("#bot-thinking-indicator").count();
  assert.equal(afterSendMode, "voice", "Composer button must revert to voice mode after sending message");
  assert.equal(inputAfterSend, "", "Composer input must clear after clicking Enter/Send button");
  assert.equal(thinkingTriggered, 1, "Clicking the Enter/Send button must trigger the bot prompt reply");
  console.log("✔ View 33 verified: Typing in composer switches Voice Chat button to Enter/Send arrow (↑) and sends on click.");

  await browser.close();
  console.log("\nALL 33 E2E VERIFICATION CHECKS PASSED SUCCESSFULLY!");
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
