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
class AnimatedCounter{static get ANIM_DISABLED(){return-1}static get ANIM_READY(){return 0}static get ANIM_ACTIVE(){return 1}static get ANIM_COMPLETE(){return 2}debug=!1;language="en-US";node=null;count=0;start=0;current=0;target=0;increment=1;limit=0;precision=0;duration=1500;state=-1;timestamp=0;formatter=null;constructor(t,e={}){var i=t.dataset.counter.split(":"),n=[i[0].indexOf("."),i[1].indexOf(".")],s=(this.node=t,this.start=(-1<i[0].indexOf(".")?parseFloat:parseInt)(i[0]),this.current=this.start,this.target=(-1<i[1].indexOf(".")?parseFloat:parseInt)(i[1]),this.duration=1e3*(void 0!==i[2]?parseFloat(i[2]):1.5),this.precision=-1<n[1]?i[1].length-n[1]-1:0,this.increment=20<this.target?1:10<this.target?.1:.01,this.animate=this.animate.bind(this),this.animateOnScroll=this.animateOnScroll.bind(this),"boolean"==typeof e.debug&&(this.debug=e.debug),"number"==typeof e.debug&&(this.debug=Boolean(e.debug)),"string"==typeof e.language&&(this.language=e.language),"number"==typeof e.limit&&(this.limit=e.limit),"number"==typeof e.precision&&(this.precision=e.precision),{style:"decimal",minimumFractionDigits:this.precision,maximumFractionDigits:this.precision});switch(i[3]){case"%":s.style="percent";break;case"$":s.style="currency",s.currency="USD";break;case"€":s.style="currency",s.currency="EUR";break;case"£":s.style="currency",s.currency="GBP";break;case"cad":s.style="currency",s.currency="CAD";break;case"eur":s.style="currency",s.currency="EUR";break;case"gbp":s.style="currency",s.currency="GBP";break;case"usd":s.style="currency",s.currency="USD";break;case"b":s.style="unit",s.unit="bit";break;case"B":s.style="unit",s.unit="byte";break;case"c":s.style="unit",s.unit="celsius";break;case"cm":s.style="unit",s.unit="centimeter";break;case"d":s.style="unit",s.unit="day";break;case"deg":s.style="unit",s.unit="degree";break;case"f":s.style="unit",s.unit="fahrenheit";break;case"foz":s.style="unit",s.unit="fluid-ounce";break;case"ft":s.style="unit",s.unit="foot";break;case"g":s.style="unit",s.unit="gram";break;case"gal":s.style="unit",s.unit="gallon";break;case"gb":s.style="unit",s.unit="gigabit";break;case"GB":s.style="unit",s.unit="gigabyte";break;case"h":s.style="unit",s.unit="hour";break;case"in":s.style="unit",s.unit="inch";break;case"kb":s.style="unit",s.unit="kilobit";break;case"KB":s.style="unit",s.unit="kilobyte";break;case"kg":s.style="unit",s.unit="kilogram";break;case"km":s.style="unit",s.unit="kilometer";break;case"l":s.style="unit",s.unit="liter";break;case"lb":s.style="unit",s.unit="pound";break;case"m":s.style="unit",s.unit="meter";break;case"mb":s.style="unit",s.unit="megabit";break;case"MB":s.style="unit",s.unit="megabyte";break;case"mi":s.style="unit",s.unit="mile";break;case"min":s.style="unit",s.unit="minute";break;case"ml":s.style="unit",s.unit="milliliter";break;case"mm":s.style="unit",s.unit="millimeter";break;case"μs":s.style="unit",s.unit="microsecond";break;case"ms":s.style="unit",s.unit="millisecond";break;case"ns":s.style="unit",s.unit="nanosecond";break;case"oz":s.style="unit",s.unit="ounce";break;case"pb":s.style="unit",s.unit="petabit";break;case"PB":s.style="unit",s.unit="petabyte";break;case"pct":s.style="unit",s.unit="percent";break;case"s":s.style="unit",s.unit="second";break;case"tb":s.style="unit",s.unit="terabit";break;case"TB":s.style="unit",s.unit="terabyte";break;case"yd":s.style="unit",s.unit="yard";break;case"yr":s.style="unit",s.unit="year";break;default:s.style="decimal"}this.formatter=new Intl.NumberFormat(this.language,s),this.enable(),this.debug&&console.log(this)}animate(t){var e;this.state!=AnimatedCounter.ANIM_DISABLED&&this.state!=AnimatedCounter.ANIM_COMPLETE&&(this.state==AnimatedCounter.ANIM_READY?(this.current=this.start,this.state=AnimatedCounter.ANIM_ACTIVE,this.timestamp=document.timeline.currentTime,requestAnimationFrame(this.animate),++this.count):(0<(t=t-this.timestamp)&&(e=t/this.duration,e=this.steps()*e,this.current=Math.round(e/this.increment)*this.increment,this.current=this.current>=this.target?this.target:this.current,t>this.duration&&(this.current=this.target),this.node.textContent=this.formatter.format(this.current)),this.current>=this.target?this.state=AnimatedCounter.ANIM_COMPLETE:requestAnimationFrame(this.animate)))}disable(){this.reset(),this.state=AnimatedCounter.ANIM_DISABLED,document.removeEventListener("scroll",this.animateOnScroll)}enable(){this.reset(),this.inView()&&this.animate(),document.addEventListener("scroll",this.animateOnScroll)}inView(){var t=this.node.getBoundingClientRect();const e=window.innerWidth,i=window.innerHeight;return Boolean(0!=t.width&&0!=t.height&&0<=t.top&&0<=t.left&&t.bottom<=i&&t.right<=e)}animateOnScroll(){!this.limit||this.count<this.limit?0==this.inView()?this.reset():this.state==AnimatedCounter.ANIM_READY&&this.animate():this.state!=AnimatedCounter.ANIM_ACTIVE&&this.disable()}reset(){this.timestamp=0,this.current=this.formatter.format(this.target),this.node.textContent=this.current,this.state=AnimatedCounter.ANIM_READY}steps(){return this.target-this.start/this.increment}}export{AnimatedCounter};