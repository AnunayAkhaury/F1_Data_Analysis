export const storyScenes = [
    {
        id: "opening",
        title: "The question",
        mainGoal: "Introduce the central story: F1 expanded geographically, and that expansion frames later dominance eras.",
        activeView: "map",
        activeEra: "european-origins",
        transitionIdea: "Fade in the early map as the starting context."
    },
    {
        id: "europe-baseline",
        title: "European origins",
        mainGoal: "Show that early F1 was concentrated around European circuits.",
        activeView: "map",
        activeEra: "european-origins",
        transitionIdea: "Reveal only the early season locations before adding later circuits."
    },
    {
        id: "global-expansion",
        title: "Expansion beyond Europe",
        mainGoal: "Show F1 spreading into more continents and becoming a global calendar.",
        activeView: "map",
        activeEra: "early-global-reach",
        transitionIdea: "Add new race locations by year or decade with a simple filtering transition."
    },
    {
        id: "continent-summary",
        title: "Calendar becomes global",
        mainGoal: "Aggregate the circuit map into continent-level race counts or race share over time.",
        activeView: "continent-timeline",
        activeEra: "commercial-expansion",
        transitionIdea: "Move from individual geographic points to a time-based continent summary."
    },
    {
        id: "constructor-dominance",
        title: "Constructor eras",
        mainGoal: "Use the same timeline to show which teams dominated each competitive period.",
        activeView: "constructor-stream",
        activeEra: "modern-global-calendar",
        transitionIdea: "Keep the time axis stable so geography and constructor dominance feel connected."
    },
    {
        id: "driver-drilldown",
        title: "Drivers inside dominant teams",
        mainGoal: "Let the viewer inspect the drivers who explain a selected constructor era.",
        activeView: "driver-focus",
        activeEra: "modern-global-calendar",
        transitionIdea: "Drill down from a selected constructor band into driver-level detail."
    },
    {
        id: "open-exploration",
        title: "Open exploration",
        mainGoal: "Give users a final interactive stage after the guided story explains the views.",
        activeView: "linked-dashboard",
        activeEra: "modern-global-calendar",
        transitionIdea: "Switch from author-driven scenes into user-driven filtering and selection."
    }
];
