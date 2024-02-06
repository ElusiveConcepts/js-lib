/**
 * An animated counter class that takes any HTML Element with a properly
 * formatted data-counter attribute and animates the number contained within,
 * incrementing from a specified start value to a target value.
 *
 * The animation only runs when the element is visible in the viewport and can
 * be limited to run a set number of times, or run anytime the element scrolls
 * into view.
 *
 * @author Roger Soucy <roger.soucy@elusive-concepts.com >
 * @copyright (c) 2024 Elusive Concepts, LLC.
 *
 * @license
 * Copyright (c) 2024 Elusive Concepts, LLC.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @class Creates a new AnimatedCounter object
 *
 * @version 1.0
 *
 * @module modules/animations/AnimatedCounter
 *
 * @uses Intl.NumberFormat number formatter used for output
 *
 * @example const counter = new AnimatedCounter(el);
 */
export class AnimatedCounter
{
	/** Class Constants */
	static get ANIM_DISABLED() { return -1; }
	static get ANIM_READY()    { return  0; }
	static get ANIM_ACTIVE()   { return  1; }
	static get ANIM_COMPLETE() { return  2; }

	/** @type {Boolean} set to true to enable debugging output */
	debug = false;

	/** @type {String} ISO Language code for the number formatter */
	language = 'en-US';

	/** @type {HTMLElement} counter html element */
	node = null;

	/** @type {Number} number of times the animation has run */
	count = 0;

	/** @type {Number} counter starting value */
	start = 0;

	/** @type {Number} counter current value */
	current = 0;

	/** @type {Number} counter target value */
	target = 0;

	/** @type {Number} minimum increment value */
	increment = 1;

	/** @type {Number} limit the number of times to run, 0 = always run */
	limit = 0;

	/** @type {Number} floating point precision of target */
	precision = 0;

	/** @type {Number} animation duration */
	duration = 1500; // 1.5 seconds

	/** @type {Number} current animation state */
	state = -1;

	/** @type {Number} animation start/zero time */
	timestamp = 0;

	/** @type {Intl.NumberFormat} number formatter */
	formatter = null;

