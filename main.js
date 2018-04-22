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

        this.mouseDownHandler = this.mouseDown.bind(this);
        this.mouseUpHandler = this.mouseUp.bind(this);
        this.mouseMoveHandler = this.mouseMove.bind(this);
        this.circleSvg.addEventListener('mousedown', this.mouseDownHandler);

       
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

        this.labelValue = document.createElement('p');
        this.labelValue.setAttribute('class', 'value');
        this.labelValue.innerHTML = this.options.minValue;
        labelDiv.appendChild(this.labelValue);
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
        const newPosition = this.getPointOnCirle(this.getRadians(newAngle === 360 ? newAngle-- : newAngle));
        this.slider.setAttribute('cx', newPosition.x);
        this.slider.setAttribute('cy', newPosition.y);
        this.arc.setAttribute('d', this.renderArc(0, 0, this.getRadians(newAngle)));
    }

    mouseDown(e) {
        window.addEventListener('mousemove', this.mouseMoveHandler);
        window.addEventListener('mouseup', this.mouseUpHandler);
        var coords = {
            x: e.clientX,
            y: e.clientY
        };

        this.moveSlider(this.getAngle(coords));
    }

    mouseUp(e) {
        window.removeEventListener('mousemove', this.mouseMoveHandler);
        window.removeEventListener('mouseup', this.mouseUpHandler);
        var coords = {
            x: e.clientX,
            y: e.clientY
        };
        this.moveSlider(this.getAngle(coords));
    }

    mouseMove(e) {
        var coords = {
            x: e.clientX,
            y: e.clientY
        };
        this.moveSlider(this.getAngle(coords));
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
        var stepValue = 0;
        var angleValue = 0;
        //throw error on bad step
        steps[0] = this.options.minValue; 
        for (var i = 0; i < maxNumberOfSteps; i++) {
            stepValue += this.options.step;
            angleValue += Math.round(angleStep);
            if (angleValue <= 360) {
                steps[angleValue] = stepValue;
            }
        }

        return {
            steps: steps,
            stepsArr: this.getStepsArr(),
            lastStepIndex: maxNumberOfSteps
        };
    }

    getStepsArr() {
        var range = this.options.maxValue - this.options.minValue;
        var maxNumberOfSteps = range / this.options.step;
        var stepsArr = [];
        var stepValue = 0;
        stepsArr.push(0);
        for (var i = 0; i < maxNumberOfSteps; i++) {
            stepValue += this.options.step;
            stepsArr.push(stepValue);
        }
        return stepsArr;
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
}

new CircleSlider({
    container: 'circle-container',
    color: '#F3781C',
    minValue: 0,
    maxValue: 720,
    step: 20,
    radius: 70,
    label: 'Celtra Profit'
});

new CircleSlider({
    container: 'circle-container',
    color: 'blue',
    minValue: 0,
    maxValue: 360,
    step: 1,
    radius: 150,
    label: 'Celtra Profit 2'
});

// new CircleSlider({
//     container: 'circle-container',
//     color: '#F3781C',
//     minValue: 0,
//     maxValue: 360,
//     step: 1,
//     radius: 80,
//     label: 'Celtra Profit 2'
// });

// new CircleSlider({
//     container: 'circle-container',
//     color: '#F3781C',
//     minValue: 0,
//     maxValue: 360,
//     step: 1,
//     radius: 120,
//     label: 'Celtra Profit 2'
// });
