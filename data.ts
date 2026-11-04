// Bot Fleet Audit & Access Map (V2 + V3): data export from the Page, Nov 3, 2026
// Edge kinds: "o" = observed in use, "r" = referenced in role/profile, "p" = platform-possible (derived from user:true resources)

export type Gen = "V2" | "V3";
export type BotStatus = "OK" | "Warning" | "Broken";
export type ResStatus = "ok" | "warn" | "err" | "neutral";
export type EdgeKind = "o" | "r" | "p";

export interface Bot { id: string; name: string; gen: Gen; status: BotStatus; role: string; conn: string; routines: string; memory: string; drive: string; issues: string[]; links: string }
export interface Res { id: string; label: string; group: string; status: ResStatus; note: string; user?: boolean }
export interface Edge { bot: string; res: string; kind: EdgeKind }

export const GROUPS = ["Connectors", "Box APIs (wg-ai)", "Memory", "Drive", "Stores", "Routines", "Local box files"];

export const RES: Res[] = [
  { id: "cal", label: "Google Calendar", group: "Connectors", status: "ok", note: "ready", user: true },
  { id: "docs", label: "Google Docs", group: "Connectors", status: "ok", note: "ready", user: true },
  { id: "sheets", label: "Google Sheets", group: "Connectors", status: "ok", note: "ready", user: true },
  { id: "slides", label: "Google Slides", group: "Connectors", status: "ok", note: "ready", user: true },
  { id: "drive", label: "Google Drive", group: "Connectors", status: "ok", note: "ready; CephaSIArtifacts listed fine", user: true },
  { id: "chat", label: "Google Chat", group: "Connectors", status: "ok", note: "ready (was needsAuth Oct 16); has send_message", user: true },
  { id: "gmail", label: "Gmail", group: "Connectors", status: "ok", note: "ready; has send_email and send_draft", user: true },
  { id: "atl", label: "Atlassian (Jira, Confluence)", group: "Connectors", status: "ok", note: "ready", user: true },
  { id: "slack", label: "Slack", group: "Connectors", status: "ok", note: "ready; send, schedule and DM tools reachable by every bot", user: true },
  { id: "lucid", label: "Lucid", group: "Connectors", status: "ok", note: "ready", user: true },
  { id: "pd", label: "PagerDuty", group: "Connectors", status: "warn", note: "ready now (token missing on Oct 16); no bot polls it yet", user: true },
  { id: "gh", label: "GitHub", group: "Connectors", status: "ok", note: "cursor-github ready; old user-GitHub connector is gone", user: true },
  { id: "origin", label: "Origin", group: "Connectors", status: "ok", note: "ready", user: true },
  { id: "ctx", label: "Context-mode", group: "Connectors", status: "ok", note: "ready; no role uses it", user: true },
  { id: "zbxmcp", label: "user-zabbix (old connector)", group: "Connectors", status: "warn", note: "retired, pending removal (CephaSI, 2026-11-02); zabbix_health timed out after 30 s in the 5:25 PM audit", user: true },
  { id: "zpriv", label: "zabbix-private", group: "Connectors", status: "ok", note: "Zabbix connector now in use: Zabbix 7.4.9 at 172.31.100.23 over wg-ai (CephaSI, 2026-11-02)", user: true },
  { id: "awsmcp", label: "Aws-mcp", group: "Connectors", status: "err", note: "account calls refused: expired or invalid keys; account unverified", user: true },
  { id: "awsca", label: "aws-ca connector", group: "Connectors", status: "neutral", note: "still connecting (CephaSI, 2026-11-02); earlier: docs tools only, no account access", user: true },
  { id: "sre", label: "aws-mcp-sre-readonly", group: "Connectors", status: "ok", note: "STS OK: UT 932822692243, role sre-agent-readonly", user: true },
  { id: "awsut", label: "aws-ut", group: "Connectors", status: "neutral", note: "still connecting (CephaSI, 2026-11-02); earlier: failed live tool discovery (expired credentials)", user: true },
  { id: "latt", label: "lattigo", group: "Connectors", status: "ok", note: "ready (14 read tools)", user: true },
  { id: "rea", label: "rea", group: "Connectors", status: "neutral", note: "still connecting (CephaSI, 2026-11-02); reverse-engineering kit, no role uses it", user: true },
  { id: "x", label: "x", group: "Connectors", status: "ok", note: "ready; no role uses it", user: true },
  { id: "wispr", label: "Wispr-flow", group: "Connectors", status: "ok", note: "ready", user: true },
  { id: "ramp", label: "Ramp (Dashboard team)", group: "Connectors", status: "ok", note: "Tyson re-authorized it at 5:08 PM MT today", user: true },
  { id: "finx", label: "Finance connector (not on list)", group: "Connectors", status: "warn", note: "needs sign-in (CephaSI, 2026-11-02); not in the expected connector set", user: true },
  { id: "wgai", label: "wg-ai WireGuard tunnel", group: "Box APIs (wg-ai)", status: "ok", note: "restored 7:04 PM MT Nov 2 with a new client key (CephaSI, 2026-11-02)" },
  { id: "zbxapi", label: "Zabbix API .23", group: "Box APIs (wg-ai)", status: "ok", note: "reachable again after the wg-ai restore (2026-11-02); audit: HTTP 200 in 0.13 s, 27 open problems" },
  { id: "unimus", label: "Unimus API .79", group: "Box APIs (wg-ai)", status: "ok", note: "reachable again after the wg-ai restore (2026-11-02); audit: HTTP 200, 28 devices" },
  { id: "netbox", label: "NetBox API .63", group: "Box APIs (wg-ai)", status: "warn", note: "reachable again after the wg-ai restore (2026-11-02); audit: HTTP 200, v4.0.0, but 0 devices recorded" },
  { id: "uptime", label: "UptimeRobot", group: "Box APIs (wg-ai)", status: "ok", note: "ok; 4 up, 0 down, 3 paused monitors" },
  { id: "cli-ca", label: "AWS CLI profile aws-ca", group: "Box APIs (wg-ai)", status: "err", note: "session expired (jAWS check, 5:02 PM MT)" },
  { id: "cli-nb", label: "AWS CLI profile aws-nb", group: "Box APIs (wg-ai)", status: "err", note: "no credentials for NB 370141938652" },
  { id: "mem-own", label: "Own bot memory (private, each bot)", group: "Memory", status: "ok", note: "every bot has its own; UpdateMemory seen in most bots" },
  { id: "mem-shared", label: "Shared user memory", group: "Memory", status: "ok", note: "199 facts; mostly written via CephaSI" },
  { id: "mem-orphan", label: "Memory of 3 deleted bots", group: "Memory", status: "warn", note: "user-memory/by-agent folders remain for 3 deleted bot ids" },
  { id: "d-root", label: "CephaSIArtifacts + manifest.md", group: "Drive", status: "ok", note: "manifest updated 5:07 PM MT today; every bot reads it before saving files (CephaSI, 2026-11-02)" },
  { id: "d-reg", label: "registry.md", group: "Drive", status: "ok", note: "every bot reads it before routing work (CephaSI, 2026-11-02)" },
  { id: "d-01", label: "01-Reports", group: "Drive", status: "ok", note: "write path (CephaSI, 2026-11-02)" },
  { id: "d-02", label: "02-Knowledge", group: "Drive", status: "ok", note: "write path (CephaSI, 2026-11-02)" },
  { id: "d-03", label: "03-Diagrams", group: "Drive", status: "ok", note: "write path; Curator owns the Lucid topology diagrams (CephaSI, 2026-11-02)" },
  { id: "d-04", label: "04-Snapshots", group: "Drive", status: "warn", note: "jAWS's aws-net-snapshot folder moving here; pending until Tyson drags it (CephaSI, 2026-11-02)" },
  { id: "d-docs", label: "CephaSI - Documentation", group: "Drive", status: "ok", note: "new: 02-Bot-Profiles (18 bots), 04-Routines (Navi, Dashboards, Overwatch, Slacky, Dojo), 06-Connectors/connectors.md (CephaSI, 2026-11-02)" },
  { id: "d-ai", label: "AI Artifacts", group: "Drive", status: "ok", note: "bot output folder" },
  { id: "d-diag", label: "Net-Eng AI Diagrams", group: "Drive", status: "ok", note: "diagram folder" },
  { id: "d-pipe", label: "05-dashboard-pipeline", group: "Drive", status: "ok", note: "Dashboards installer and source; installer 1.4.1 (CephaSI, 2026-11-02)" },
  { id: "d-pers", label: "Personal Documents", group: "Drive", status: "ok", note: "Tyson only; no bot should use it" },
  { id: "d-v3", label: "V3 Locked (bot configs)", group: "Drive", status: "ok", note: "skill packs; Dojo owns" },
  { id: "d-sheets", label: "Registry + action-items Sheets", group: "Drive", status: "ok", note: "bot registry and net-eng-action-items_navi" },
  { id: "d-gov", label: "Governance tyson-comms-style.md", group: "Drive", status: "warn", note: "two files with this name exist" },
  { id: "d-know", label: "Old /Knowledge/ and /Artifacts/ paths", group: "Drive", status: "ok", note: "replaced: write paths now point to 01-Reports, 02-Knowledge and 03-Diagrams (CephaSI, 2026-11-02); audit found Platforms, Products, Runbooks missing" },
  { id: "s-user", label: "User store: 5 Pages", group: "Stores", status: "warn", note: "3 of 5 Pages are public links" },
  { id: "s-own", label: "store-9717ee06 (CephaSI)", group: "Stores", status: "ok", note: "mounted, empty" },
  { id: "s-b6c", label: "store-b6c192f9", group: "Stores", status: "warn", note: "mounted, empty, owner unverified" },
  { id: "r-morning", label: "Morning Report", group: "Routines", status: "ok", note: "Navi; weekdays 7:00 AM MT; enabled" },
  { id: "r-midday", label: "Midday Report", group: "Routines", status: "ok", note: "Navi; weekdays 11:30 AM MT; enabled" },
  { id: "r-evening", label: "Evening Report", group: "Routines", status: "ok", note: "Navi; weekdays 3:30 PM MT; ran 3:35 PM MT today" },
  { id: "r-slack", label: "Net-Eng Slack question watcher", group: "Routines", status: "ok", note: "Slacky; event-driven; 15+ runs today, all clean skips" },
  { id: "r-zbx", label: "Zabbix alert intake (15-min poll)", group: "Routines", status: "ok", note: "Overwatch; last run 5:10 PM MT, status ok" },
  { id: "r-dash", label: "Refresh Net-Eng Command Dashboard", group: "Routines", status: "ok", note: "Dashboards; weekdays around 7:00, 11:30 and 15:30 MT; reports to CephaSI instead of Tyson (CephaSI, 2026-11-02); last write 3:44 PM MT" },
  { id: "r-dojo", label: "Weekly registry and guardrail audit", group: "Routines", status: "ok", note: "Dojo; Mondays 8 AM MT; first run Nov 9, 2026 (CephaSI, 2026-11-02)" },
  { id: "l-ws", label: "/workspace scratch", group: "Local box files", status: "err", note: "2.2 GB, about 23,000 files, incl. audits and account dumps" },
  { id: "l-net", label: "/home/box/network", group: "Local box files", status: "err", note: "devices.json, secrets.json, audits, zabbix-triage suite" },
  { id: "l-ow", label: "Overwatch state file", group: "Local box files", status: "warn", note: "agent-data/overwatch/zabbix_intake_state.json" },
  { id: "l-opt", label: "/opt/net-eng-dashboard", group: "Local box files", status: "ok", note: "approved exception in the manifest" }
];

