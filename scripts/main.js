import { testMap, updateMap } from './charts/startermap.js';
import { drawContinentTimeline, updateContinentTimeline } from './charts/continentTimeline.js';
import { storyScenes } from './storyboard.js';
import { drawConstructorDominance } from './charts/constructorDominance.js';
import { drawConstructorNarrative, updateConstructorNarrative, updatePanelYear, clearAllMarkers} from './charts/narrativeConstructor.js';

const sceneById = new Map(storyScenes.map(scene => [scene.id, scene]));
const sceneByEra = new Map([
    ["f1-origins", "opening"],
    ["sponsorship-era", "sponsorship-era"],
    ["broadcast-fisa-foca", "broadcast-era"],
    ["global-expansion", "japan-entry"],
    ["commercial-boom", "commercial-growth"],
    ["ecclestone-era", "ecclestone-era"],
    ["new-markets-expansion", "new-markets-expansion"],
    ["modern-race-design", "night-race-era"],
    ["digital-era", "liberty-media-era"]
]);

const storyState = {
    sceneId: null,
    season: null
};

let scrollSyncFrame = null;

function clampYearValue(year) {
    const cleanYear = Number(year);

    if (!Number.isFinite(cleanYear)) return 1950;

    return Math.max(1950, Math.min(2024, cleanYear));
}

// for narrative constructor view 
function resetConstructorDetailViews() {
    document.querySelectorAll("#constructor-story .narrative-text-box").forEach(box => {
        if (box.dataset.originalContent) {
            box.innerHTML = box.dataset.originalContent;
            delete box.dataset.originalContent; 
        }
        clearAllMarkers();
    });
}

function seasonYear(year) {
    return Math.round(clampYearValue(year));
}

function sceneFromStep(stepElement) {
    const step = d3.select(stepElement);
    const sceneId = step.attr("data-scene");
    const scenePlan = sceneById.get(sceneId) ?? { id: sceneId };
    const startYear = +(step.attr("data-start-year") ?? scenePlan.startYear ?? scenePlan.endYear ?? 1950);
    const endYear = +(step.attr("data-end-year") ?? scenePlan.endYear ?? startYear);

    return {
        ...scenePlan,
        startYear,
        endYear,
        mapYear: startYear
    };
}

function yearInsideScene(sceneInfo, progress) {
    const startYear = sceneInfo.startYear ?? sceneInfo.mapYear ?? 1950;
    const endYear = sceneInfo.endYear ?? startYear;
    return clampYearValue(startYear + ((endYear - startYear) * progress));
}

function setActiveStep(sceneId) {
    d3.selectAll(".step")
        .classed("is-active", function() {
            return d3.select(this).attr("data-scene") === sceneId;
        });
}

function pageTop(element) {
    return element.getBoundingClientRect().top + window.scrollY;
}

function scrollDrivenScene() {
    const mapSteps = Array.from(document.querySelectorAll(".scroll__text .step:not(.step-map-complete)"));

    if (!mapSteps.length) return null;

    for (const step of mapSteps) {
        const top = pageTop(step);
        const bottom = top + step.offsetHeight;

        if (window.scrollY >= top && window.scrollY <= bottom) {
            return {
                sceneInfo: sceneFromStep(step),
                progress: (window.scrollY - top) / (bottom - top)
            };
        }
    }

    const firstStep = mapSteps[0];
    const lastStep = mapSteps[mapSteps.length - 1];

    if (window.scrollY < pageTop(firstStep)) {
        return {
            sceneInfo: sceneFromStep(firstStep),
            progress: 0
        };
    }

    return {
        sceneInfo: sceneFromStep(lastStep),
        progress: 1
    };
}

