class CircleSlider {
    constructor(options) {
        this.defaultOptions = {
            //overridable options
            container: 'container',
            color: '#303030',
            minValue: 0,
            maxValue: 360,
            step: 1,
            radius: 24,
            label: 'New Label'
        };

        this.svgOptions = {
            width: 400,
            stroke: 20,
            dashStroke: '0.5%',
            strokeColor: 'black',
            circleBgOpacity: 0.1
        }

        this.options = Object.assign({}, this.defaultOptions, options);
        this.xmlns = 'http://www.w3.org/2000/svg';
        this.container = document.getElementById(this.options.container);

        // Check if container exists, if not create it
        if (!this.container) {
            console.log('No container found, creating one');
            var containerParent = document.getElementsByClassName('slidecontainer');
            var containerDiv = document.createElement('div');
            containerDiv.id = this.options.container;
            containerDiv.className = 'container';
            containerParent[0].appendChild(containerDiv);
        }

        const svgElementId = this.defaultOptions.container + '-slider';
        this.svgElem = document.getElementById(svgElementId);
        if (!this.svgElem) {
            this.svgElem = document.createElementNS(this.xmlns, 'svg');
            this.svgElem.setAttribute('id', svgElementId);
            this.svgElem.setAttribute('version', 1.1);
            this.svgElem.setAttribute('width', this.svgOptions.width);
            this.svgElem.setAttribute('height', this.svgOptions.width);
            this.svgElem.setAttribute('viewPort', `${this.svgOptions.width}, ${this.svgOptions.width}`);
            this.svgElem.style.margin = 'auto 0';
            this.container.appendChild(this.svgElem);
        }

        this.render();
    }

    render() {
        var circleSlider = document.createElementNS(this.xmlns, 'g');

        // Create circle
        var circleSliderBG = document.createElementNS(this.xmlns, 'circle');
        circleSliderBG.setAttribute('class', 'circle');
        circleSliderBG.setAttribute('cx', this.svgOptions.width / 2);
        circleSliderBG.setAttribute('cy', this.svgOptions.width / 2);
        circleSliderBG.setAttribute('r', this.options.radius);
        circleSliderBG.setAttribute('fill', 'none');
        circleSliderBG.style.strokeWidth = this.svgOptions.stroke;
        circleSliderBG.style.stroke = this.svgOptions.strokeColor;
        circleSliderBG.style.opacity = this.svgOptions.circleBgOpacity;
        circleSliderBG.setAttribute('stroke-dasharray', this.svgOptions.dashStroke);
        circleSlider.appendChild(circleSliderBG);
        this.svgElem.appendChild(circleSlider);
    }
}

new CircleSlider({
    container: 'circle-container',
    color: '#F3781C',
    minValue: 0,
    maxValue: 360,
    step: 1,
    radius: 70,
    label: 'Celtra Profit'
});