export const BOTS: Bot[] = [
  { id: "cephasi", name: "CephaSI", gen: "V2", status: "Warning", role: "Primary router; receives every approval, secret and human-in-the-loop ask (priority true) and every status report (2026-11-02)", conn: "All user connectors; own use unverified", routines: "None seen (unverified)", memory: "Own + main writer of shared memory", drive: "CephaSIArtifacts", issues: ["Its own sessions could not be read from this audit (unverified)", "App settings still pin a deleted bot and 3 unknown bot ids", "Auto-review allow rule lets scripts read network passwords from secrets.json"], links: "mem-shared:o mem-own:r s-own:r d-root:r" },
  { id: "dashboard", name: "Dashboards", gen: "V3", status: "Warning", role: "Owns all dashboard Pages, including this one", conn: "Calendar, Slack (read), Jira, Sheets, Drive, Gmail metadata, zabbix-private, Ramp (read)", routines: "Refresh Net-Eng Command Dashboard: weekdays around 7:00, 11:30 and 15:30 MT; now reports to CephaSI instead of Tyson; last write 3:44 PM MT", memory: "Own + shared", drive: "05-dashboard-pipeline (installer 1.4.1), action-items Sheet", issues: ["Network Map scripts are being rebuilt (2026-11-02)", "Audit: profile description was empty", "3 of its 5 Pages are public links"], links: "cal:o slack:o atl:o sheets:o gmail:r drive:o zbxapi:o zpriv:r netbox:o ramp:r s-user:o r-dash:o d-pipe:o d-sheets:o l-opt:o mem-own:o mem-shared:o d-root:r" },
  { id: "navi", name: "Navi", gen: "V3", status: "OK", role: "Tyson's personal assistant; comms drafts; runs the three reports", conn: "Gmail, Calendar, Drive, Docs, Confluence", routines: "Morning, Midday, Evening: enabled; Evening ran 3:35 PM MT", memory: "Own + shared", drive: "Governance style file, action-items Sheet", issues: ["No connector for Paylocity, Google Keep or Google Tasks (minor)"], links: "gmail:o cal:o drive:o docs:r atl:r d-gov:r d-sheets:r r-morning:o r-midday:o r-evening:o mem-own:o mem-shared:o d-root:r" },
  { id: "slacky", name: "Slacky", gen: "V3", status: "OK", role: "Only bot that posts in Slack; approvals via CephaSI", conn: "Slack (read and write), net-eng@ mailbox (read)", routines: "Net-Eng Slack question watcher: OK, many clean runs today", memory: "Own + shared", drive: "CephaSIArtifacts", issues: ["Sent 2 DMs today with Tyson's approval, but its profile still says no channels beyond the three Net-Eng ones"], links: "slack:o gmail:r r-slack:o mem-own:o mem-shared:o d-root:r" },
  { id: "overwatch", name: "Overwatch", gen: "V3", status: "Warning", role: "Alert intake and triage (Zabbix, PagerDuty)", conn: "zabbix-private (Zabbix 7.4.9 over wg-ai), Zabbix API, PagerDuty, Jira", routines: "Zabbix alert intake (15-min poll): OK, last 5:10 PM MT", memory: "Own + shared", drive: "CephaSIArtifacts", issues: ["PagerDuty intake not wired: connector ready, no routine", "Keeps poll state and script on the box", "Whether old-Dr's Zabbix webhook was paused is unverified"], links: "zbxapi:o zpriv:r pd:r atl:r r-zbx:o l-ow:o l-ws:o mem-own:o mem-shared:o d-root:r" },
  { id: "doctor", name: "Doctor", gen: "V3", status: "Warning", role: "Read-only troubleshooting and hygiene sweeps", conn: "zabbix-private (Zabbix 7.4.9 over wg-ai), NetBox, Unimus, Lattigo, Confluence", routines: "No hygiene-sweep routine seen (unverified)", memory: "Own + shared", drive: "01-Reports, 02-Knowledge, 03-Diagrams (old /Knowledge/Runbooks replaced)", issues: ["Audit: could not triage the CAT16 Tu0 alert when the old Zabbix connector timed out; now on zabbix-private (2026-11-02)"], links: "zpriv:r zbxapi:r netbox:r unimus:r latt:r atl:r d-know:r mem-own:o mem-shared:o d-root:r" },
  { id: "curator", name: "Curator", gen: "V3", status: "Warning", role: "Owns NetBox, Unimus, IP plan and the Lucid topology diagrams", conn: "Unimus (works), NetBox, GitHub, Confluence, Lucid", routines: "None seen (unverified)", memory: "Own + shared", drive: "03-Diagrams, Net-Eng AI Diagrams", issues: ["NetBox answers but holds 0 devices; Curator last said it had no NetBox address or token", "Profile grants NetBox and Unimus writes; confirm that is intended", "No IP-plan or diagram work seen"], links: "unimus:o netbox:r gh:r atl:r d-diag:r d-03:r lucid:r mem-own:o mem-shared:o d-root:r" },
  { id: "architect", name: "Architect", gen: "V3", status: "OK", role: "SDD design lead, PR review, gated change plans", conn: "GitHub (read), Origin, Confluence, Drive", routines: "None (none required)", memory: "Own + shared", drive: "CephaSIArtifacts", issues: ["Idle since Oct 16 apart from today's old-Dr handoff"], links: "gh:r origin:r atl:r drive:r mem-own:o mem-shared:o d-root:r" },
  { id: "builder", name: "Builder", gen: "V3", status: "Warning", role: "Code and IaC; lab testing; sole GitHub writer", conn: "GitHub, Origin, Drive; EVE-NG and Proxmox have no connector", routines: "None seen (unverified)", memory: "Own + shared", drive: "zabbix-triage-suite zip", issues: ["Took over the zabbix-triage suite, which lives on the box", "Holding a live ipsec_down test on CAT16-TELUS-SECONDARY for Tyson's go-ahead"], links: "gh:r origin:r drive:o l-net:o mem-own:o mem-shared:o d-root:r" },
  { id: "jaws", name: "jAWS", gen: "V3", status: "Broken", role: "Owns AWS (UT, CA, NB); proposes only", conn: "Only aws-mcp-sre-readonly (UT) works", routines: "None", memory: "Own + shared", drive: "aws-net-snapshot, moving to 04-Snapshots (pending: Tyson still has to drag it); old-jAWS docs", issues: ["CA sign-in expired (5:02 PM MT); waiting on Tyson", "NB has no credentials", "aws-ut connector errors; Aws-mcp keys rejected"], links: "cli-ca:o cli-nb:r d-04:r awsut:r awsca:r awsmcp:r sre:r gh:r drive:o mem-own:o mem-shared:o d-root:r" },
  { id: "gatekeeper", name: "Gatekeeper", gen: "V3", status: "OK", role: "Only Jira NETE change records and the audit trail (2026-11-02)", conn: "Jira, Calendar, Drive", routines: "None seen", memory: "Shared", drive: "CephaSIArtifacts", issues: ["Idle since Oct 16; no NETE hand-offs from Overwatch or Onboard seen yet"], links: "atl:r cal:r drive:r mem-own:r mem-shared:o d-root:r" },
  { id: "dojo", name: "Dojo", gen: "V3", status: "Warning", role: "Bot QA gate; owns Drive bot configs", conn: "Drive, Sheets", routines: "Weekly registry and guardrail audit: Mondays 8 AM MT, first run Nov 9, 2026", memory: "Own + shared", drive: "V3 Locked, registry, AI Artifacts", issues: ["QA plan from Oct 16 covers 17 bots; fleet is now 17 V3 + 1 V2 (CephaSI)", "No regression run after today's retirements"], links: "d-v3:o d-sheets:o d-ai:o r-dojo:r drive:o sheets:o mem-own:o mem-shared:o d-root:r" },
  { id: "ledger", name: "Ledger", gen: "V3", status: "Warning", role: "FinOps and licensing (read-only)", conn: "Ramp (re-authorized 5:08 PM), Sheets", routines: "None", memory: "Shared", drive: "CephaSIArtifacts", issues: ["No NetSuite or Cisco Smart Licensing connector", "Ramp shows only 3 spenders"], links: "ramp:o sheets:r drive:r mem-own:r mem-shared:o d-root:r" },
  { id: "atlas", name: "Atlas", gen: "V3", status: "Warning", role: "Platform and product docs", conn: "Drive, Confluence, Lattigo, Sheets", routines: "None", memory: "Shared", drive: "01-Reports, 02-Knowledge, 03-Diagrams (old /Knowledge/ paths replaced)", issues: ["No Playgen, Midway, Summit or Hercules connector"], links: "drive:o d-know:o atl:r latt:r sheets:r mem-own:r mem-shared:o d-root:o" },
  { id: "carrier", name: "Carrier/Portal", gen: "V3", status: "Warning", role: "Carrier ops (SIM, ICCID, APN); separate bot that owns all portals, 3 to 5 more coming", conn: "Lattigo", routines: "None", memory: "Shared", drive: "AI Artifacts (drafts)", issues: ["No Hercules connector", "Idle since Oct 16"], links: "latt:r d-ai:r mem-own:r mem-shared:o d-root:r" },
  { id: "sentry", name: "Sentry", gen: "V3", status: "Warning", role: "Security audit (read-only)", conn: "GitHub, aws-mcp-sre-readonly (UT)", routines: "None", memory: "Own + shared", drive: "Audit docs in AI Artifacts", issues: ["No eSentire, Fortinet EMS or JumpCloud connector; CA and NB blocked", "Holding open criticals: plaintext PSKs in the net-eng repo, a PSK printed to box scratch, public UT Aurora"], links: "gh:o sre:o cli-ca:r d-ai:o l-ws:o mem-own:o mem-shared:o d-root:r" },
  { id: "onboard", name: "Onboard", gen: "V3", status: "Warning", role: "Customer IPsec, OpenVPN, OCIP onboarding", conn: "Drive, Sheets, Confluence, NetBox", routines: "None", memory: "Shared", drive: "PtP Request Forms", issues: ["NetBox is empty; no OpenVPN connector"], links: "drive:o sheets:o atl:r netbox:r mem-own:r mem-shared:o d-root:r" },
  { id: "oracle", name: "Oracle", gen: "V3", status: "OK", role: "Company docs Q&A, training, runbook search", conn: "Drive, Confluence, Slack (read), Docs, Sheets, Slides", routines: "None", memory: "Shared", drive: "Knowledge Templates; write paths now 01-Reports, 02-Knowledge, 03-Diagrams", issues: ["Old /Knowledge/ path replaced by 02-Knowledge (2026-11-02)"], links: "drive:o atl:o slack:o docs:r sheets:r slides:r d-know:r mem-own:r mem-shared:o d-root:r" }
];

export const EDGES: Edge[] = BOTS.flatMap((b: Bot) => b.links.split(" ").map((s: string) => { const [res, k] = s.split(":"); return { bot: b.id, res, kind: k as EdgeKind }; })).concat(BOTS.map((b: Bot) => ({ bot: b.id, res: "d-reg", kind: "r" as EdgeKind })));
