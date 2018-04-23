
var sliders = [];
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
            strokeWidth: 20,
            dashStroke: '0.4%',
            strokeColor: 'black',
            circleBgOpacity: 0.1
        }

        this.sliderOptions = {
            fill: 'black',
            strokeColor: 'white',
            strokeWidth: 2
        }

        this.fillOptions = {
            // opacity: 0.6
        }

        this.options = Object.assign({}, this.defaultOptions, options);
        this.xmlns = 'http://www.w3.org/2000/svg';

        this.healthCheck();

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

        var circleSvgId = this.defaultOptions.container + '-slider';
        this.circleSvg = document.getElementById(circleSvgId);
        if (!this.circleSvg) {
            this.circleSvg = document.createElementNS(this.xmlns, 'svg');
            this.circleSvg.setAttribute('id', circleSvgId);
            this.circleSvg.setAttribute('version', 1.1);
            this.circleSvg.setAttribute('width', this.svgOptions.width);
            this.circleSvg.setAttribute('height', this.svgOptions.width);
            this.circleSvg.setAttribute('viewPort', `${this.svgOptions.width}, ${this.svgOptions.width}`);
            this.circleSvg.style.margin = 'auto 0';
            this.container.appendChild(this.circleSvg);
        }

        this.render();
    }

    render() {
        var circleSlider = document.createElementNS(this.xmlns, 'g');

        // Create circle
        this.circleSliderBG = document.createElementNS(this.xmlns, 'circle');
        this.circleSliderBG.setAttribute('class', 'circle');
        this.circleSliderBG.setAttribute('cx', this.svgOptions.width / 2);
        this.circleSliderBG.setAttribute('cy', this.svgOptions.width / 2);
        this.circleSliderBG.setAttribute('r', this.options.radius);
        this.circleSliderBG.setAttribute('fill', 'none');
        this.circleSliderBG.style.strokeWidth = this.svgOptions.strokeWidth;
        this.circleSliderBG.style.stroke = this.svgOptions.strokeColor;
        this.circleSliderBG.style.opacity = this.svgOptions.circleBgOpacity;
        this.circleSliderBG.setAttribute('stroke-dasharray', this.svgOptions.dashStroke);
        circleSlider.appendChild(this.circleSliderBG);
       
        var sliderCoordinates = this.getPointOnCirle(3 * Math.PI / 2);

        //create arc for coloring background
        this.arc = document.createElementNS(this.xmlns, 'path');
        this.arc.setAttribute(
            'd',
            this.renderArc(
                sliderCoordinates.x,
                sliderCoordinates.y,
                (3 * Math.PI / 2)
            )
        );
        this.arc.style.fill = 'none';
        this.arc.style.stroke = this.options.color;
        this.arc.style.strokeWidth = this.svgOptions.strokeWidth;
        this.arc.style.opacity = this.fillOptions.opacity;
        // this.arc.setAttribute('stroke-dasharray', this.svgOptions.dashStroke);
        circleSlider.appendChild(this.arc);

         // Create slider
        this.slider = document.createElementNS(this.xmlns, 'circle');
        this.slider.setAttribute('r', this.svgOptions.strokeWidth / 2);
        this.slider.setAttribute('cx', sliderCoordinates.x);
        this.slider.setAttribute('cy', sliderCoordinates.y);
        this.slider.style.fill = this.sliderOptions.fill;
        this.slider.style.stroke = this.sliderOptions.strokeColor;
        this.slider.style.strokeWidth = this.sliderOptions.strokeWidth;
        this.slider.style.cursor = 'pointer';
        circleSlider.appendChild(this.slider);

        

        this.circleSvg.appendChild(circleSlider);

        //create label
        var labelParent = document.getElementsByClassName('labelscontainer');
        var labelDiv = document.createElement('div');
        labelDiv.className = 'label';
        labelParent[0].appendChild(labelDiv);

        var labelText = document.createElement('p');
        labelText.setAttribute('class', 'text');
        labelText.innerHTML = this.options.label;
        labelDiv.appendChild(labelText);

        var labelColor = document.createElement('div');
        labelColor.setAttribute('class', 'label-color');
        labelColor.style.backgroundColor = this.options.color;
        labelDiv.appendChild(labelColor);

        this.labelValue = document.createElement('p');
        this.labelValue.setAttribute('class', 'value');
        this.labelValue.innerHTML = this.options.minValue;
        labelDiv.appendChild(this.labelValue);


        //create and add event listeners
        this.mouseDownHandler = this.mouseDown.bind(this);
        this.mouseUpHandler = this.mouseUp.bind(this);
        this.mouseMoveHandler = this.mouseMove.bind(this);
        this.slider.addEventListener('mousedown', this.mouseDownHandler);
        this.slider.addEventListener('touchstart', this.mouseDownHandler)
    }

    getPointOnCirle(angle) {
        return {
            x: Math.cos(angle) * this.options.radius + this.svgOptions.width / 2,
            y: Math.sin(angle) * this.options.radius + this.svgOptions.width / 2
        };
    }

    moveSlider(angle) {
        // console.log(this.getDegrees(angle));
        var stepsObj = this.getStepsInfo();
        var deg = this.getDegrees(angle);
        var newAngle = this.getClosestStepAngle(deg, stepsObj.stepsArr)
        this.updateLabelValue(stepsObj.steps[newAngle]);
        //check if last step, reduce angle by a bit soo you have a 100% effect
        // TODO check for 0 step
        const newPosition = this.getPointOnCirle(this.getRadians(newAngle === 360 ? newAngle-- : newAngle));
        this.slider.setAttribute('cx', newPosition.x);
        this.slider.setAttribute('cy', newPosition.y);
        this.arc.setAttribute('d', this.renderArc(0, 0, this.getRadians(newAngle)));
    }

    mouseDown(e) {
        window.addEventListener('mousemove', this.mouseMoveHandler);
        window.addEventListener('touchmove', this.mouseMoveHandler);
        window.addEventListener('mouseup', this.mouseUpHandler);
        window.addEventListener('touchend', this.mouseUpHandler);

        this.moveSlider(this.getAngle(this.getClientCoords(e)));
    }

    mouseUp(e) {
        window.removeEventListener('mousemove', this.mouseMoveHandler);
        window.removeEventListener('touchmove', this.mouseMoveHandler);
        window.removeEventListener('mouseup', this.mouseUpHandler);
        window.removeEventListener('touchend', this.mouseUpHandler);

        this.moveSlider(this.getAngle(this.getClientCoords(e)));
    }

    mouseMove(e) {
        this.moveSlider(this.getAngle(this.getClientCoords(e)));
    }

    getClientCoords(e) {
        var coords = { x: 0, y: 0 };
        if (event.type == 'touchstart' || event.type == 'touchmove' || event.type == 'touchend') {
            var touch = event.touches[0] || event.changedTouches[0];
            coords.x = touch.clientX;
            coords.y = touch.clientY;
        } else if (event.type == 'mousedown' || event.type == 'mouseup' || event.type == 'mousemove') {
            coords.x = event.clientX;
            coords.y = event.clientY;
        }
        return coords;
    }

    getAngle(coords) {
        const rectangle = this.circleSliderBG.getBoundingClientRect();
        var centerX = rectangle.x + (rectangle.width / 2);
        var centerY = rectangle.y + (rectangle.height / 2);
        var atan = -Math.atan2(coords.x-centerX, coords.y-centerY) + Math.PI / 2;
        return atan;
    }

    getDegrees(angle) {
        return angle/(Math.PI/180) + 90;
    }

    getRadians(angle) {
        return angle * (Math.PI / 180) - Math.PI / 2;
    }

    updateLabelValue(newValue) {
        this.labelValue.innerHTML = Math.round(newValue);
    }

    getStepsInfo() {
        var range = this.options.maxValue - this.options.minValue;
        var maxNumberOfSteps = range / this.options.step;
        var angleStep = 360 / maxNumberOfSteps;
        var steps = {};
        var stepsArr = [];
        var stepValue = 0;
        var angleValue = 0;
        //throw error on bad step
        steps[0] = this.options.minValue; 
        for (var i = 0; i < maxNumberOfSteps; i++) {
            stepValue += this.options.step;
            angleValue += angleStep;
            //accounting for js bad float calculation :)
            if (angleValue <= 361) {
                steps[parseInt(angleValue)] = stepValue;
                stepsArr.push(parseInt(angleValue));
            }
        }

        return {
            steps: steps,
            stepsArr: stepsArr,
            lastStepIndex: maxNumberOfSteps
        };
    }

    //could be improved since the list is sorted
    getClosestStepAngle(num, arr) {
        var curr = arr[0];
        var diff = Math.abs(num - curr);
        for (var val = 0; val < arr.length; val++) {
            var newdiff = Math.abs(num - arr[val]);
            if (newdiff < diff) {
                diff = newdiff;
                curr = arr[val];
            }
        }
        return curr;
    }

    //https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
    renderArc(x, y, endAngle) {
        const start = this.getPointOnCirle(endAngle);
        const end = this.getPointOnCirle(3 * Math.PI / 2);
        const largeArcFlag = endAngle <= (Math.PI / 2) ? '0' : '1';

        const d = [
            'M', start.x, start.y,
            'A', this.options.radius, this.options.radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(' ');

        return d;  
    }

    healthCheck() {
        if (this.options.label === undefined) throw new Error('Label is not defined');
        if (this.options.color === undefined) throw new Error('[' + this.options.label + ']:Color is not defined');
        if (!this.checkColor()) throw new Error('[' + this.options.label + ']:String does not represent color (hex or actual color value) check supported values (https://www.w3schools.com/colors/colors_names.asp)');
        if (this.options.minValue === undefined || Number.isNaN(this.options.minValue)) throw new Error('[' + this.options.label + ']:minValue is not defined correctly, expecting number got: ' + this.options.minValue);
        if (this.options.maxValue === undefined || Number.isNaN(this.options.maxValue)) throw new Error('[' + this.options.label + ']:maxValue is not defined correctly, expecting number got: ' + this.options.maxValue);
        if (this.options.step === undefined || Number.isNaN(this.options.step)) throw new Error('[' + this.options.label + ']:Step is not defined correctly, expecting number got: ' + this.options.step);
        if (this.options.radius === undefined || Number.isNaN(this.options.radius)) throw new Error('[' + this.options.label + ']:Step is not defined correctly, expecting number got: ' + this.options.radius);
        if (this.options.minValue >= this.options.maxValue) throw new Error('[' + this.options.label + ']:maxValue (' + this.options.maxValue + ') must not be bigger then minValue (' + this.options.minValue + ')!');
        if (this.checkStepValidity()) throw new Error('[' + this.options.label + ']:Step value is not valid');
        if (this.checkRadiusSize()) throw new Error('[' + this.options.label + ']:Radius value is not valid');
        sliders.push(this.options);
    }

    checkStepValidity() {
        var range = this.options.maxValue - this.options.minValue;
        var maxNumberOfSteps = range / this.options.step;
        var delta = range % maxNumberOfSteps;

        if (delta === 0) {
            return false;
        } else {
            return true;
        }
    }

    checkColor() {
        var color2 = "";
        var result = true;
        var e = document.getElementById('testdiv');
        e.style.borderColor = "";
        e.style.borderColor = this.options.color;
        color2 = e.style.borderColor;
        if (color2.length == 0) { result = false; }
        e.style.borderColor = "";
        return result;
    }

    checkRadiusSize() {
        if (sliders.length === 0) {
            return false;
        }
        for (var slider in sliders) {
            var r = sliders[slider].radius;
            var low = r - this.svgOptions.strokeWidth;
            var max = r + this.svgOptions.strokeWidth;
            var cont = sliders[slider].container;

            if (this.options.radius >= low && this.options.radius <= max && this.options.container === cont) {
                return true;
            }
        }

        return false;
    }
}

new CircleSlider({
    container: 'circle-container',
    color: '#F3781C',
    minValue: 0,
    maxValue: 720,
    step: 20,
    radius: 70,
    label: 'Profit'
});

new CircleSlider({
    container: 'circle-container',
    color: 'blue',
    minValue: 0,
    maxValue: 123,
    step: 1,
    radius: 100,
    label: 'Profit 2'
});

new CircleSlider({
    container: 'circle-container',
    color: 'red',
    minValue: 20,
    maxValue: 360,
    step: 10,
    radius: 150,
    label: 'Profit 3'
});

// new CircleSlider({
//     container: 'circle-container',
//     color: '#F3781C',
//     minValue: 0,
//     maxValue: 360,
//     step: 1,
//     radius: 120,
//     label: 'Celtra Profit 2'
// });
