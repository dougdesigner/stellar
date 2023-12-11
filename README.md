# The 'Magnificent 7' in the Generative AI Era

The current growth in the S&P 500 is significantly influenced by the 'Magnificent 7' (Apple, Microsoft, Google, Amazon, NVIDIA, Tesla, and Meta). This has been fueled by foundational advancements across the Generative AI Stack, including purpose-built chips for generative AI and the ability of cloud providers to offer access to their scalable compute power. This project uses d3.js to build bespoke visualizations to better understand the 'Magnificent 7's and their role across the Generative AI Stack.

## Project Links
* [Live Site](https://ai.doug.design)
* [Github Repo](https://github.com/dougdesigner/stellar)
* [Screencast (Google Drive)](https://github.com/dougdesigner/stellar)
* [Screencast (Youtube)](https://github.com/dougdesigner/stellar)

## Project Overview
* Project d3.js Visualization Classes
    * `js/barvis.js` - Grouped Bar Chart
    * `js/donutvis.js` - Donut Chart
    * `js/doubleradialbarvis.js` - Double Radial Bar Chart
    * `js/linevis.js` - Stacked Line Chart
    * `js/microprocessorvis.js` - Bespoke Isometric Microprocessor Visualization
    * `js/neuralnetworkvis.js` - Neural Network Diagram
    * `js/scattervis.js` Scatter Plot with Comparative Trend Line
    * `js/stackedbarvis.js` - Stacked Bar Chart (Not Initialized)
    * `js/treevis.js` - Tree Diagram
* Project Data Files
    * `data/apple.csv` - Apple M Series Silicon Chip Data
    * `data/clouds.csv` - Cloud Infrastructure Provider Revenue, Market Share, and Growth Rates
    * `data/moore.csv`  - Moore's Law Data based on first CPU released in 1970
    * `data/nodes.json` - Neural Network Node Data
    * `data/stack.csv` - Generative AI Stack Knowledge Base
    * `data/transistors-cpu.csv` - CPU Transistor Data
    * `data/transistors-gpu.csv` - GPU Transistor Data
* Other Project Files
    * `index.html`
    * `css/style.css` - Custom Styles
    * `js/maind3.js` - Creates all d3.js Visualizations
* Libraries Used
    * [d3.js](https://d3js.org/)
    * [Tailwind CSS](https://tailwindcss.com/)
    * [Alpine.js](https://alpinejs.dev/)
    * [AOS.js](https://michalsnik.github.io/aos/)
    * [Pattern Fills](https://iros.github.io/patternfills/)

## Development Environment

* First, ensure that node.js & npm are both installed. If not, choose your OS and installation method from [this page](https://nodejs.org/en/download/package-manager/) and follow the instructions.
* Next, use your command line to enter the project directory.
* This website comes with a ready-to-use package file called `package.json`. You just need to run `npm install` to install all of the dependencies into the project.
* When `npm` has finished with the install, run `npm run build` to recompile the `style.css` file in the root directory.

You're ready to go! The most useful task for rapid development is `npm run dev`, which rebuilds the CSS every time you make a change in the HTML or JS files.


## Disclaimers

* This content is for academic purposes and not financial guidance. Do your due diligence before making investment decisions.

* I hold Amazon stock, which might influence my viewpoints in this project.

* As an Amazon employee, I clarify that the opinions and analyses here are my own and do not represent Amazon’s views. All information is sourced from public domains or reflects my own understanding of the technology.

* Latest market and chip technology data updated Q3 2023. Rapid industry advancements may lead to daily changes.