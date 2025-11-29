/// <reference path="common/math.js"/>
/// <reference path="common/model.js"/>
/// <reference path="common/render.js"/>
/// <reference path="common/viewpad.js"/>
/// <reference path="draw.js"/>

const OBJ_NAME = "test.obj";
const MTL_NAME = "test.mtl";

/** @type {HTMLInputElement} */
let gScale;
/** @type {ViewPad} */
let gViewPad;
/** @type {Render} */
let gRender;
/** @type {Model} */
let gModel;

onload = function() {
	gScale = document.getElementById('scale');
	gScale.style.width = 320;
	gViewPad = new ViewPad("viewpad", 320, 320);
	gViewPad.setElevation(45);
	gRender = new Render(
		document.getElementById("canvas"),
		1024, 768,
		document.getElementById("vs").innerHTML,
		document.getElementById("fs").innerHTML
	);
	gModel = Model.marge(OBJ_NAME, MTL_NAME, draw());
	gRender.addModels(gModel);
	document.getElementById("disp").innerHTML
		= "<a id='downloadObj' href='#' onclick='createObjFile()'>objファイル保存</a><br>"
		+ "<a id='downloadMtl' href='#' onclick='createMtlFile()'>mtlファイル保存</a>";
	loop();
};

function loop() {
	gViewPad.update();
	gRender.clear();

	// カメラの位置カメラの姿勢
	const eyeR = 1e2;
	gRender.cam.eye = [0, eyeR*Math.sin(gViewPad.elevation), eyeR*Math.cos(gViewPad.elevation)];
	gRender.cam.position = gViewPad.position;
	gRender.cam.azimuth = gViewPad.azimuth;
	gRender.cam.tilte = gViewPad.tilte;
	gRender.applyCamera();

	// 光源の位置, 環境光の色
	const lightR = 1e4;
	gRender.light.position = [0, lightR, lightR];
	gRender.light.ambientColor = [0.13, 0.13, 0.13, 1];
	gRender.applyLight();

	// 3dモデル描画
	if (gRender.bindModel(OBJ_NAME)) {
		let s = gScale.value * 0.01;
		let matModel = new mat4();
		matModel.set(
			s, 0, 0, 0,
			0, s, 0, 0,
			0, 0, s, 0,
			0, 0, 0, 1
		);
		for (let i=0; i<gRender.GroupCount; i++) {
			gRender.drawModel(matModel, i);
		}
	}

	gRender.flush();
	window.requestAnimationFrame(loop);
}

function createObjFile() {
	let ver = gModel.ver;
	let idx = gModel.idx;
	let grp = gModel.grp;
	let str = "mtllib " + MTL_NAME + "\r\n";
	for (let ix=0; ix<ver.length; ix+=3) {
		let x = ver[ix];
		let y = ver[ix+1];
		let z = ver[ix+2];
		str += "v " + x.toExponential(3) + " " + y.toExponential(3) + " " + z.toExponential(3) + "\r\n";
	}
	for (let i=0; i<grp.length; i++) {
		let g = grp[i];
		str += "g '" + g.id + "'\r\n";
		str += "usemtl '" + g.usemtl + "'\r\n";
		for (let j=g.ofs,c=0; c<g.size; j+=3,c+=3) {
			let a = idx[j] + 1;
			let o = idx[j+1] + 1;
			let b = idx[j+2] + 1;
			str += "f " + a + " "+ o + " " + b + "\r\n";
		}
	}
	let blob = new Blob([ str ], { "type" : "text/plain" });
	if (window.navigator.msSaveBlob) {
		window.navigator.msSaveBlob(blob, OBJ_NAME);
		window.navigator.msSaveOrOpenBlob(blob, OBJ_NAME);
	} else {
		document.getElementById("downloadObj").href = window.URL.createObjectURL(blob);
		document.getElementById("downloadObj").download = OBJ_NAME;
	}
}

function createMtlFile() {
	let mtl = gModel.mtl;
	let str = "";
	for (let i=0; i<mtl.length; i++) {
		let m = mtl[i];
		str += "newmtl '" + m.id + "'\r\n";
		str += "Kd " + m.kd.r + " " + m.kd.g + " " + m.kd.b + "\r\n\r\n";
	}
	let blob = new Blob([ str ], { "type" : "text/plain" });
	if (window.navigator.msSaveBlob) {
		window.navigator.msSaveBlob(blob, MTL_NAME);
		window.navigator.msSaveOrOpenBlob(blob, MTL_NAME);
	} else {
		document.getElementById("downloadMtl").href = window.URL.createObjectURL(blob);
		document.getElementById("downloadMtl").download = MTL_NAME;
	}
}
