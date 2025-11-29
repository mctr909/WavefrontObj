/// <reference path="math.js"/>
/// <reference path="drawer.js"/>

class ViewPad {
	static #COLOR_POS = Color.BLUE.transparent(0.5);
	static #COLOR_ROT = Color.GREEN.transparent(0.5).light(0.8);
	static #COLOR_TIL = Color.GRAY66.transparent(0.7);

	/** @type {Drawer} */
	#cv = null;
	#p = new vec(0, -15);
	#r = new vec(0, 0);
	#t = new vec(0, 0);
	#pDrag = false;
	#rDrag = false;
	#tDrag = false;
	#elevation = 0;
	#tilte = 0;

	position = [0, 0, 0];
	azimuth = 0;
	get elevation() { return this.#elevation; }
	get tilte() { return this.#tilte; }

	/**
	 * @param {string} id
	 * @param {number} width
	 * @param {number} height
	 */
	constructor(id, width, height) {
		this.#cv = new Drawer(id, width, height);
		this.#t = new vec(0, height/2 - 10);
		this.#draw();
	}

	setElevation(deg) {
		let rad = Math.PI * deg / 180;
		this.#elevation = rad;
		this.#r.y = this.#cv.Height * deg / 180;
		this.#draw();
	}

	setTilte(deg) {
		let rad = Math.PI * deg / 180;
		this.#tilte = rad;
		this.#t.x = -this.#cv.Width * deg / 180;
		this.#draw();
	}

	update() {
		if (this.#cv.IsDrag) {
			if (!(this.#tDrag || this.#rDrag) && this.#p.distance(this.#cv.Cursor) < 8) {
				this.#pDrag = true;
			}
			if (!(this.#tDrag || this.#pDrag) && this.#r.distance(this.#cv.Cursor) < 8) {
				this.#rDrag = true;
			}
			if (!(this.#rDrag || this.#pDrag) && this.#t.distance(this.#cv.Cursor) < 8) {
				this.#tDrag = true;
			}
		} else {
			this.#pDrag = false;
			this.#rDrag = false;
			this.#tDrag = false;
		}

		if (this.#pDrag) {
			if (this.#cv.PressRight) {
				this.#p.x = 0;
				this.#p.y = -15;
			} else {
				this.#p.setFrom(this.#cv.Cursor);
			}
			let x = this.#p.x;
			let y = this.#p.y;
			this.position = [x, y, 0];
		}

		if (this.#rDrag) {
			if (this.#cv.PressRight) {
				this.#r.x = 0;
				this.#r.y = this.#cv.Height / 4;
			} else {
				this.#r.setFrom(this.#cv.Cursor);
			}
			this.azimuth = 4 * Math.PI * this.#r.x / this.#cv.Width;
			let y = this.#r.y / this.#cv.Height;
			if (y < -0.5) {
				y = -0.5;
			} else if (y > 0.5) {
				y = 0.5;
			}
			this.#elevation = Math.PI * y;
		}

		if (this.#tDrag) {
			if (this.#cv.PressRight) {
				this.#t.x = 0;
			} else {
				this.#t.setFrom(this.#cv.Cursor);
			}
			this.#t.y = this.#cv.Height/2 - 10;
			this.#tilte = -Math.PI * this.#t.x / this.#cv.Width;
		}

		if (this.#pDrag || this.#rDrag || this.#tDrag) {
			this.#draw();
		}
	}

	#draw() {
		let l = this.#cv.Width/2;
		let r = -l;
		let t = this.#cv.Height/2;
		let b = -t;
		this.#cv.clear();
		this.#cv.drawLineXY(l, t, r, t, Color.BLACK, 2);
		this.#cv.drawLineXY(l, b, r, b, Color.BLACK, 2);
		this.#cv.drawLineXY(l, t, l, b, Color.BLACK, 2);
		this.#cv.drawLineXY(r, t, r, b, Color.BLACK, 2);
		this.#cv.drawLineXY(l, 0, r, 0, ViewPad.#COLOR_ROT, 2);
		this.#cv.drawLineXY(0, t, 0, b, ViewPad.#COLOR_ROT, 2);
		this.#cv.drawLineXY(l, this.#t.y, r, this.#t.y, ViewPad.#COLOR_TIL, 2);
		this.#cv.fillPie(this.#r, 8, ViewPad.#COLOR_ROT);
		this.#cv.fillPie(this.#p, 8, ViewPad.#COLOR_POS);
		this.#cv.fillPie(this.#t, 8, ViewPad.#COLOR_TIL);
	}
}
