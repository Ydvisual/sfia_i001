// Init
var img_info = new Image();
img_info.src = "img/info.png";
var cv = document.getElementById("canvas_gfx"); // The canvas
var scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
var asp = cv.width / cv.height;
var cam = new THREE.PerspectiveCamera(36, asp, 0.1, 1000);
var clock = new THREE.Clock();
clock.start();
var frn = -120;
var frn_adv = 2;
var frn_max = 60100; // Lower = faster (6000 def)
var ntime = 0.0; // normal time

// 1.57 Max (PI/2)
var angle_dust = [
	[-1.0000, 0.157],
	[-0.0120, 0.150],
	[0.0000, 0.0100],
	[0.0010, 0.0000],
	[1.0000, 0.0000]
];

// sun = white dwarf
var int_core = [
	[0.000, 0.0],
	[0.23, 0.0],
	[0.30, 7.0],
	[0.80, 1.20],
	[1.00, 0.20],
];

// Sun regular to red giant
var int_sun = [
	[0.0000, 5.0],
	[0.0041,6.0],
	[0.2000,12.0],
	[0.2700,95.0],
	[0.2900,0.0],
	[1.0000,0.0]
];
var c_red_sun = [
	[0.00,1.0],
	[0.20,1.0],	
	[1.00, 1.0]
];
var c_green_sun = [
	[0.00,1.0],
	[0.20,1.0],
	[0.22,0.010],
	[0.26,0.005],
	[0.270,0.000],
	[0.275,0.0],
	[0.55,0.0],
	[1.00,0.0]
];
var c_blue_sun = [
	[0.00,0.0],
	[0.20,0.0],
	[0.22,0.0],
	[0.26,0.0],
	[0.270,0.0],
	[0.275,0.0],
	[0.55,0.0],
	[1.00,0.0]
];


function resizer() {
	cv = document.getElementById("canvas_gfx"); // The canvas		
	var cv_w = 1400;
	var cv_h = 500;	
	// h = 5/14 of div_all
	cv = document.getElementById("canvas_gfx"); // The canvas		
	cparent = document.getElementById("div_all"); // The canvas		
	container_w = cparent.offsetWidth;
	if (container_w < cv_w) {
		cv_w = container_w;
		cv_h = cv_w * (5.0/14.0);
	}
	cam.aspect = cv_w / cv_h;
    cam.updateProjectionMatrix();
    renderer.setSize(cv_w, cv_h);		
}

// Init: Time canvas
var c = document.getElementById("canvas_info");
c.width = 1400;
c.height = 200;
c.addEventListener('click', function() {
	frn = frn_start;
}
	, false);

// Init:Renderer
var renderer = new THREE.WebGLRenderer({canvas:cv, antialias:true});
resizer();
renderer.shadowMap.enabled = false;
//renderer.shadowMap.soft = true;
//document.body.appendChild(renderer.domElement);
var cur_rotation = 0.0;
var useFlat = false;
var shi = 25.0;
var useTrans = true;
var opa = 0.85;
var cur_opacity = 1.0;

// Window resize
window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){	
	resizer();
}

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
	// 49=1
	if (keyCode == 49) {
		frn_adv = 1;
		frn = -120;
    }	
	// 50=2
	if (keyCode == 50) {
		frn_adv = 2;
		frn = -120;
    }	
	// 51=3
	if (keyCode == 51) {
		frn_adv = 4;
		frn = -120;
    }	
	// 52=4
	if (keyCode == 52) {
		frn_adv = 8;
		frn = -120;
    }	
	// 53=5
	if (keyCode == 53) {
		frn_adv = 16;
		frn = -120;
    }	
	// 54=6
	if (keyCode == 53) {
		frn_adv = 32;
		frn = -120;
    }	
	//////////// 37,39 = Left,right arrow
	if (keyCode == 37) {
		frn = frn - 200;
    }	
	if (keyCode == 39) {
		frn = frn + 200;
    }	
	
	// space = 32, w=87
    if (keyCode == 32) {
		//meshFloor.material.color.setHex("0x00ff00");		
		frn = -120;
    }	
};


// ----------------------------------------------------- Floor
meshFloor = new THREE.Mesh(
	new THREE.PlaneGeometry(116, 116, 1, 1),
	new THREE.MeshPhongMaterial({
		color:0xFFFFFF,
		shininess:10,
		wireframe:false
		})
);
meshFloor.receiveShadow = true;
scene.add(meshFloor);
meshFloor.position.set(0,0,0);
//meshFloor.rotation.x = -Math.PI / 2.0;


var ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.0); 
//scene.add(ambientLight); // off for now

