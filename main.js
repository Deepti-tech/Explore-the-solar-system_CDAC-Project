import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import * as dat from 'dat.gui'
import {OrbitControls} from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap' 

const raycaster = new THREE.Raycaster()
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()

renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild(renderer.domElement)

// const boxGeometry = new THREE.BoxGeometry(1,1,1)
// const material = new THREE.MeshBasicMaterial({color: 0x00FFFF})
// const boxMesh = new THREE.Mesh(boxGeometry, material)
// scene.add(boxMesh)

const gui = new dat.GUI()
const world = {
  plane:{width:10, height:10, widthSegments:10, heightSegments:10, rotation: 0}
}

var planeGeometry = new THREE.PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegments, world.plane.heightSegments)
var planeMaterial = new THREE.MeshPhongMaterial({
  // color: 0xff0000, 
  side: THREE.DoubleSide,
  flatShading: 1,
  vertexColors: true
})
var planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
const colors = []
for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
  colors.push(1,0.3,0.3)
}
planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
scene.add(planeMesh)

new OrbitControls (camera, renderer.domElement)
camera.position.z = 10

var {array} = planeMesh.geometry.attributes.position
for (let i = 0; i < array.length; i+=3) {
  array[i] += Math.random()
  array[i+1] += Math.random()
  array[i+2] += Math.random()
}

gui.add(world.plane, 'width', 1, 20).onChange(generatePlane)
gui.add(world.plane, 'height', 1, 20).onChange(generatePlane)
gui.add(world.plane, 'widthSegments', 1, 20).onChange(generatePlane)
gui.add(world.plane, 'heightSegments', 1, 20).onChange(generatePlane)
gui.add(world.plane, 'rotation', 0, 0.01).onChange(animate)

const light = new THREE.DirectionalLight(0xFFFFFF, 1)
light.position.set(0,1,1)
scene.add(light)

const backLight = new THREE.DirectionalLight(0xffffff, 1)
backLight.position.set(0, 1, -1)
scene.add (backLight)

function generatePlane(){
  planeMesh.geometry.dispose()
  planeMesh.geometry = new THREE.PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegments, world.plane.heightSegments)
  var {array} = planeMesh.geometry.attributes.position
  for (let i = 0; i < array.length; i+=3) {
    array[i+2] += Math.random()
  }
  planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
  // const randomValues = []
  // for (let i = 0; i < array.length; i++) {
  //   if (i % 3 === 0) {
  //     const x = array[i]
  //     const y = array[i+1]
  //     const z = array[i + 2]
  //     array[i] = x + (Math.random() - 0.5)*0.3
  //     array[i+1] = y + (Math.random() - 0.5)*0.3
  //     array[i+2] = z + (Math.random() - 0.5)*0.3
  //   }
  // randomValues.push(Math.random()*Math.PI * 2)
  // }
  // planeMesh.geometry.attributes.position.randomValues = randomValues
  // planeMesh.geometry.attributes.position.originalPosition = planeMesh.geometry.attributes.position.array
}

const mouse = {
  x: undefined, y: undefined
}
addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX/innerWidth)*2-1
  mouse.y = -(event.clientY/innerHeight)*2+1
  console.log(mouse)
})

let frame = 0
function animate(){
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
  // boxMesh.rotation.x += 0.01
  // boxMesh.rotation.y += 0.01
  planeMesh.rotation.x += world.plane.rotation
  planeMesh.rotation.y += world.plane.rotation

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObject(planeMesh)
  // frame += 0.01
  // const {array, originalPosition, randomValues} = planeMesh.geometry.attributes.position
  // for (let i = 0; i < array.length; i+=3) {
  //   // x
  //   array[i] = originalPosition[i] + Math.cos(frame + randomValues[i])* 0.003
  //   // y
  //   array[i+1] = originalPosition[i+1] + Math.sin(frame + randomValues[i+1])* 0.003
  // }
  planeMesh.geometry.attributes.position.needsUpdate = true
  if(intersects.length > 0){
    const {color} = intersects[0].object.geometry.attributes
    const initialColor = {r:1, g:0, b:0}
    const hoverColor = {r:1, g:1, b:0.7}
    gsap.to(hoverColor, {r: initialColor.r ,g: initialColor.g ,b: initialColor.b,
      onUpdate: () => {
        color.setX(intersects[0].face.a, hoverColor.r)
        color.setY(intersects[0].face.a, hoverColor.g)
        color.setZ(intersects[0].face.a, hoverColor.b)

        color.setX(intersects[0].face.b, hoverColor.r)
        color.setY(intersects[0].face.b, hoverColor.g)
        color.setZ(intersects[0].face.b, hoverColor.b)

        color.setX(intersects[0].face.c, hoverColor.r)
        color.setY(intersects[0].face.c, hoverColor.g)
        color.setZ(intersects[0].face.c, hoverColor.b)
        color.needsUpdate=true
      }
    })
  }
}

animate()