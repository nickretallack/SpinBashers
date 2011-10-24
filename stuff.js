(function() {
  var __slice = Array.prototype.slice;
  $(function() {
    var animate, camera, camera_radius, constraint_iterations, default_color, default_friction, default_size, do_sleep, gravity, index, joint, joint_definition, line, make_heap, make_level, make_line, make_square, max_angular_velocity, origin, player1, player2, player_friction, renderer, scene, sync_list, time_step, torque, update, variance, window_size, world, world_box, world_padder, world_padding, world_size;
    world_padder = V(world_padding, world_padding);
    origin = V(0, 0);
    window_size = function() {
      return V(innerWidth, innerHeight);
    };
    time_step = 1.0 / 60.0;
    constraint_iterations = 10;
    gravity = V(0.0, -10.0);
    player_friction = 20;
    default_friction = 5;
    torque = 50;
    max_angular_velocity = 10;
    default_size = V(1, 1);
    default_color = 0xff0000;
    world_size = V(2000, 2000);
    world_padding = 50;
    gravity = origin;
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
      var body, body_definition, color, dynamic, friction, geometry, material, mesh, position, result, shape, size;
      size = _arg.size, position = _arg.position, friction = _arg.friction, dynamic = _arg.dynamic, color = _arg.color;
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
            if (color != null) {
        color;
      } else {
        color = default_color;
      };
      geometry = (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return typeof result === "object" ? result : child;
      })(THREE.CubeGeometry, __slice.call(size.components()).concat([100]), function() {});
      material = new THREE.MeshBasicMaterial({
        color: color,
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
        body.linearDamping = 1.0;
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
    camera = new THREE.OrthographicCamera(-camera_radius, camera_radius, camera_radius, -camera_radius, -camera_radius, camera_radius);
    camera.position.z = camera_radius * 2;
    scene = new THREE.Scene();
    renderer = new THREE.CanvasRenderer();
    renderer.setSize(500, 500);
    document.body.appendChild(renderer.domElement);
    world_box = new b2AABB();
    world_box.lowerBound = world_size.scale(-1);
    world_box.upperBound = world_size;
    do_sleep = true;
    world = new b2World(world_box, gravity, do_sleep);
    player1 = make_square({
      position: V(-2, 2),
      color: 0x0000ff
    });
    player2 = make_square({
      position: V(2, -2)
    });
    joint_definition = new b2DistanceJointDef();
    joint_definition.Initialize(player1.body, player2.body, player1.body.GetPosition(), player2.body.GetPosition());
    joint = world.CreateJoint(joint_definition);
    variance = 30;
    for (index = 0; index <= 50; index++) {
      make_square({
        position: V(Math.random() * variance, Math.random() * variance),
        color: 0x00ff00
      });
    }
    make_line = function(point1, point2) {
      var geometry, material, mesh;
      geometry = new THREE.Geometry();
      geometry.vertices.push(new THREE.Vertex(point1.three()));
      geometry.vertices.push(new THREE.Vertex(point2.three()));
      material = new THREE.LineBasicMaterial({
        color: 0xbbbbbb,
        lineWidth: 5
      });
      mesh = new THREE.Line(geometry, material);
      mesh.dynamic = true;
      scene.add(mesh);
      return mesh;
    };
    line = make_line(player1.body.GetPosition(), player2.body.GetPosition());
    update = function() {
      var center, direction, force, item, player1_position, player2_position, tangent, _i, _len;
      force = 10;
      /*
              cardinals =
                  left:V(-1,0)
                  right:V(1,0)
                  up:V(0,1)
                  down:V(0,-1)
      
              for key, direction of cardinals
                  if pressed_keys[key]
                      player1.body.ApplyForce direction.scale(force), player1.body.GetPosition()
              */
      direction = player2.body.GetPosition().minus(player1.body.GetPosition()).normalize();
      if (pressed_keys.left) {
        tangent = V(-direction.y, direction.x);
        player2.body.ApplyForce(tangent.scale(force), player2.body.GetPosition());
      }
      if (pressed_keys.right) {
        tangent = V(direction.y, -direction.x);
        player2.body.ApplyForce(tangent.scale(force), player2.body.GetPosition());
      }
      world.Step(time_step, constraint_iterations);
      player1_position = player1.body.GetPosition();
      player2_position = player2.body.GetPosition();
      center = player1_position.plus(player2_position.minus(player1_position).scale(0.5));
      camera.position = center.three();
      for (_i = 0, _len = sync_list.length; _i < _len; _i++) {
        item = sync_list[_i];
        item.mesh.position = item.body.GetPosition().three();
        item.mesh.rotation.z = item.body.GetAngle();
      }
      line.geometry.vertices[0].position = player1.body.GetPosition().three();
      line.geometry.vertices[1].position = player2.body.GetPosition().three();
      line.geometry.__dirtyVertices = true;
      return renderer.render(scene, camera);
    };
    animate = function() {
      requestAnimationFrame(animate);
      return update();
    };
    return animate();
  });
}).call(this);