//// Main Lights
px = 2.20; 
pz = 0.040; //0.100

// Main sun (Color, intensity, distance(0=inf), decay)
var L1 = new THREE.PointLight(0xFFFF00, 2.0, 0, 2.0);
L1.castShadow = false;
scene.add(L1);
L1.position.set(-px, 0, pz); // Sun

// Dust cloud
angle = 0.84; // changes in update()
pn = 1.0;
var L1_dust = new THREE.SpotLight(0x444444, 1.0, 0, angle, pn, 0);
L1_dust.position.set(-px, 0, 40);
L1_dust.target.position.set(-px, 0, 0);
scene.add(L1_dust.target);
scene.add(L1_dust);

// Main sun core (remnant)
var L1_core = new THREE.PointLight(0xFFFFFF, 2.0, 0, 2.0);
L1_core.castShadow = false;
scene.add(L1_core);
L1_core.position.set(-px, 0, 0.0050);



// Color, intensity, distance, decay
var L2 = new THREE.PointLight(0xAA0201, 4.0, 0, 2.0);
L2.castShadow = false;
scene.add(L2);


L2.position.set(px,0, pz); //s
// v01
//L1.position.set(15,12,12);


// Cam pos
cam.position.set(0, 0, 5);
cam.lookAt(new THREE.Vector3(0,0,0));

function calc_val(ar) {	
	rval = 0.0;
	
	len = ar.length;
	for (idx = 0; idx < (len-1); idx++) {
		t0 = ar[idx][0];
		t1 = ar[idx+1][0];
		if (ntime > t0) {
			td = (ntime - t0) / (t1 - t0);			
			v0 = ar[idx][1];
			v1 = ar[idx+1][1];			
			val = v0 + ((v1 - v0) * td);
			rval = val;
		}
	}
	return rval;
}

var update = function() {	
		
	//ntime
	// start: -0.010 to 0.0
	
	
	// Sun dust collapsing
	val = (300.0 * -ntime) + 0.25;
	if (val <= 0.0) { val = 0.0;}
	val = calc_val(angle_dust);
	L1_dust.angle = val;
	

	// Main sun intensity	
	val = calc_val(int_sun);
	var r = Math.random() * 0.0120;
	val = val + (val * r);
	L1.intensity = val;
	
	// Main sun color	
	cr = calc_val(c_red_sun);
	cg = calc_val(c_green_sun);
	cb = calc_val(c_blue_sun);
	L1.color.r = cr;
	L1.color.g = cg;
	L1.color.b = cb;
	
	// Main sun white dwarf remnant
	val = calc_val(int_core);
	var r = Math.random() * 0.090;
	val = val + (val * r);
	L1_core.intensity = val;
		
	L2.position.z += 0.0000; // Red dwarf
	L2.intensity = 1.210;
	
	
	//L2.intensity += 0.000;
	//L2.color.setHex( 0x00ff00 );
	
	frn += frn_adv;
	if (frn > frn_max) {
		frn = frn_max;
	}
	
};
var render = function() {
	renderer.render(scene, cam);
}
var draw = function() {
	
	//// Info Canvas
	var c = document.getElementById("canvas_info");		
	var ctx = c.getContext("2d");		
	ctx.clearRect(0, 0, c.width, c.height);
	cparent = document.getElementById("div_all"); // The canvas		
	ww = cparent.offsetWidth;
	hh = cparent.offsetHeight;
	ctx.drawImage(img_info, 0, 0, ww, ww * img_info.height / img_info.width);
	//ctx.globalCompositeOperation = 'destination-over';
	// Time ticker
	ctx.strokeStyle = "#EEE";
	ctx.lineWidth = 3.0;
	ctx.beginPath();
	wsc = ww / 1400.0;
	px0 = 75.0 * wsc;
	py0 = 75.0 * wsc;
	// Time speed
	n_frn = (frn / frn_max); // 0->1.0 in speed_f frames
	q = 1.0 - n_frn;
	mn = q * q * q * q * q;	
	fak = (1.0 - mn);	
	line_ww = 1249.0;
	dx = line_ww * fak; //
	px = px0 + dx;	
	ntime = fak;
	
	y_ext = 15.0 * wsc;
	ctx.moveTo(px, py0 - y_ext);
	ctx.lineTo(px, py0 + y_ext);
	ctx.stroke();
	
	str = "a=2, ntime: " + ntime;
	ctx.font = "20px Georgia";
	ctx.fillText(str, 10, 180);
	
	
	//// WebGL Canvas
	update(); // pos/rot = f(time)
	render();
	
	// Next frame
	requestAnimationFrame(draw);
}



draw();




