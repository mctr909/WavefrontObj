/// <reference path="common/math.js"/>
/// <reference path="common/geometry.js"/>

function draw() {
	let objList = [];

	// 脚部分
	{
		let g = new geometry();

		//*** ベース ***//
		let baseW = 28; // 幅
		let baseL = 40; // 長さ
		g.addCapsule(0, 0, baseW, baseL, 0, 48);

		//*** モーターの回転軸を通す穴 ***//
		let spindleD = 7.5; // 直径
		g.addCircle(0, 0, spindleD, 48);

		//*** ねじを通す穴 ***//
		let holeW = 3.2; // 幅
		let holeL = 6;   // 長さ
		let holeN = 4;   // 穴の数
		let holeR = 18.2 / 2; // モーターの回転軸からねじ穴までの長さ
		let holeA = 45;  // オフセット角度
		for (let i=0; i<holeN; i++) {
			let deg = 360 * i / holeN + holeA;
			let rad = Math.PI*deg/180;
			let x = holeR * Math.cos(rad);
			let y = holeR * Math.sin(rad);
			g.addCapsule(x, y, holeW, holeL, deg, 24);
		}

		objList.push(g.createObject(0, 4, "脚"));
	}

	return objList;
}
