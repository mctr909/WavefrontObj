/**
 * ベクトル
 */
class vec {
	/** @type {number} */
	x;
	/** @type {number} */
	y;
	/** @type {number} */
	z;

	constructor(x=0, y=0, z=0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	/**
	 * 値を設定します
	 * @param {vec} src 設定元
	 */
	setFrom(src) {
		this.x = src.x;
		this.y = src.y;
		this.z = src.z;
	}

	/**
	 * 規格化した結果を返します
	 * @param {number} scale スケール
	 * @returns {vec}
	 */
	normalize(scale=1) {
		let k = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
		if (k) {
			k = scale / k;
		}
		return new vec(this.x*k, this.y*k, this.z*k);
	}

	/**
	 * スカラー倍した結果を返します
	 * @param {number} k スカラー
	 * @returns {vec}
	 */
	scale(k) {
		return new vec(this.x*k, this.y*k, this.z*k);
	}

	/**
	 * 自身＋ベクトルvの結果(ベクトルの和)を返します
	 * @param {vec} v ベクトルv
	 * @returns {vec}
	 */
	add(v) {
		return new vec(
			this.x + v.x,
			this.y + v.y,
			this.z + v.z
		);
	}

	/**
	 * 自身ーベクトルvの結果(ベクトルの差)を返します
	 * @param {vec} v ベクトルv
	 * @returns {vec}
	 */
	sub(v) {
		return new vec(
			this.x - v.x,
			this.y - v.y,
			this.z - v.z
		);
	}

	/**
	 * 自身✕ベクトルvの結果(クロス積)を返します
	 * @param {vec} v ベクトルv
	 * @returns {vec}
	 */
	cross(v) {
		return new vec(
			this.y*v.z - this.z*v.y,
			this.z*v.x - this.x*v.z,
			this.x*v.y - this.y*v.x
		);
	}

	/**
	 * 自身・ベクトルvの結果(内積)を返します
	 * @param {vec} v ベクトルv
	 * @returns {number}
	 */
	dot(v) {
		return this.x*v.x + this.y*v.y + this.z*v.z;
	}

	/**
	 * 自身と点Pとの距離を返します
	 * @param {vec} p 点P
	 * @returns {number}
	 */
	distance(p) {
		let x = p.x - this.x;
		let y = p.y - this.y;
		let z = p.z - this.z;
		return Math.sqrt(x*x + y*y + z*z);
	}
}

/**
 * 4x4行列
 */
class mat4 {
	#array = new Float32Array(16);

