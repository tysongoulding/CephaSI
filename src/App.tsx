import React, { useEffect, useMemo, useState } from "react";
import { BOTS, EDGES, GROUPS, RES, type Bot, type BotStatus, type Edge, type EdgeKind, type Res, type ResStatus } from "../data";

type ActiveTab = "graph" | "bots" | "resources";
type BotSortKey = "name" | "gen" | "status" | "role" | "conn" | "routines" | "issues";
type ResSortKey = "label" | "group" | "status" | "note" | "degree";

const BOT_STATUS_ORDER: Record<BotStatus, number> = { Broken: 0, Warning: 1, OK: 2 };
const RES_STATUS_ORDER: Record<ResStatus, number> = { err: 0, warn: 1, neutral: 2, ok: 3 };

const STATUS_COLORS = {
  OK: "#10b981",
  Warning: "#f59e0b",
  Broken: "#ef4444",
  ok: "#10b981",
  warn: "#f59e0b",
  err: "#ef4444",
  neutral: "#9ca3af"
};

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<ActiveTab>("graph");
  const [groupFilter, setGroupFilter] = useState<string>("All");
  const [observedOnly, setObservedOnly] = useState<boolean>(false);
  const [showPlatform, setShowPlatform] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [hoveredNode, setHoveredNode] = useState<{ type: "bot" | "res"; id: string } | null>(null);
  const [pinnedNode, setPinnedNode] = useState<{ type: "bot" | "res"; id: string } | null>(null);
  const [selectedPanelNode, setSelectedPanelNode] = useState<{ type: "bot" | "res"; id: string } | null>(null);

  const [botSortKey, setBotSortKey] = useState<BotSortKey>("status");
  const [botSortAsc, setBotSortAsc] = useState<boolean>(true);
  const [resSortKey, setResSortKey] = useState<ResSortKey>("degree");
  const [resSortAsc, setResSortAsc] = useState<boolean>(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPinnedNode(null);
        setSelectedPanelNode(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Compute all edges including derived platform ("p") edges when enabled
  const allEdges = useMemo<Edge[]>(() => {
    const base = [...EDGES];
    const existingSet = new Set(base.map((e) => `${e.bot}:${e.res}`));
    if (showPlatform) {
      for (const b of BOTS) {
        for (const r of RES) {
          if (r.user && !existingSet.has(`${b.id}:${r.id}`)) {
            base.push({ bot: b.id, res: r.id, kind: "p" });
          }
        }
      }
    }
    return observedOnly ? base.filter((e) => e.kind === "o") : base;
  }, [observedOnly, showPlatform]);

  // Sorted bots for the Bipartite Graph: Broken -> Warning -> OK
  const graphBots = useMemo<Bot[]>(() => {
    return [...BOTS].sort((a, b) => {
      const diff = BOT_STATUS_ORDER[a.status] - BOT_STATUS_ORDER[b.status];
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    });
  }, []);

  // Filtered resources for the Bipartite Graph grouped by GROUPS
  const groupedResources = useMemo(() => {
    const groupsToUse = groupFilter === "All" ? GROUPS : GROUPS.filter((g) => g === groupFilter);
    return groupsToUse
      .map((g) => ({
        group: g,
        items: RES.filter((r) => r.group === g)
      }))
      .filter((g) => g.items.length > 0);
  }, [groupFilter]);

  // Degree map per resource
  const resDegreeMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of RES) map.set(r.id, 0);
    for (const e of allEdges) {
      map.set(e.res, (map.get(e.res) || 0) + 1);
    }
    return map;
  }, [allEdges]);

  const activeFocus = pinnedNode || hoveredNode;

  return (
    <div className={`cc-app ${theme}`}>
      <header className="cc-header">
        <h1>Bot Fleet Audit &amp; Access Map ({BOTS.length} Bots · {RES.length} Resources · {allEdges.length} Edges)</h1>
        <div>
          <button onClick={() => setActiveTab("graph")}>Access Graph</button>
          <button onClick={() => setActiveTab("bots")}>Bots ({BOTS.length})</button>
          <button onClick={() => setActiveTab("resources")}>Resources ({RES.length})</button>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>
      {/* Full UI also embedded directly inside index.html for instant zero-build execution */}
      <main data-focus={activeFocus ? `${activeFocus.type}:${activeFocus.id}` : "none"} data-groups={groupedResources.length} data-bots={graphBots.length} data-top-deg={resDegreeMap.size} />
    </div>
  );
}
