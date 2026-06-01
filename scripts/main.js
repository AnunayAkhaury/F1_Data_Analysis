import { testMap, updateMap } from './charts/startermap.js';
import { drawContinentTimeline, updateContinentTimeline } from './charts/continentTimeline.js';
import { storyScenes } from './storyboard.js';

function startStoryScaffold() {
    // Start the map and timeline once, then let scroll events update their current era.
    testMap();
    drawContinentTimeline().catch(error => console.error("Timeline setup failed:", error));

    const scroller = scrollama();

    scroller
        .setup({
            step: ".scroll__text .step", 
            offset: 0.5                  
        })
         .onStepEnter(response => {
            d3.selectAll('.step').classed('is-active', false);
            d3.select(response.element).classed('is-active', true);
            
            const activeStep = d3.select(response.element);
            const sceneId = activeStep.attr("data-scene");
            const mapYear = activeStep.attr("data-map-year");
            const scenePlan = storyScenes.find(scene => scene.id === sceneId);
            const sceneState = {
                ...(scenePlan ?? { id: sceneId }),
                mapYear: mapYear ? +mapYear : null
            };

            // Only map-focused scenes update the starter map. Later scenes will update other panels.
            if (mapYear) {
                updateMap(+mapYear);
            }

            updateContinentTimeline(sceneState);
        })
        .onStepExit(response => {
            if (response.direction === "up") {
                const previousStep = response.element.previousElementSibling;

                if (previousStep) {
                    const previousYear = d3.select(previousStep).attr("data-map-year");
                    const previousSceneId = d3.select(previousStep).attr("data-scene");
                    const previousScenePlan = storyScenes.find(scene => scene.id === previousSceneId);

                    if (previousYear) {
                        updateMap(+previousYear);
                    }

                    updateContinentTimeline({
                        ...(previousScenePlan ?? { id: previousSceneId }),
                        mapYear: previousYear ? +previousYear : null
                    });
                }
            }
        });

    scroller.resize();
    window.addEventListener("resize", scroller.resize);
    window.addEventListener("f1-era-change", event => {
        updateMap(event.detail.mapYear);
        updateContinentTimeline(event.detail);
    });

    const postMapSection = document.querySelector(".post-map-story");

    if (postMapSection) {
        const hideMapCards = new IntersectionObserver(entries => {
            const [entry] = entries;
            document.body.classList.toggle("hide-map-story-card", entry.isIntersecting);
        }, {
            rootMargin: "0px 0px -70% 0px"
        });

        hideMapCards.observe(postMapSection);
    }
}

startStoryScaffold();