	get Array() { return this.#array; }

	/**
	 * 値を設定します
	 * @param  {...number} values 値
	 */
	set(...values) {
		let d = this.#array;
		d[0] = values[0];
		d[1] = values[1];
		d[2] = values[2];
		d[3] = values[3];

		d[4] = values[4];
		d[5] = values[5];
		d[6] = values[6];
		d[7] = values[7];

		d[8]  = values[8];
		d[9]  = values[9];
		d[10] = values[10];
		d[11] = values[11];

		d[12] = values[12];
		d[13] = values[13];
		d[14] = values[14];
		d[15] = values[15];
	}

	/**
	 * 値を設定します
	 * @param {mat4} src 設定元
	 */
	setFrom(src) {
		let s = src.#array;
		let d = this.#array;
		d[0] = s[0];
		d[1] = s[1];
		d[2] = s[2];
		d[3] = s[3];

		d[4] = s[4];
		d[5] = s[5];
		d[6] = s[6];
		d[7] = s[7];

		d[8]  = s[8];
		d[9]  = s[9];
		d[10] = s[10];
		d[11] = s[11];

		d[12] = s[12];
		d[13] = s[13];
		d[14] = s[14];
		d[15] = s[15];
	}

	/**
	 * 単位行列として設定します
	 */
	setIdentity() {
		let d = this.#array;
		d[0]  = 1; d[1]  = 0; d[2]  = 0; d[3]  = 0;
		d[4]  = 0; d[5]  = 1; d[6]  = 0; d[7]  = 0;
		d[8]  = 0; d[9]  = 0; d[10] = 1; d[11] = 0;
		d[12] = 0; d[13] = 0; d[14] = 0; d[15] = 1;
	}

	/**
	 * 行列Aをベクトルvで指定した量で平行移動させた結果を設定します
	 * @param {mat4} ma 行列A
	 * @param {vec} v ベクトルv
	 */
	setTranslate(ma, v) {
		let a = ma.#array;
		let d = this.#array;
		let t41 = a[0] * v.x + a[4] * v.y + a[8]  * v.z + a[12];
		let t42 = a[1] * v.x + a[5] * v.y + a[9]  * v.z + a[13];
		let t43 = a[2] * v.x + a[6] * v.y + a[10] * v.z + a[14];
		let t44 = a[3] * v.x + a[7] * v.y + a[11] * v.z + a[15];

		d[0] = a[0];
		d[1] = a[1];
		d[2] = a[2];
		d[3] = a[3];

		d[4] = a[4];
		d[5] = a[5];
		d[6] = a[6];
		d[7] = a[7];

		d[8]  = a[8];
		d[9]  = a[9];
		d[10] = a[10];
		d[11] = a[11];

		d[12] = t41;
		d[13] = t42;
		d[14] = t43;
		d[15] = t44;
	}

	/**
	 * 行列Aと行列Bの積を設定します
	 * @param {mat4} ma 行列A
	 * @param {mat4} mb 行列B
	 */
	setMul(ma, mb) {
		let a = ma.#array;
		let a11 = a[0],  a12 = a[1],  a13 = a[2],  a14 = a[3],
			a21 = a[4],  a22 = a[5],  a23 = a[6],  a24 = a[7],
			a31 = a[8],  a32 = a[9],  a33 = a[10], a34 = a[11],
			a41 = a[12], a42 = a[13], a43 = a[14], a44 = a[15]
		;
		let b = mb.#array;
		let b11 = b[0],  b12 = b[1],  b13 = b[2],  b14 = b[3],
			b21 = b[4],  b22 = b[5],  b23 = b[6],  b24 = b[7],
			b31 = b[8],  b32 = b[9],  b33 = b[10], b34 = b[11],
			b41 = b[12], b42 = b[13], b43 = b[14], b44 = b[15]
		;
		let d = this.#array;
		d[0]  = a11 * b11 + a21 * b12 + a31 * b13 + a41 * b14;
		d[1]  = a12 * b11 + a22 * b12 + a32 * b13 + a42 * b14;
		d[2]  = a13 * b11 + a23 * b12 + a33 * b13 + a43 * b14;
		d[3]  = a14 * b11 + a24 * b12 + a34 * b13 + a44 * b14;
		d[4]  = a11 * b21 + a21 * b22 + a31 * b23 + a41 * b24;
		d[5]  = a12 * b21 + a22 * b22 + a32 * b23 + a42 * b24;
		d[6]  = a13 * b21 + a23 * b22 + a33 * b23 + a43 * b24;
		d[7]  = a14 * b21 + a24 * b22 + a34 * b23 + a44 * b24;
		d[8]  = a11 * b31 + a21 * b32 + a31 * b33 + a41 * b34;
		d[9]  = a12 * b31 + a22 * b32 + a32 * b33 + a42 * b34;
		d[10] = a13 * b31 + a23 * b32 + a33 * b33 + a43 * b34;
		d[11] = a14 * b31 + a24 * b32 + a34 * b33 + a44 * b34;
		d[12] = a11 * b41 + a21 * b42 + a31 * b43 + a41 * b44;
		d[13] = a12 * b41 + a22 * b42 + a32 * b43 + a42 * b44;
		d[14] = a13 * b41 + a23 * b42 + a33 * b43 + a43 * b44;
		d[15] = a14 * b41 + a24 * b42 + a34 * b43 + a44 * b44;
	}

	/**
	 * 行列Aの逆行列を設定します
	 * @param {mat4} ma 行列A
	 */
	setInverse(ma) {
		let a = ma.#array;
		let a11 = a[0],  a12 = a[1],  a13 = a[2],  a14 = a[3],
			a21 = a[4],  a22 = a[5],  a23 = a[6],  a24 = a[7],
			a31 = a[8],  a32 = a[9],  a33 = a[10], a34 = a[11],
			a41 = a[12], a42 = a[13], a43 = a[14], a44 = a[15]
		;
		let m1122_1221 = a11 * a22 - a12 * a21,
			m1123_1321 = a11 * a23 - a13 * a21,
			m1124_1421 = a11 * a24 - a14 * a21,
			m1223_1322 = a12 * a23 - a13 * a22,
			m1224_1422 = a12 * a24 - a14 * a22,
			m1324_1423 = a13 * a24 - a14 * a23,
			m3142_3241 = a31 * a42 - a32 * a41,
			m3143_3341 = a31 * a43 - a33 * a41,
			m3144_3441 = a31 * a44 - a34 * a41,
			m3243_3342 = a32 * a43 - a33 * a42,
			m3244_3442 = a32 * a44 - a34 * a42,
			m3344_3443 = a33 * a44 - a34 * a43
		;
		let k = 1 / (
			  m1122_1221 * m3344_3443
			- m1123_1321 * m3244_3442
			+ m1124_1421 * m3243_3342
			+ m1223_1322 * m3144_3441
			- m1224_1422 * m3143_3341
			+ m1324_1423 * m3142_3241
		);
		let d = this.#array;
		d[0]  = ( a22 * m3344_3443 - a23 * m3244_3442 + a24 * m3243_3342) * k;
		d[1]  = (-a12 * m3344_3443 + a13 * m3244_3442 - a14 * m3243_3342) * k;
		d[2]  = ( a42 * m1324_1423 - a43 * m1224_1422 + a44 * m1223_1322) * k;
		d[3]  = (-a32 * m1324_1423 + a33 * m1224_1422 - a34 * m1223_1322) * k;
		d[4]  = (-a21 * m3344_3443 + a23 * m3144_3441 - a24 * m3143_3341) * k;
		d[5]  = ( a11 * m3344_3443 - a13 * m3144_3441 + a14 * m3143_3341) * k;
		d[6]  = (-a41 * m1324_1423 + a43 * m1124_1421 - a44 * m1123_1321) * k;
		d[7]  = ( a31 * m1324_1423 - a33 * m1124_1421 + a34 * m1123_1321) * k;
		d[8]  = ( a21 * m3244_3442 - a22 * m3144_3441 + a24 * m3142_3241) * k;
		d[9]  = (-a11 * m3244_3442 + a12 * m3144_3441 - a14 * m3142_3241) * k;
		d[10] = ( a41 * m1224_1422 - a42 * m1124_1421 + a44 * m1122_1221) * k;
		d[11] = (-a31 * m1224_1422 + a32 * m1124_1421 - a34 * m1122_1221) * k;
		d[12] = (-a21 * m3243_3342 + a22 * m3143_3341 - a23 * m3142_3241) * k;
		d[13] = ( a11 * m3243_3342 - a12 * m3143_3341 + a13 * m3142_3241) * k;
		d[14] = (-a41 * m1223_1322 + a42 * m1123_1321 - a43 * m1122_1221) * k;
		d[15] = ( a31 * m1223_1322 - a32 * m1123_1321 + a33 * m1122_1221) * k;
	}

	/**
	 * ビュー座標変換行列として設定します
	 * @param {number} azimuth
	 * @param {number} tilte
	 * @param {number[]} eye
	 * @param {number[]} position
	 */
	setView(azimuth, tilte, eye, position) {
		let e = new vec(eye[0], eye[1], eye[2]);
		let n = new vec(Math.sin(tilte), Math.cos(tilte));
		let z = e.normalize();
		let x = n.cross(z).normalize();
		let y = z.cross(x).normalize();

		let view = new mat4();
		view.set(
			x.x, y.x, z.x, 0,
			x.y, y.y, z.y, 0,
			x.z, y.z, z.z, 0,
			position[0] - (x.x*e.x + x.y*e.y + x.z*e.z),
			position[1] - (y.x*e.x + y.y*e.y + y.z*e.z),
			position[2] - (z.x*e.x + z.y*e.y + z.z*e.z),
			1
		);

		let rx = Math.cos(azimuth);
		let rz = Math.sin(azimuth);
		let rot = new mat4();
		rot.set(
			rx, 0,-rz, 0,
			 0, 1,  0, 0,
			rz, 0, rx, 0,
			 0, 0,  0, 1
		);

		this.setMul(view, rot);
	}

	/**
	 * 射影座標変換行列として設定します
	 * @param {number} fovy
	 * @param {number} near
	 * @param {number} far
	 * @param {number} aspect
	 */
	setPerspective(fovy, near, far, aspect) {
		let t = near * Math.tan(fovy * Math.PI / 360);
		let w = near / (t * aspect);
		let h = near / t;
		let l = far - near;
		let zt = -(far * near * 2) / l;
		let zs = -(far + near) / l;
		let d = this.#array;
		d[0]  = w; d[1]  = 0; d[2]  = 0;  d[3]  = 0;
		d[4]  = 0; d[5]  = h; d[6]  = 0;  d[7]  = 0;
		d[8]  = 0; d[9]  = 0; d[10] = zs; d[11] = -1;
		d[12] = 0; d[13] = 0; d[14] = zt; d[15] = 0;
	}

	/**
	 * ベクトルvとの積を返します
	 * @param {vec} returnValue 戻り値
	 * @param {vec} v ベクトルv
	 */
	mulVec(returnValue, v) {
		let a = this.#array;

		let x = a[0] * v.x;
		let y = a[1] * v.x;
		let z = a[2] * v.x;
		let w = a[3] * v.x;

		x += a[4] * v.y;
		y += a[5] * v.y;
		z += a[6] * v.y;
		w += a[7] * v.y;

		x += a[8] * v.z;
		y += a[9] * v.z;
		z += a[10] * v.z;
		w += a[11] * v.z;

		x += a[12];
		y += a[13];
		z += a[14];
		w += a[15];

		returnValue.x = x / w;
		returnValue.y = y / w;
		returnValue.z = z / w;
	}
}

/**
 * クォータニオン
 */
class qtn {
	#array = new Float32Array(4);

