(function() {
  var __slice = Array.prototype.slice;
  $(function() {
    var animate, camera, camera_radius, constraint_iterations, default_friction, default_size, do_sleep, gravity, make_heap, make_level, make_square, max_angular_velocity, origin, player, player_friction, player_start, renderer, scene, sync_list, time_step, torque, update, wall, window_size, world, world_box, world_padder, world_padding, world_size;
    world_size = V(2000, 100);
    world_padding = 50;
    world_padder = V(world_padding, world_padding);
    origin = V(0, 0);
    window_size = function() {
      return V(innerWidth, innerHeight);
    };
    player_start = V(5, 5);
    gravity = V(0.0, -10.0);
    player_friction = 20;
    default_friction = 5;
    torque = 50;
    max_angular_velocity = 10;
    default_size = V(1, 1);
    make_heap = function(location) {
      var elevation, index, size, _results;
      size = 1;
      elevation = 3;
      _results = [];
      for (index = 0; index <= 10; index++) {
        _results.push(make_square({
          position: V(location, index * 2)
        }));
      }
      return _results;
    };
    make_level = function() {
      return make_heap(2);
    };
    sync_list = [];
    make_square = function(_arg) {
      var body, body_definition, dynamic, friction, geometry, material, mesh, position, result, shape, size;
      size = _arg.size, position = _arg.position, friction = _arg.friction, dynamic = _arg.dynamic;
            if (size != null) {
        size;
      } else {
        size = default_size;
      };
            if (position != null) {
        position;
      } else {
        position = origin;
      };
            if (friction != null) {
        friction;
      } else {
        friction = default_friction;
      };
            if (dynamic != null) {
        dynamic;
      } else {
        dynamic = true;
      };
      geometry = (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return typeof result === "object" ? result : child;
      })(THREE.CubeGeometry, __slice.call(size.components()).concat([100]), function() {});
      material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true
      });
      mesh = new THREE.Mesh(geometry, material);
      mesh.position = position.three();
      scene.add(mesh);
      shape = new b2PolygonDef();
      shape.SetAsBox.apply(shape, size.scale(0.5).components());
      if (dynamic) {
        shape.density = 1.0;
        shape.friction = friction;
      }
      body_definition = new b2BodyDef();
      body_definition.position = position;
      body = world.CreateBody(body_definition);
      body.CreateShape(shape);
      if (dynamic) {
        body.SetMassFromShapes();
      }
      result = {
        mesh: mesh,
        geometry: geometry,
        material: material,
        shape: shape,
        body: body,
        body_definition: body_definition
      };
      sync_list.push(result);
      return result;
    };
    camera_radius = 10;
    camera = new THREE.OrthographicCamera(camera_radius, -camera_radius, camera_radius, -camera_radius, -camera_radius, camera_radius);
    camera.position.z = camera_radius * 2;
    scene = new THREE.Scene();
    renderer = new THREE.CanvasRenderer();
    renderer.setSize(500, 500);
    document.body.appendChild(renderer.domElement);
    world_box = new b2AABB();
    world_box.lowerBound = V(-1000.0, -1000.0);
    world_box.upperBound = V(1000.0, 1000.0);
    gravity = V(0.0, -10.0);
    do_sleep = true;
    world = new b2World(world_box, gravity, do_sleep);
    wall = make_square({
      size: V(500, 1),
      position: V(0, -5),
      dynamic: false
    });
    player = make_square({
      position: V(0, 0)
    });
    make_level();
    /*
        world_box.lowerBound = origin.minus world_padder
        world_box.upperBound = world_size.plus world_padder
        do_sleep = true
        world = new b2World world_box, gravity, do_sleep
        
        floor = make_square world_size.x, 1, origin.plus(V world_size.x,0).components()...
        player = make_square 1, 1, player_start.components()..., true
        make_level()
        */
    time_step = 1.0 / 60.0;
    constraint_iterations = 10;
    update = function() {
      var angular_velocity, item, _i, _len;
      angular_velocity = player.body.GetAngularVelocity();
      if (pressed_keys.right && angular_velocity < max_angular_velocity) {
        player.body.ApplyTorque(torque);
      }
      if (pressed_keys.left && angular_velocity > -max_angular_velocity) {
        player.body.ApplyTorque(-torque);
      }
      if (pressed_keys.space) {
        player.body.ApplyImpulse(V(10, 0), player.body.GetPosition());
      }
      world.Step(time_step, constraint_iterations);
      camera.position = player.body.GetPosition().three();
      for (_i = 0, _len = sync_list.length; _i < _len; _i++) {
        item = sync_list[_i];
        item.mesh.position = item.body.GetPosition().three();
        item.mesh.rotation.z = item.body.GetAngle();
      }
      return renderer.render(scene, camera);
    };
    animate = function() {
      requestAnimationFrame(animate);
      return update();
    };
    return animate();
  });
}).call(this);
