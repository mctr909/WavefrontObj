/// <reference path="math.js" />
/// <reference path="model.js" />

const INT_MAX = 1e10;
const INT_MIN = -1e10;

class _face {
	/** @type {number} */
	a;
	/** @type {number} */
	o;
	/** @type {number} */
	b;
	constructor(a, o, b) {
		this.a = a;
		this.o = o;
		this.b = b;
	}
}

class _nestInfo {
	/** 親へのインデックス */
	parent = -1;
	/** ネストの深さ */
	depth = 0;
}

class _vInfo {
	deleted = false;
	/** @type {number} */
	distance;
}

class geometry {
	/** @type {vec[][]} */
	#lines = [];

	clear() {
		this.#lines = [];
	}

	/**
	 * 矩形
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @param {number} angle
	 */
	addRectangle(x, y, w, h, angle) {
		let line = [];
		w *= 0.5;
		h *= 0.5;
		line.push(new vec(-w, -h));
		line.push(new vec(w, -h));
		line.push(new vec(w, h));
		line.push(new vec(-w, h));
		geometry.#rotTrans(line, angle, x, y);
		this.#lines.push(line);
	}

	/**
	 * 円
	 * @param {number} x
	 * @param {number} y
	 * @param {number} d
	 * @param {number} div
	 */
	addCircle(x, y, d, div) {
		let line = [];
		let r = d / 2;
		for (let i=0; i<div; i++) {
			let th = 2*Math.PI*i/div;
			line.push(new vec(
				r * Math.cos(th) + x,
				r * Math.sin(th) + y
			));
		}
		this.#lines.push(line);
	}

	/**
	 * カプセル形
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} length
	 * @param {number} angle
	 * @param {number} div
	 */
	addCapsule(x, y, w, length, angle, div) {
		const OFS_TH = Math.PI/2;
		let line = [];
		let r = w / 2;
		let ofsX = (length < w) ? 0 : (length - w) / 2;
		for (let i=0; i<div; i++) {
			let th = Math.PI*i/div - OFS_TH;
			line.push(new vec(
				r * Math.cos(th) + ofsX,
				r * Math.sin(th)
			));
		}
		for (let i=0; i<div; i++) {
			let th = Math.PI*i/div + OFS_TH;
			line.push(new vec(
				r * Math.cos(th) - ofsX,
				r * Math.sin(th)
			));
		}
		geometry.#rotTrans(line, angle, x, y);
		this.#lines.push(line);
	}

	/**
	 * オブジェクトを作成
	 * @param {number} bottom
	 * @param {number} height
	 * @param {string} name
	 * @param {Color} color
	 */
	createObject(bottom, height, name="", color=Color.GREEN) {
		/** @type {number[][]} */
		let indexesBottom = [];
		/** @type {number[][]} */
		let indexesTop = [];
		/** @type {vec[]} */
		let tempVerts = [];
		let indexOfs = 0;

		let group = new Group(name, 0);
		group.color.setFrom(color);
		group.usemtl = name;
		let retModel = new Model();
		retModel.grp.push(group);

		for (let i = 0; i < this.#lines.length; i++) {
			let line = this.#lines[i];
			let pointCount = line.length;
			if (0 == pointCount) {
				continue;
			}

			// 底面頂点を出力
			let indexBottom = [];
			for (let j = 0; j < pointCount; j++) {
				let p = new vec(line[j].x, line[j].y);
				tempVerts.push(p);
				indexBottom.push(indexOfs + j);
				retModel.ver.push(p.x, bottom, p.y);
			}
			indexesBottom.push(indexBottom);
			indexOfs += pointCount;

			// 上面頂点を出力
			let indexTop = [];
			for (let j = 0; j < pointCount; j++) {
				let p = new vec(line[j].x, line[j].y);
				tempVerts.push(p);
				indexTop.push(indexOfs + pointCount - j - 1);
				retModel.ver.push(p.x, bottom + height, p.y);
			}
			indexesTop.push(indexTop);
			indexOfs += pointCount;
		}

		// 穴部分に該当する線をマージ
		const BOTTOM_ORDER = -1;
		const TOP_ORDER = 1;
		geometry.#margeLines(tempVerts, indexesBottom, BOTTOM_ORDER);
		geometry.#margeLines(tempVerts, indexesTop, TOP_ORDER);

		// 底面を出力
		for (let i = 0; i < indexesBottom.length; i++) {
			let index = indexesBottom[i];
			if (0 == index.length) {
				continue;
			}
			/** @type {_face[]} */
			let s = [];
			geometry.#createPolygon(tempVerts, index, s, BOTTOM_ORDER);
			for (let j = 0; j < s.length; j++) {
				var f = s[j];
				retModel.idx.push(f.a, f.o, f.b);
				group.size += 3;
			}
		}

		// 上面を出力
		for (let i = 0; i < indexesTop.length; i++) {
			let index = indexesTop[i];
			if (0 == index.length) {
				continue;
			}
			/** @type {_face[]} */
			let s = [];
			geometry.#createPolygon(tempVerts, index, s, TOP_ORDER);
			for (let j = 0; j < s.length; j++) {
				var f = s[j];
				retModel.idx.push(f.a, f.o, f.b);
				group.size += 3;
			}
		}

		// 側面を出力
		for (let i = 0; i < indexesBottom.length; i++) {
			let indexBottom = indexesBottom[i];
			let indexTop = indexesTop[i];
			if (0 == indexBottom.length || 0 == indexTop.length) {
				continue;
			}
			let pointCount = indexBottom.length;
			for (let ib = 0; ib < pointCount; ib++) {
				let ix1 = indexBottom[ib];
				let v1 = tempVerts[ix1];
				let ix2;
				for (let it = 0; it < pointCount; it++) {
					let i2 = indexTop[it];
					let v2 = tempVerts[i2];
					let sx = v2.x - v1.x;
					let sy = v2.y - v1.y;
					if (0 == sx * sx + sy * sy) {
						ix2 = i2;
						break;
					}
				}
				let ix0 = indexBottom[(ib + 1) % pointCount];
				let v0 = tempVerts[ix0];
				let ix3;
				for (let it = 0; it < pointCount; it++) {
					let i3 = indexTop[it];
					let v3 = tempVerts[i3];
					let sx = v3.x - v0.x;
					let sy = v3.y - v0.y;
					if (0 == sx * sx + sy * sy) {
						ix3 = i3;
						break;
					}
				}
				retModel.idx.push(ix0, ix1, ix2);
				retModel.idx.push(ix0, ix2, ix3);
				group.size += 6;
			}
		}
		return retModel;
	}