	constructor(x=0, y=0, z=0, w=1) {
		let d = this.#array;
		d[0] = x;
		d[1] = y;
		d[2] = z;
		d[3] = w;
	}

	/**
	 * 規格化します
	 */
	normalize() {
		let d = this.#array;
		let x = d[0], y = d[1], z = d[2], w = d[3];
		let k = Math.sqrt(x*x + y*y + z*z + w*w);
		if (k) {
			k = 1 / k;
		}
		d[0] = x*k;
		d[1] = y*k;
		d[2] = z*k;
		d[3] = w*k;
	}

	/**
	 * 共役クォータニオンを返します
	 * @returns {qtn}
	 */
	inverse() {
		let a = this.#array;
		return new qtn(-a[0], -a[1], -a[2], a[3]);
	}

	/**
	 * クォータニオンaとクォータニオンbの積を設定します
	 * @param {qtn} qa クォータニオンa
	 * @param {qtn} qb クォータニオンb
	 */
	setMul(qa, qb) {
		let a = qa.#array;
		let ax = a[0], ay = a[1], az = a[2], aw = a[3];
		let b = qb.#array;
		let bx = b[0], by = b[1], bz = b[2], bw = b[3];
		let d = this.#array;
		d[0] = ax * bw + aw * bx + ay * bz - az * by;
		d[1] = ay * bw + aw * by + az * bx - ax * bz;
		d[2] = az * bw + aw * bz + ax * by - ay * bx;
		d[3] = aw * bw - ax * bx - ay * by - az * bz;
	}

