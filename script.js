function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}class Animation {
  // todo: optimize the no of elements according to the screen size
























  constructor(selector) {_defineProperty(this, "cols", 11);_defineProperty(this, "rows", 6);_defineProperty(this, "lineWidth", 40);_defineProperty(this, "spacingHorizontal", 80);_defineProperty(this, "spacingVertical", 80);_defineProperty(this, "strokeColor", getComputedStyle(document.documentElement).getPropertyValue('--lines'));_defineProperty(this, "strokeWidth", 2.35);_defineProperty(this, "svgMargin", 40);_defineProperty(this, "svgHeight", 0);_defineProperty(this, "svgWidth", 0);_defineProperty(this, "lines", []);_defineProperty(this, "screen", { width: window.innerWidth, height: window.innerHeight });_defineProperty(this, "mouse", { x: window.innerWidth / 2, y: window.innerHeight / 2 });_defineProperty(this, "mouseStored", Object.assign({}, this.mouse));
    this.svg = document.querySelector(selector);

    this.svgWidth = this.cols * this.lineWidth + 2 * this.svgMargin + (this.cols - 1) * this.spacingHorizontal;
    this.svgHeight = this.rows + 2 * this.svgMargin + (this.rows - 1) * this.spacingVertical;

    this.svg.setAttribute("viewBox", `0 0 ${this.svgWidth} ${this.svgHeight}`);
    this.svg.setAttribute("stroke-linecap", "square");

    this.addEventListeners();

    // Draw all the lines
    this.draw();
    // And animate them if the user is fine with it
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches ? this.animate() : null;
  }

  addEventListeners() {
    let self = this;
    // Don't redraw everything, only recalculate the centers of all arrows
    window.addEventListener("resize", function () {
      self.screen.width = window.innerWidth;
      self.screen.height = window.innerHeight;
      self.setLineCenters();
    });
  }

  getPercentage(partial, total) {
    return partial * 100 / total;
  }

  draw() {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.cols; j++) {
        // We're drawing the initial lines horizontally
        let c = new Line(
        this.svgMargin + j * this.lineWidth + j * this.spacingHorizontal,
        this.svgMargin + (j + 1) * this.lineWidth + j * this.spacingHorizontal,
        this.svgMargin + i * this.spacingVertical,
        this.svgMargin + i * this.spacingVertical,
        this.strokeColor,
        this.strokeWidth);


        // Set a transform origin and add the HTML element to the SVG
        const cElement = c.getElement();
        gsap.set(cElement, { transformOrigin: "50% 50%" });
        this.svg.appendChild(cElement);

        this.lines.push(cElement);
      }
    }

    this.setLineCenters();
  }

  setMouseCoords(event) {
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
  }

  setLineCenters() {
    this.lines.forEach(line => {
      // Get the center of the line
      // Instead of mapping svg coords to the screen position, get the position on the actual screen using boundingRect
      const boundingRect = line.getBoundingClientRect();
      line.center = {
        x: boundingRect.x + boundingRect.width / 2,
        y: boundingRect.y + boundingRect.height / 2 };

    });
  }

  animate() {
    const r = this.lineWidth / 2;

    // Rotate lines in a circular path
    // The slight delay will make it seem like the lines are floating in water
    gsap.registerPlugin(MotionPathPlugin);
    this.lines.forEach((line, i) => {
      gsap.to(line, {
        motionPath: {
          path: `M ${-r}, 0
							a ${r},${r} 0 1,0 ${r * 2},0
							a ${r},${r} 0 1,0 -${r * 2},0z` },

        duration: 15,
        delay: -0.055 * i,
        repeat: -1,
        ease: "none" });

    });

    // Listen for the mouse movements
    window.addEventListener("mousemove", this.setMouseCoords.bind(this));
    // And use the ticker to update the rotation accordingly
    gsap.ticker.add(this.setLineRotation.bind(this));
  }

  setLineRotation() {
    // Don't do anything if the cursor's position is the same as in the previous tick
    if (this.mouseStored.x === this.mouse.x && this.mouseStored.y === this.mouse.y) return;

    this.lines.forEach(line => {
      // Calculate the rotation, convert it to deg, and offset it to account for the lines' initial direction
      let angle = Math.atan2(this.mouse.x - line.center.x, -(this.mouse.y - line.center.y)) * (180 / Math.PI) - 90;
      let distance = Math.sqrt(Math.pow((line.center.x - this.mouse.x) / this.screen.width, 2) + Math.pow((line.center.y - this.mouse.y) / this.screen.height, 2));

      gsap.to(
      line,
      {
        // Use the shortest way to get to the destination angle
        rotation: angle + "_short",
        scaleX: 1.5 - distance,
        scaleY: this.strokeWidth - 1.55 * distance });


    });

    // Store the mouse position for the next tick
    this.mouseStored.x = this.mouse.x;
    this.mouseStored.y = this.mouse.y;
  }}


class Line {








  constructor(x1, x2, y1, y2, strokeColor, strokeWidth) {_defineProperty(this, "x1", void 0);_defineProperty(this, "x2", void 0);_defineProperty(this, "y1", void 0);_defineProperty(this, "y2", void 0);_defineProperty(this, "strokeColor", void 0);_defineProperty(this, "strokeWidth", void 0);_defineProperty(this, "element", void 0);
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
    this.strokeColor = strokeColor;
    this.strokeWidth = strokeWidth;
    this.element = document.createElementNS("http://www.w3.org/2000/svg", 'line');

    this.setElement();
  }

  getElement() {
    return this.element;
  }

  setElement(x1, x2, y1, y2, strokeColor, strokeWidth) {
    this.element.setAttribute("x1", x1 ? x1 : this.x1);
    this.element.setAttribute("x2", x2 ? x2 : this.x2);
    this.element.setAttribute("y1", y1 ? y1 : this.y1);
    this.element.setAttribute("y2", y2 ? y2 : this.y2);
    this.element.style.stroke = strokeColor ? strokeColor : this.strokeColor;
    this.element.style.strokeWidth = strokeWidth ? strokeWidth : this.strokeWidth;
  }}


const animation = new Animation("#animation");