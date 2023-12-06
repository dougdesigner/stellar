class CharTemplateClass {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.displayData = [];

        // Initialize visualization
        this.initVis();
    }

    initVis() {
        let vis = this;

      
        // Update chart with wrangled data
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

    }

}