	/**
	 * 回転を表現するクォータニオンとして設定します
	 * @param {vec} axis 回転軸
	 * @param {number} angle 回転量
	 */
	setRot(axis, angle) {
		let x = axis.x, y = axis.y, z = axis.z;
		let k = Math.sqrt(x*x + y*y + z*z);
		if (k) {
			k = 1 / k;
		}
		x *= k;
		y *= k;
		z *= k;
		let c = Math.cos(angle * 0.5);
		let s = Math.sin(angle * 0.5);
		let d = this.#array;
		d[0] = x * s;
		d[1] = y * s;
		d[2] = z * s;
		d[3] = c;
	}

	/**
	 * クォータニオンaとクォータニオンbの間を大円補間した結果を設定します
	 * @param {qtn} qa クォータニオンa
	 * @param {qtn} qb クォータニオンb
	 * @param {number} time 0～1の値(0:クォータニオンa, 1:クォータニオンb)
	 */
	setSlerp(qa, qb, time) {
		let a = qa.#array;
		let b = qb.#array;
		let ht
			= a[0] * b[0]
			+ a[1] * b[1]
			+ a[2] * b[2]
			+ a[3] * b[3]
		;
		let hs = 1.0 - ht * ht;
		let d = this.#array;
		if (hs <= 0.0) {
			d[0] = a[0];
			d[1] = a[1];
			d[2] = a[2];
			d[3] = a[3];
		} else {
			hs = Math.sqrt(hs);
			if (Math.abs(hs) < 1e-4) {
				d[0] = (a[0] * 0.5 + b[0] * 0.5);
				d[1] = (a[1] * 0.5 + b[1] * 0.5);
				d[2] = (a[2] * 0.5 + b[2] * 0.5);
				d[3] = (a[3] * 0.5 + b[3] * 0.5);
			} else {
				let ph = Math.acos(ht);
				let pt = ph * time;
				let t0 = Math.sin(ph - pt) / hs;
				let t1 = Math.sin(pt) / hs;
				d[0] = a[0] * t0 + b[0] * t1;
				d[1] = a[1] * t0 + b[1] * t1;
				d[2] = a[2] * t0 + b[2] * t1;
				d[3] = a[3] * t0 + b[3] * t1;
			}
		}
	}

