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
var frn_start = -150;
var frn = frn_start;
var frn_adv = 2;
var frn_max = 60100; // Lower = faster (6000 def)
var ntime = 0.0; // normal time
var debug_time = false;
var mx = -1;
var tpx0 = 0;
var line_ww = 0;

// -------------------------------- Sun data
var angle_dust = [
	[-1.0000, 0.120],
	[-0.0120, 0.100],
	[0.0000, 0.0100],
	[0.0010, 0.0000],
	[1.0000, 0.0000]
];
// white dwarf phase
var int_core = [
	[0.000, 0.0],
	[0.23, 0.0],
	[0.30, 7.0],
	[0.80, 1.20],
	[1.00, 0.20],
];
var int_sun = [
	[0.0000, 4.5],
	[0.0041,5.2],
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
	[1.00,0.0]
];

// -------------------------------- Red dwarf data
// Red dwarf dust
var angle_dust_rd = [
	[-1.0000, 0.050],
	[-0.0120, 0.040],
	[ 0.0000, 0.000],
	[ 0.0010, 0.000],
	[ 1.0000, 0.000]
];
// Red dwarf intensity
var int_rdwarf = [
	[0.0000, 0.5],
	[0.0012, 1.3],
	[0.5000, 1.1],	
	[0.5100, 2.0],	
	[0.5700, 0.0],	
	[0.7100, 0.0],	
	[1.0000, 0.0]
];

var c_red_rd = [
	[0.00,1.0],
	[0.50,1.0],	
	[0.51, 0.0],
	[1.00, 0.0]
];
var c_blue_rd = [
	[0.00,0.0],
	[0.50,0.0],
	[0.51,1.0],
	[1.00,0.0]
];
// White dwarf remnant
var int_core_rd = [
	[0.000, 0.0],
	[0.52, 0.0],
	[0.54, 7.0],
	[0.70, 3.5],
	[1.00, 0.0],
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

//Get Mouse Position
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
// Init: Time canvas
var c = document.getElementById("canvas_info");
c.width = 1400;
c.height = 170;
c.addEventListener('click', function(evt) {	
	var mousePos = getMousePos(c, evt);
	frn = 0;
}, false);

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
	// 13=Enter
	if (keyCode == 13) {
		frn = frn_start;
    }	
	// 49=1
	if (keyCode == 49) {
		frn_adv = 1;
    }	
	// 50=2
	if (keyCode == 50) {
		frn_adv = 2;
    }	
	// 51=3
	if (keyCode == 51) {
		frn_adv = 4;
    }	
	// 52=4
	if (keyCode == 52) {
		frn_adv = 8;
    }	
	// 53=5
	if (keyCode == 53) {
		frn_adv = 16;
    }	
	// 54=6
	if (keyCode == 54) {
		frn_adv = 32;
    }	
	// 55=7
	if (keyCode == 55) {
		frn_adv = 64;
    }	
	// 56=8
	if (keyCode == 56) {
		frn_adv = 100;
    }	
	//////////// 37,39 = Left,right arrow
	if (keyCode == 37) {
		frn = frn - 300;
		if (frn < -200) {
			frn = -200;
		}
    }	
	if (keyCode == 39) {
		frn = frn + 300;
    }	
	
	// space = 32, w=87
    if (keyCode == 32) {
		//meshFloor.material.color.setHex("0x00ff00");		
		frn = -120;
    }	
	if (keyCode == 78) {
		// 78=n
		if (debug_time) {
			debug_time = false;
		}
		else {
			debug_time = true;
		}
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

// ------------------------------------------------------------------------------ L1: Our sun ----
//(color, int, dist(0=-inf), decay)
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


// ------------------------------------------------------------------- L2: Red dwarf sun
pzr = 0.100;
var L2 = new THREE.PointLight(0xFF3000, 1.0, 0, 2.0); // color, int, dist, decy
L2.castShadow = false;
scene.add(L2);
L2.position.set(px,0, pzr);
// Red dwarf dust
var L2_dust = new THREE.SpotLight(0x333333, 1.0, 0, angle, pn, 0);
L2_dust.position.set(px, 0, 40);
L2_dust.target.position.set(px, 0, 0);
scene.add(L2_dust.target);
scene.add(L2_dust);
// Main sun core (remnant)
var L2_core = new THREE.PointLight(0xFFFFFF, 2.0, 0, 2.0);
L2_core.castShadow = false;
scene.add(L2_core);
L2_core.position.set(px, 0, 0.0050);


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
	
	
	// ---------------------------------------------- Our sun
	val = (300.0 * -ntime) + 0.25;
	if (val <= 0.0) { val = 0.0;}
	val = calc_val(angle_dust);
	L1_dust.angle = val;
	
	// Main sun intensity	
	val = calc_val(int_sun);
	r = Math.random() * 0.0120;
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
	r = Math.random() * 0.090;
	val = val + (val * r);
	L1_core.intensity = val;
	
	// ---------------------------------------------- Red dwarf
	// Dust collapse
	val = (300.0 * -ntime) + 0.25;
	if (val <= 0.0) { val = 0.0;}
	val = calc_val(angle_dust_rd);
	L2_dust.angle = val;
	
	// -- Intensity
	val = calc_val(int_rdwarf);
	r = Math.random() * 0.020;
	val = val + (val * r);
	L2.intensity = val;	
	
	// Red dwarf
	cr = calc_val(c_red_rd);
	cg = 0.0;
	cb = calc_val(c_blue_rd);
	L2.color.r = cr;
	L2.color.g = cg;
	L2.color.b = cb;
	
	// White dwarf remnant
	val = calc_val(int_core_rd);
	r = Math.random() * 0.090;
	val = val + (val * r);
	L2_core.intensity = val;
	
	
	// -------------------------------- Next
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
	ctx.strokeStyle = "#FF0";
	ctx.lineWidth = 3.5;
	ctx.beginPath();
	
	wsc = ww / 1400.0;
	tpx0 = 53.0 * wsc;
	py0 = 60.0 * wsc;
	// Time speed
	n_frn = (frn / frn_max); // 0->1.0 in speed_f frames
	q = 1.0 - n_frn;
	mn = q * q * q * q * q;	
	fak = (1.0 - mn);	
	line_ww = 1278.0 * wsc;
	dx = line_ww * fak; //
	px = tpx0 + dx;	
	ntime = fak;
	
	y_ext = 15.0 * wsc;
	ctx.moveTo(px, py0 - y_ext);
	ctx.lineTo(px, py0 + y_ext + 1);
	ctx.stroke();
	
	if (debug_time) {
		str = "ntime: " + ntime + " m: " + mx;
		ctx.font = "20px Arial";
		ctx.fillText(str, 5, 22);
	}
		
	//// WebGL Canvas
	update(); // pos/rot = f(time)
	render();
	
	// Next frame
	requestAnimationFrame(draw);
}



draw();