	/**
	 * @param {vec[]} vertex
	 * @param {number[]} index
	 * @param {_face[]} faceList
	 * @param {number} order
	 * @returns {number}
	 */
	static #createPolygon(vertex, index, faceList, order) {
		const INDEX_COUNT = index.length;
		const INDEX_NEXT = INDEX_COUNT + order;
		const INDEX_RIGHT = 1;
		const INDEX_LEFT = INDEX_COUNT - 1;
		const ORIGIN = new vec(INT_MIN, INT_MIN, 0);

		/** @type {_vInfo[]} */
		let vInfoList = [];
		for (let i = 0; i < INDEX_COUNT; i++) {
			let ov = vertex[index[i]].sub(ORIGIN);
			let vInfo = new _vInfo();
			vInfo.distance = Math.sqrt(ov.dot(ov));
			vInfoList.push(vInfo);
		}

		/**
		 ** 頂点(va)
		 * @type {vec}
		 */
		let va;
		/**
		 ** 頂点(vo)
		 * @type {vec}
		 */
		let vo;
		/**
		 ** 頂点(vb)
		 * @type {vec}
		 */
		let vb;

		/*** 頂点数 */
		let vertexCount = 0;
		/*** 逆面数 */
		let reverseCount = 0;
		/*** 面積 */
		let s = 0.0;

