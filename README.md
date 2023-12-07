# The 'Magnificent 7' in the Generative AI Era

The current growth in the S&P 500 is significantly influenced by the 'Magnificent 7' (Apple, Microsoft, Google, Amazon, NVIDIA, Tesla, and Meta). This has been fueled by foundational advancements across the Generative AI Stack, including purpose-built chips for generative AI and the ability of cloud providers to offer access to their scalable compute power. This project uses d3.js to build bespoke visualiztions to better understand the 'Magnificent 7's and their role across the Generative AI Stack.

## Project Links
* [Live Site](https://ai.doug.design)
* [Github Repo](https://github.com/dougdesigner/stellar)
* [Screencast (Google Drive)](https://github.com/dougdesigner/stellar)
* [Screencast (Youtube)](https://github.com/dougdesigner/stellar)

## Project Overview
* Project D3 Visualization Classes
    * `js/barvis.js`
    * `js/customvis.js`
    * `js/donutvis.js`
    * `js/linevis.js`
    * `js/scattervis.js`
    * `js/stackedbarvis.js`
    * `js/treevis.js`
* Project Data Files
    * `data/apple.csv`
    * `data/clouds.csv`
    * `data/moore.csv`
    * `data/stack.csv`
    * `data/transistors-cpu.csv`
    * `data/transistors-gpu.csv`
* Other Project Files
    * `index.html`
    * `css/style.css`
    * `js/maind3.js`
* Libraries Used
    * [D3](https://d3js.org/)
    * [Tailwind CSS](https://tailwindcss.com/)
    * [Alpine.js](https://alpinejs.dev/)
    * [AOS.js](https://michalsnik.github.io/aos/)

## Development Environment

* First, ensure that node.js & npm are both installed. If not, choose your OS and installation method from [this page](https://nodejs.org/en/download/package-manager/) and follow the instructions.
* Next, use your command line to enter the project directory.
* This website comes with a ready-to-use package file called `package.json`. You just need to run `npm install` to install all of the dependencies into the project.
* When `npm` has finished with the install, run `npm run build` to recompile the `style.css` file in the root directory.

You're ready to go! The most useful task for rapid development is `npm run dev`, which rebuild the CSS every time you make a change in the HML or JS files.