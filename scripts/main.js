// scripts/main.js
import { testMap, updateMap } from './charts/startermap.js';

function testTransition() {
    // call our testMap
    testMap();

    // try out scrollmama
    const scroller = scrollama();

    //scrolling setup
    scroller
        .setup({
            step: ".scroll__text .step", 
            offset: 0.5                  
        })
        //downward scrolling
         .onStepEnter(response => {
            d3.selectAll('.step').classed('is-active', false);
            d3.select(response.element).classed('is-active', true);
            
            // get data year from html file
            const currentYear = +d3.select(response.element).attr("data-year");
            updateMap(currentYear);
        })
        //upward scrolling
        .onStepExit(response => {
            // change map based on upward movement
            if (response.direction === "up") {
                const currentYear = +d3.select(response.element).attr("data-year");
                
                // hardcoded for testing
                if (currentYear === 1975) {
                    updateMap(1950);
                } else if (currentYear === 2026) {
                    updateMap(1975);
                }
            }
        });


    // calculate layout psoitioning
    scroller.resize();

    window.addEventListener("resize", scroller.resize);
}

testTransition();