		do { // 最も遠くにある頂点(vo)の取得ループ
			vertexCount = 0;
			reverseCount = 0;

			/*** 最も遠くにある頂点(vo)を取得 */
			let ixO = 0;
			let distanceMax = 0.0;
			for (let i = 0; i < INDEX_COUNT; i++) {
				let vInfo = vInfoList[i];
				if (vInfo.deleted) {
					continue;
				}
				if (distanceMax < vInfo.distance) {
					distanceMax = vInfo.distance;
					ixO = i;
				}
				vertexCount++;
			}
			vo = vertex[index[ixO]];

			while (true) { // 頂点(vo)の移動ループ
				/*** 頂点(vo)を基準に頂点(va)を取得 */
				let ixA = (ixO + INDEX_LEFT) % INDEX_COUNT;
				for (let i = 0; i < INDEX_COUNT; i++) {
					if (vInfoList[ixA].deleted) {
						ixA = (ixA + INDEX_LEFT) % INDEX_COUNT;
					} else {
						break;
					}
				}
				va = vertex[index[ixA]];

				/*** 頂点(vo)を基準に頂点(vb)を取得 */
				let ixB = (ixO + INDEX_RIGHT) % INDEX_COUNT;
				for (let i = 0; i < INDEX_COUNT; i++) {
					if (vInfoList[ixB].deleted) {
						ixB = (ixB + INDEX_RIGHT) % INDEX_COUNT;
					} else {
						break;
					}
				}
				vb = vertex[index[ixB]];

				/*** 三角形(va,vo,vb)の表裏を確認 */
				let aobNormal = va.sub(vo).cross(vb.sub(vo)).z * order;
				if (aobNormal < 0) {
					// [裏の場合]
					reverseCount++;
					if (INDEX_COUNT < reverseCount) {
						// [表になる三角形(va,vo,vb)がない場合]
						// 頂点(vo)を検索対象から削除
						vInfoList[ixO].deleted = true;
						// 次の最も遠くにある頂点(vo)を取得
						break;
					}
					// 頂点(vo)を隣に移動
					ixO = (ixO + INDEX_NEXT) % INDEX_COUNT;
					for (let i = 0; i < INDEX_COUNT; i++) {
						if (vInfoList[ixO].deleted) {
							ixO = (ixO + INDEX_NEXT) % INDEX_COUNT;
						} else {
							break;
						}
					}
					vo = vertex[index[ixO]];
					continue;
				}

				/*** 三角形(va,vo,vb)の内側に他の頂点がないか確認 */
				let pointInTriangle = false;
				for (let i = 0; i < INDEX_COUNT; i++) {
					if (i == ixA || i == ixO || i == ixB || vInfoList[i].deleted) {
						continue;
					}
					let p = vertex[index[i]];
					if (geometry.#hasInnerPoint(va, vo, vb, p)) {
						pointInTriangle = true;
						break;
					}
				}
				if (pointInTriangle) {
					// [三角形(va,vo,vb)の内側に他の頂点がある場合]
					// 頂点(vo)を隣に移動
					ixO = (ixO + INDEX_NEXT) % INDEX_COUNT;
					for (let i = 0; i < INDEX_COUNT; i++) {
						if (vInfoList[ixO].deleted) {
							ixO = (ixO + INDEX_NEXT) % INDEX_COUNT;
						} else {
							break;
						}
					}
					vo = vertex[index[ixO]];
				} else {
					// [三角形(va,vo,vb)の内側に他の頂点がない場合]
					// 三角形(va,vo,vb)を面リストに追加
					let f = new _face(index[ixA], index[ixO], index[ixB]);
					faceList.push(f);
					// 三角形の面積を加算
					s += Math.abs(aobNormal) / 2.0;
					// 頂点(vo)を検索対象から削除
					vInfoList[ixO].deleted = true;
					// 次の最も遠くにある頂点(vo)を取得
					break;
				}
			} // 頂点(vo)の移動ループ
		} while (3 < vertexCount); // 最も遠くにある頂点(vo)の取得ループ
		return s;
	}

	/**
	 * @param {vec} a
	 * @param {vec} o
	 * @param {vec} b
	 * @param {vec} p
	 * @returns {boolean}
	 */
	static #hasInnerPoint(a, o, b, p) {
		let oapNormal = o.sub(a).cross(p.sub(a)).z;
		let bopNormal = b.sub(o).cross(p.sub(o)).z;
		let abpNormal = a.sub(b).cross(p.sub(b)).z;
		if (oapNormal > 0 && bopNormal > 0 && abpNormal > 0) {
			return true;
		}
		if (oapNormal < 0 && bopNormal < 0 && abpNormal < 0) {
			return true;
		}
		if (oapNormal == 0 && (bopNormal > 0 && abpNormal > 0 || abpNormal < 0 && bopNormal < 0)) {
			return true;
		}
		if (bopNormal == 0 && (abpNormal > 0 && oapNormal > 0 || oapNormal < 0 && abpNormal < 0)) {
			return true;
		}
		if (abpNormal == 0 && (oapNormal > 0 && bopNormal > 0 || bopNormal < 0 && oapNormal < 0)) {
			return true;
		}
		return false;
	}

	/**
	 * @param {_face[]} outerSurfList
	 * @param {_face[]} innerSurfList
	 * @param {vec[]} vertex
	 * @returns {boolean}
	 */
	static #hasInnerPolygon(outerSurfList, innerSurfList, vertex) {
		for (let i = 0; i < outerSurfList.length; i++) {
			let outer = outerSurfList[i];
			let outerA = vertex[outer.a];
			let outerO = vertex[outer.o];
			let outerB = vertex[outer.b];
			let innerCount = innerSurfList.length;
			for (let j = 0; j < innerCount; j++) {
				let inner = innerSurfList[j];
				let innerA = vertex[inner.a];
				let innerO = vertex[inner.o];
				let innerB = vertex[inner.b];
				if (geometry.#hasInnerPoint(outerA, outerO, outerB, innerA)) {
					return true;
				}
				if (geometry.#hasInnerPoint(outerA, outerO, outerB, innerO)) {
					return true;
				}
				if (geometry.#hasInnerPoint(outerA, outerO, outerB, innerB)) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * @param {vec[]} vertex
	 * @param {number[][]} indexes
	 * @param {number} order
	 */
	static #margeLines(vertex, indexes, order) {
		/** @type {_nestInfo[]} */
		let nestInfo = [];
		for (let i = 0; i < indexes.length; i++) {
			nestInfo.push(new _nestInfo());
		}

		// 入れ子になっている線を検索
		for (let ixOuter = 0; ixOuter < indexes.length; ixOuter++) {
			if (indexes[ixOuter].length < 3) {
				indexes[ixOuter] = [];
				continue;
			}
			let innerCount = indexes.length;
			for (let ixInner = 0; ixInner < innerCount; ixInner++) {
				if (indexes[ixInner].length < 3) {
					indexes[ixInner] = [];
					continue;
				}
				if (ixInner == ixOuter) {
					continue;
				}
				let inner = nestInfo[ixInner];
				if (nestInfo[ixOuter].depth < inner.depth) {
					continue;
				}
				/** @type {_face[]} */
				let outerSurf = [];
				/** @type {_face[]} */
				let innerSurf = [];
				let outerS = geometry.#createPolygon(vertex, indexes[ixOuter], outerSurf, order);
				let innerS = geometry.#createPolygon(vertex, indexes[ixInner], innerSurf, order);
				if (innerS < outerS && geometry.#hasInnerPolygon(outerSurf, innerSurf, vertex)) {
					inner.parent = ixOuter;
					inner.depth++;
				}
			}
		}

		// 穴に該当する線を親の線にマージ
		while (true) {
			let mostNear = INT_MAX*INT_MAX;
			let ixInner = 0;
			/** @type {_nestInfo} */
			let inner = null;
			let nestCount = nestInfo.length;
			for (let i = 0; i < nestCount; i++) {
				let innerTemp = nestInfo[i];
				if (0 == innerTemp.depth % 2) {
					// depth=偶数: 穴に該当しない線
					continue;
				}
				if (i == innerTemp.parent) {
					continue;
				}
				if (indexes[i].length < 3) {
					continue;
				}
				let pos = vertex[indexes[i][0]];
				let ox, oy;
				if (order < 0) {
					ox = pos.x - INT_MAX;
					oy = pos.y - INT_MAX;
				} else {
					ox = pos.x - INT_MIN;
					oy = pos.y - INT_MIN;
				}
				let dist = Math.sqrt(ox * ox + oy * oy);
				if (dist < mostNear) {
					// 原点から近い線を優先してマージする
					ixInner = i;
					inner = innerTemp;
					mostNear = dist;
				}
			}
			if (null == inner) {
				break;
			}

			// 穴に該当する線と親の線で互いに最も近い頂点を検索
			// 互いに最も近い点をマージ開始位置に設定する
			let insertSrc = 0, insertDst = 0;
			mostNear = INT_MAX*INT_MAX;
			let indexC = indexes[ixInner];
			let indexP = indexes[inner.parent];
			let parentCount = indexP.length;
			for (let iChild = 0; iChild < indexC.length; iChild++) {
				let vc = vertex[indexC[iChild]];
				for (let iParent = 0; iParent < parentCount; iParent++) {
					let vp = vertex[indexP[iParent]];
					let pc = vc.sub(vp);
					let dist = Math.sqrt(pc.dot(pc));
					if (dist < mostNear) {
						insertSrc = iChild;
						insertDst = iParent;
						mostNear = dist;
					}
				}
			}

			// マージ
			let temp = [];
			for (let i = 0; i <= insertDst && i < indexP.length; i++) {
				temp.push(indexP[i]);
			}
			let innerSize = indexC.length;
			for (let i = 0; i < innerSize; i++) {
				let ix = (innerSize + insertSrc - i) % innerSize;
				temp.push(indexC[ix]);
			}
			temp.push(indexC[insertSrc]);
			for (let i = insertDst; i < indexP.length; i++) {
				temp.push(indexP[i]);
			}
			indexes[inner.parent] = temp;
			indexes[ixInner] = [];
		}
	}

	/**
	 * @param {vec[]} line
	 * @param {number} angle
	 * @param {number} tx
	 * @param {number} ty
	 */
	static #rotTrans(line, angle, tx, ty) {
		var rad = angle*Math.PI/180;
		var rotX = Math.cos(rad);
		var rotY = Math.sin(rad);
		for (let i=0; i<line.length; i++) {
			var v = line[i];
			var rx = v.x * rotX - v.y * rotY;
			var ry = v.x * rotY + v.y * rotX;
			v.x = rx + tx;
			v.y = ry + ty;
		}
	}
}
