var scene;
var camera;
var renderer;
var objects = [];
var bars = [];
var NB = 0;
var N = 5;
var _data;

function init() {

  // create scene
  scene = new THREE.Scene();

  // create camera with fov, aspect ratio, near and far plane
  camera = new THREE.PerspectiveCamera (70, window.innerWidth/window.innerHeight, 0.1, 50000);

  // default params
  renderer = new THREE.WebGLRenderer();
  renderer.setSize (window.innerWidth, window.innerHeight);
  document.body.appendChild (renderer.domElement);

  var geometry = new THREE.BoxGeometry(100,10,200);  
  var material = new THREE.MeshBasicMaterial({color: 0xffffff,
                                              opacity: 1.0});

  for (var i=0; i<N; i++) {
    var object = new THREE.Mesh(geometry, material);
    object.position.x = (-N/2)*200 + i*300;
    object.position.y = 0; 
    object.position.z = 0;

    object.scale.x = 1;
    object.scale.y = 1;
    object.scale.z = 1;
        
    object.rotation.x = 0;
    object.rotation.y = 0;
    object.rotation.z = 0;

    // store object for later use
    objects[i] = object;
    
    // add to scene
    scene.add(object);
  }
/*
  for (var i=0; i<NB; i++) {

    var object = new THREE.Mesh(geometry, material);
    object.position.x = -700+i*120;
    object.position.y = -250; 
    object.position.z = 0;

    object.scale.x = 1;
    object.scale.y = 1;
    object.scale.z = 1;
        
    object.rotation.x = 0;
    object.rotation.y = 0;
    object.rotation.z = 0;

    // store object for later use
    bars[i] = object;
    
    // add to scene
    scene.add(object);
  }
*/
}

// basic render loop
var render = function () {
  var time = performance.now();
  var R = 1000;
  phase = time*0.0001;

  var nKeys = 0;
  var keys = [];
  if (_data) {
    keys = Object.keys(_data)
    nKeys = keys.length;
  }

  for (var i=0; i<N; i++) {
    var rotX = 0;
    var rotY = 0;
    var rotZ = 0;

    var posx = 0;
    var posy = 0;
    var posz = 0;
    
    if (i<nKeys) {
      var dat = _data[keys[i]];
      rotY = dat.alpha*Math.PI*2 / 360;
      rotX = dat.beta*Math.PI*2 / 360;
      rotZ = -dat.gamma*Math.PI*2 / 360;

      posx = dat.posx % 10000 - 5000;
      posy = dat.posy % 10000 - 5000;
      posz = dat.posz;
    }

    objects[i].rotation.x = rotX;
    objects[i].rotation.y = rotY;
    objects[i].rotation.z = rotZ;

    var scl = 0.1;
    console.log(posx);
    
	objects[i].position.x = posx*scl;
    objects[i].position.y = 1000+posy*scl;
    objects[i].position.z = 0;//posz*scl;
 	
  }

  var yo = -250;
  var sc = 1;
  if (_data && false) {
    keys = Object.keys(_data)
    nKeys = keys.length;
    bars[0].position.y = yo + _data[keys[0]].ax;
    bars[1].position.y = yo + _data[keys[0]].ay;
    bars[2].position.y = yo + _data[keys[0]].az;
   
    bars[3].position.y = yo + _data[keys[0]].arAlpha;
    bars[4].position.y = yo + _data[keys[0]].arBeta;
    bars[5].position.y = yo + _data[keys[0]].arGamma;

    bars[6].position.y = yo + _data[keys[0]].velx;
    bars[7].position.y = yo + _data[keys[0]].vely;
    bars[8].position.y = yo + _data[keys[0]].velz;

    bars[9].position.y  = yo + _data[keys[0]].posx;
    bars[10].position.y = yo + _data[keys[0]].posy;
    bars[11].position.y = yo + _data[keys[0]].posz;
     
  }


  // move camera
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 1000;

  camera.lookAt (new THREE.Vector3 (0,0,0));
    
  requestAnimationFrame (render);
  renderer.render (scene, camera);
};