function updateStoryYear(sceneInfo, year, options = {}) {
    const timelineYear = clampYearValue(year);
    const cleanSeason = seasonYear(timelineYear);

    updateContinentTimeline({
        ...sceneInfo,
        mapYear: timelineYear,
        animate: options.animate === true
    });

    if (storyState.sceneId === sceneInfo.id && storyState.season === cleanSeason) {
        return;
    }

    storyState.sceneId = sceneInfo.id;
    storyState.season = cleanSeason;

    updateMap(cleanSeason, {
        animate: options.animate === true
    });
}

function syncStoryToScroll() {
    scrollSyncFrame = null;

    const scrollState = scrollDrivenScene();

    if (!scrollState) return;

    updateStoryYear(
        scrollState.sceneInfo,
        yearInsideScene(scrollState.sceneInfo, scrollState.progress)
    );
}

function requestStorySync() {
    if (scrollSyncFrame) return;

    scrollSyncFrame = window.requestAnimationFrame(syncStoryToScroll);
}

function startStoryScaffold() {
    // Start the map and timeline once, then let scroll events update their current era.
    testMap();
    drawContinentTimeline().catch(error => console.error("Timeline setup failed:", error));
    drawConstructorDominance().catch(error =>
  console.error("Constructor dominance setup failed:", error)
);
    drawConstructorNarrative().catch(error => console.error("Constructor narrative setup failed:", error));

    const scroller = scrollama();

    scroller
        .setup({
            step: ".scroll__text .step, #constructor-story .constructor-step",
            offset: 0.5,
            progress: true
        })
        // When user enters a new section
        .onStepEnter(response => {
            const element = response.element;
            const d3element = d3.select(element);

            //contains the timeline map
            if (element.closest("#scrolly-container")) {
                const sceneInfo = sceneFromStep(element);
                document.body.classList.remove("hide-map-story-card");
                setActiveStep(sceneInfo.id);
                requestStorySync();
            }
            //contains our controlled narrative 2
            else if (element.closest("#constructor-story")) {
                const panelIndex = +d3element.attr("data-panel");
                updateConstructorNarrative(panelIndex);
                resetConstructorDetailViews();

                d3.selectAll("#constructor-story .constructor-step")
                   .classed("is-active", false);
                d3.selectAll(".narrative-text-box").classed("is-active", false);
                d3element.classed("is-active", true)
                d3.select(`.narrative-text-box[data-panel="${panelIndex}"]`)
                    .classed("is-active", true);
            }
        })
        .onStepExit(response => {
            const { element, direction } = response;

            if (element.closest("#constructor-story")) {
                if (direction === "up") {
                    const prev = element.previousElementSibling;
                    //const year = +prev.dataset.year;
                    if (prev && prev.classList.contains("constructor-step")) {
                        resetConstructorDetailViews();
                        d3.selectAll("#constructor-story .constructor-step")
                            .classed("is-active", false);
                        d3.select(prev)
                            .classed("is-active", true);
                    }
                } else if (direction === "down" && !element.nextElementSibling) {
                d3.select(element).classed("is-active", false);
                }
            }
        });
    scroller.resize();
    window.addEventListener("scroll", requestStorySync, { passive: true });
    window.addEventListener("resize", () => {
        scroller.resize();
        requestStorySync();
    });
    window.addEventListener("f1-year-change", event => {
        const clickedYear = clampYearValue(event.detail.mapYear);
        const sceneId = sceneByEra.get(event.detail.activeEra) ?? "opening";
        const sceneInfo = {
            ...(sceneById.get(sceneId) ?? { id: sceneId }),
            mapYear: clickedYear
        };

        setActiveStep(sceneInfo.id);
        updateStoryYear(sceneInfo, clickedYear, {
            animate: event.detail.animate === true
        });
    });

    const postMapSection = document.querySelector(".post-map-story");

    if (postMapSection) {
        const hideMapCards = new IntersectionObserver(entries => {
            const [entry] = entries;
            document.body.classList.toggle("hide-map-story-card", entry.isIntersecting);
        }, {
            rootMargin: "0px"
        });

        hideMapCards.observe(postMapSection);
    }

    requestStorySync();
}

startStoryScaffold();