	/**
	 * ベクトルvを回転させた結果を返します
	 * @param {vec} returnValue 戻り値
	 * @param {vec} v ベクトルv
	 */
	rotVec(returnValue, v) {
		let qv = new qtn();
		let qq = new qtn();
		let qr = this.inverse();
		qv.#array[0] = v.x;
		qv.#array[1] = v.y;
		qv.#array[2] = v.z;
		qq.setMul(qr, qv);
		qv.setMul(qq, this);
		returnValue.x = qv.#array[0];
		returnValue.y = qv.#array[1];
		returnValue.z = qv.#array[2];
	}

	/**
	 * 行列に変換して返します
	 * @param {mat4} returnValue 戻り値
	 */
	toMat(returnValue) {
		let x = this.#array[0],
			y = this.#array[1],
			z = this.#array[2],
			w = this.#array[3]
		;

		let x2 = x + x, y2 = y + y, z2 = z + z;
		let xx = x * x2, xy = x * y2, xz = x * z2;
		let yy = y * y2, yz = y * z2, zz = z * z2;
		let wx = w * x2, wy = w * y2, wz = w * z2;

		let r = returnValue.Array;
		r[0]  = 1 - (yy + zz);
		r[1]  = xy - wz;
		r[2]  = xz + wy;
		r[3]  = 0;

		r[4]  = xy + wz;
		r[5]  = 1 - (xx + zz);
		r[6]  = yz - wx;
		r[7]  = 0;

		r[8]  = xz - wy;
		r[9]  = yz + wx;
		r[10] = 1 - (xx + yy);
		r[11] = 0;

		r[12] = 0;
		r[13] = 0;
		r[14] = 0;
		r[15] = 1;
	}
}