	/**
	 * Set up a Counter object for animations
	 * - expects an html element with a data-counter attribute with the
	 * - following format: [start value]:[target value]:[duration]:[format]
	 * - where:
	 * -    [start value]  = number to begin the counter animation at, e.g., 0
	 * -    [target value] = number to end the counter animation at, e.g., 1000
	 * -    [duration]     = total time of the animation in seconds, e.g, 1.5
	 * -    [format]       = a symbol or abbreviation for units or currency
	 *
	 * @param {HTMLElement} element html element with a data-counter attribute
	 * @param {Object}      opts    optional collection of named settings
	 */
	constructor(element, opts = {})
	{
		let data = element.dataset.counter.split(':'); // start:target:duration
		let dots = [ data[0].indexOf('.'), data[1].indexOf('.') ];

		this.node      = element;
		this.start     = (data[0].indexOf('.') > -1) ? parseFloat(data[0]) : parseInt(data[0]);
		this.current   = this.start;
		this.target    = (data[1].indexOf('.') > -1) ? parseFloat(data[1]) : parseInt(data[1]);
		this.duration  = 1000 * ((typeof data[2] != 'undefined') ? parseFloat(data[2]) : 1.5);
		this.precision = (dots[1] > -1) ? data[1].length - dots[1] - 1 : 0;

		// adjust minimum increment value to give small numbers more animation steps
		this.increment = (this.target > 20) ? 1 : (this.target > 10) ? 0.1 : 0.01;

		// bind {this} context for callbacks
		this.animate         = this.animate.bind(this);
		this.animateOnScroll = this.animateOnScroll.bind(this);

		// set options only if valid
		if(typeof opts.debug == 'boolean')    { this.debug = opts.debug; }
		if(typeof opts.debug == 'number')     { this.debug = Boolean(opts.debug); }
		if(typeof opts.language == 'string')  { this.language = opts.language; }
		if(typeof opts.limit == 'number')     { this.limit = opts.limit; }
		if(typeof opts.precision == 'number') { this.precision = opts.precision; }

		// configure Intl.NumberFormat options
		let format = {
			'style': 'decimal',
			'minimumFractionDigits': this.precision,
			'maximumFractionDigits': this.precision,
		};

		// Set the type of number for the formatter
		switch(data[3])
		{
			// Percent:
			//   Note - value is multiplied by 100
			//        - to avoid this, use pct instead
			case '%': format.style = 'percent'; break;

			// Currency:
			case '$':   format.style = 'currency'; format.currency = 'USD'; break;
			case '€':   format.style = 'currency'; format.currency = 'EUR'; break;
			case '£':   format.style = 'currency'; format.currency = 'GBP'; break;
			case 'cad': format.style = 'currency'; format.currency = 'CAD'; break;
			case 'eur': format.style = 'currency'; format.currency = 'EUR'; break;
			case 'gbp': format.style = 'currency'; format.currency = 'GBP'; break;
			case 'usd': format.style = 'currency'; format.currency = 'USD'; break;

			// Units:
			//   Note - beware the difference between bits (lowercase)
			//        - and bytes (uppercase)
			case 'b':   format.style = 'unit'; format.unit = 'bit'; break;
			case 'B':   format.style = 'unit'; format.unit = 'byte'; break;
			case 'c':   format.style = 'unit'; format.unit = 'celsius'; break;
			case 'cm':  format.style = 'unit'; format.unit = 'centimeter'; break;
			case 'd':   format.style = 'unit'; format.unit = 'day'; break;
			case 'deg': format.style = 'unit'; format.unit = 'degree'; break;
			case 'f':   format.style = 'unit'; format.unit = 'fahrenheit'; break;
			case 'foz': format.style = 'unit'; format.unit = 'fluid-ounce'; break;
			case 'ft':  format.style = 'unit'; format.unit = 'foot'; break;
			case 'g':   format.style = 'unit'; format.unit = 'gram'; break;
			case 'gal': format.style = 'unit'; format.unit = 'gallon'; break;
			case 'gb':  format.style = 'unit'; format.unit = 'gigabit'; break;
			case 'GB':  format.style = 'unit'; format.unit = 'gigabyte'; break;
			case 'h':   format.style = 'unit'; format.unit = 'hour'; break;
			case 'in':  format.style = 'unit'; format.unit = 'inch'; break;
			case 'kb':  format.style = 'unit'; format.unit = 'kilobit'; break;
			case 'KB':  format.style = 'unit'; format.unit = 'kilobyte'; break;
			case 'kg':  format.style = 'unit'; format.unit = 'kilogram'; break;
			case 'km':  format.style = 'unit'; format.unit = 'kilometer'; break;
			case 'l':   format.style = 'unit'; format.unit = 'liter'; break;
			case 'lb':  format.style = 'unit'; format.unit = 'pound'; break;
			case 'm':   format.style = 'unit'; format.unit = 'meter'; break;
			case 'mb':  format.style = 'unit'; format.unit = 'megabit'; break;
			case 'MB':  format.style = 'unit'; format.unit = 'megabyte'; break;
			case 'mi':  format.style = 'unit'; format.unit = 'mile'; break;
			case 'min': format.style = 'unit'; format.unit = 'minute'; break;
			case 'ml':  format.style = 'unit'; format.unit = 'milliliter'; break;
			case 'mm':  format.style = 'unit'; format.unit = 'millimeter'; break;
			case 'μs':  format.style = 'unit'; format.unit = 'microsecond'; break;
			case 'ms':  format.style = 'unit'; format.unit = 'millisecond'; break;
			case 'ns':  format.style = 'unit'; format.unit = 'nanosecond'; break;
			case 'oz':  format.style = 'unit'; format.unit = 'ounce'; break;
			case 'pb':  format.style = 'unit'; format.unit = 'petabit'; break;
			case 'PB':  format.style = 'unit'; format.unit = 'petabyte'; break;
			case 'pct': format.style = 'unit'; format.unit = 'percent'; break;
			case 's':   format.style = 'unit'; format.unit = 'second'; break;
			case 'tb':  format.style = 'unit'; format.unit = 'terabit'; break;
			case 'TB':  format.style = 'unit'; format.unit = 'terabyte'; break;
			case 'yd':  format.style = 'unit'; format.unit = 'yard'; break;
			case 'yr':  format.style = 'unit'; format.unit = 'year'; break;

			// Everything else
			default: format.style = 'decimal';
		}

		this.formatter = new Intl.NumberFormat(this.language, format);

		// signal that we're ready for animation
		this.enable();

		if(this.debug) { console.log(this); }
	}

