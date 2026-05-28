import { testMap, updateMap } from './charts/startermap.js';
import { storyScenes } from './storyboard.js';

function startStoryScaffold() {
    // Start the current map prototype. The later chart modules should attach to the empty panels in index.html.
    testMap();

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

            // Log the scene plan for now, so the storyboard can be tested before the real views are built.
            console.log("Current storyboard scene:", scenePlan);

            // Only map-focused scenes update the starter map. Later scenes will update other panels.
            if (mapYear) {
                updateMap(+mapYear);
            }
        })
        .onStepExit(response => {
            if (response.direction === "up") {
                const previousStep = response.element.previousElementSibling;

                if (previousStep) {
                    const previousYear = d3.select(previousStep).attr("data-map-year");

                    if (previousYear) {
                        updateMap(+previousYear);
                    }
                }
            }
        });

    scroller.resize();
    window.addEventListener("resize", scroller.resize);
}

startStoryScaffold();

