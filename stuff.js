(function() {
  $(function() {
    var animate, camera, constraint_iterations, do_sleep, gravity, make_square, player, renderer, scene, time_step, update, wall, world, world_box;
    make_square = function(width, height, x, y, dynamic) {
      var body, body_definition, geometry, material, mesh, shape;
      geometry = new THREE.CubeGeometry(width, height, 100);
      material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true
      });
      mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = x;
      mesh.position.y = y;
      scene.add(mesh);
      shape = new b2PolygonDef();
      shape.SetAsBox(width, height);
      if (dynamic) {
        shape.density = 1.0;
        shape.friction = 0.3;
      }
      body_definition = new b2BodyDef();
      body_definition.position.Set(x, y);
      body = world.CreateBody(body_definition);
      body.CreateShape(shape);
      if (dynamic) {
        body.SetMassFromShapes();
      }
      return {
        mesh: mesh,
        geometry: geometry,
        material: material,
        shape: shape,
        body: body,
        body_definition: body_definition
      };
    };
    camera = new THREE.OrthographicCamera(300, -300, 300, -300, 0, 300);
    camera.position.z = 300;
    scene = new THREE.Scene();
    renderer = new THREE.CanvasRenderer();
    renderer.setSize(300, 300);
    document.body.appendChild(renderer.domElement);
    world_box = new b2AABB();
    world_box.lowerBound.Set(-1000.0, -1000.0);
    world_box.upperBound.Set(1000.0, 1000.0);
    gravity = new b2Vec2(0.0, -10.0);
    do_sleep = false;
    world = new b2World(world_box, gravity, do_sleep);
    wall = make_square(500, 10, 0, -200);
    player = make_square(20, 20, 0, 200, true);
    time_step = 1.0 / 60.0;
    constraint_iterations = 10;
    update = function() {
      var position;
      world.Step(time_step, constraint_iterations);
      position = player.body.GetPosition();
      player.mesh.position.x = position.x;
      player.mesh.position.y = position.y;
      return renderer.render(scene, camera);
    };
    animate = function() {
      requestAnimationFrame(animate);
      return update();
    };
    return animate();
  });
}).call(this);