	/**
	 * Animate the counter
	 *
	 * @param {Number} timestamp animationframe timestamp
	 */
	animate(timestamp)
	{
		if(this.state == AnimatedCounter.ANIM_DISABLED) { return; }
		if(this.state == AnimatedCounter.ANIM_COMPLETE) { return; }

		// set up the animation
		if(this.state == AnimatedCounter.ANIM_READY)
		{
			this.current   = this.start; // just in case it changed
			this.state     = AnimatedCounter.ANIM_ACTIVE;
			this.timestamp = document.timeline.currentTime;
			requestAnimationFrame(this.animate);
			++this.count;
			return;
		}

		const elapsed = timestamp - this.timestamp; 

		if(elapsed > 0)
		{
			// calculate how many steps to increment for the current frame, if any
			const percent_complete = elapsed / this.duration;
			const steps_complete   = this.steps() * percent_complete;

			// convert to nearest increment value
			this.current = Math.round(steps_complete / this.increment) * this.increment;

			// clamp the result to the target
			// ! don't use Math.max (e.g. target may be an int, so we drop the decimals)
			this.current = this.current >= this.target ? this.target : this.current;

			if(elapsed > this.duration) { this.current = this.target; }

			this.node.textContent = this.formatter.format(this.current);
		}

		// if it's done, stop the animation
		if(this.current >= this.target)
		{
			this.state = AnimatedCounter.ANIM_COMPLETE;
		}

		// otherwise, continue the animation
		else { requestAnimationFrame(this.animate); }
	}

	/**
	 * Disable animations and return the node to its default setting.
	 */
	disable()
	{
		this.reset();
		this.state = AnimatedCounter.ANIM_DISABLED;
		document.removeEventListener('scroll', this.animateOnScroll);
	}

	/**
	 * Enable animations and return the node to its default setting.
	 */
	enable()
	{
		this.reset();
		if(this.inView()) { this.animate(); }
		document.addEventListener('scroll', this.animateOnScroll);
	}

	/**
	 * Check if the counter node is visible in the viewport
	 *
	 * @return {Boolean}
	 */
	inView()
	{
		const r = this.node.getBoundingClientRect();
		const v = { 'w': window.innerWidth, 'h': window.innerHeight };

		return Boolean(
			r.width  != 0   && r.height != 0 &&
			r.top    >= 0   && r.left   >= 0 &&
			r.bottom <= v.h && r.right  <= v.w
		);
	}

	/**
	 * Scroll Event handler, will animate counter if it scrolls into view
	 */
	animateOnScroll()
	{
		if(!this.limit || this.count < this.limit)
		{
			if(this.inView() == false) { this.reset(); }
			else if(this.state == AnimatedCounter.ANIM_READY) { this.animate(); }
		}

		// disable the animations if we're over the limit and not animating
		else if(this.state != AnimatedCounter.ANIM_ACTIVE)
		{
			this.disable();
		}
	}

	/**
	 * Reset the counter
	 */
	reset()
	{
		this.timestamp = 0;
		this.current = this.formatter.format(this.target); // set to max off screen for crawlers, etc.
		this.node.textContent = this.current;
		this.state = AnimatedCounter.ANIM_READY;
	}

	/**
	 * Get the number of increment steps based on the minimum increment
	 *
	 * @return {Number}
	 */
	steps()
	{
		return this.target - this.start / this.increment;
	}
};