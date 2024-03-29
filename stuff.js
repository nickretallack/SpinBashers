(function() {
  var __slice = Array.prototype.slice;
  $(function() {
    var animate, camera, camera_radius, cardinals, constraint_iterations, contact_listener, controls, crate_type, current_controls, damaging_impulse, default_color, default_friction, default_size, direction, do_sleep, dvorak_checkbox, force, force_angle, game_over, get_data, get_type, gravity, hit_this_frame, hurt_player, index, joint, joint_definition, line, make_heap, make_level, make_line, make_square, max_angular_velocity, name, origin, other_player, player1, player2, player_friction, player_type, players, renderer, scene, size, sync_list, time_step, torque, update, use_joint, window_size, world, world_box, world_padder, world_padding, world_size, _ref;
    world_padder = V(world_padding, world_padding);
    origin = V(0, 0);
    window_size = function() {
      return V(innerWidth, innerHeight);
    };
    _ref = [0, 1], player_type = _ref[0], crate_type = _ref[1];
    use_joint = true;
    time_step = 1.0 / 60.0;
    constraint_iterations = 10;
    gravity = V(0.0, -10.0);
    player_friction = 20;
    default_friction = 5;
    torque = 50;
    max_angular_velocity = 10;
    default_size = V(1, 1);
    default_color = 0xff0000;
    damaging_impulse = 2;
    force = 25;
    force_angle = 45;
    world_size = V(2000, 2000);
    world_padding = 50;
    gravity = origin;
    hit_this_frame = false;
    game_over = false;
    sync_list = [];
    cardinals = {
      left: V(-1, 0),
      right: V(1, 0),
      up: V(0, 1),
      down: V(0, -1)
    };
    dvorak_checkbox = $('#use_dvorak');
    if (localStorage.controls === 'dvorak') {
      current_controls = 'dvorak';
      dvorak_checkbox.attr('checked', 'checked');
    } else {
      current_controls = 'normal';
    }
    dvorak_checkbox.change(function(event) {
      return setTimeout(function() {
        var enabled;
        enabled = dvorak_checkbox.is(':checked');
        current_controls = enabled ? 'dvorak' : 'normal';
        return localStorage.controls = current_controls;
      });
    });
    controls = {
      dvorak: {
        player1: {
          left: 'left',
          right: 'right',
          down: 'down',
          up: 'up',
          clockwise: 'shift',
          counter_clockwise: 'z'
        },
        player2: {
          left: 'a',
          right: 'e',
          down: 'o',
          up: ',',
          clockwise: '.',
          counter_clockwise: '\''
        }
      },
      normal: {
        player1: {
          left: 'left',
          right: 'right',
          down: 'down',
          up: 'up',
          clockwise: 'shift',
          counter_clockwise: '/'
        },
        player2: {
          left: 'a',
          right: 'd',
          down: 's',
          up: 'w',
          clockwise: 'e',
          counter_clockwise: 'q'
        }
      }
    };
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
    hurt_player = function(player, damage) {
      var winner;
      player.hit_points -= damage;
      console.log("" + player.name + " was hit for " + damage + ". " + player.hit_points + " HP remaining. " + (Date()));
      $("#player" + player.which + "_hit_points").text(Math.round(player.hit_points));
      if (player.hit_points < 0) {
        winner = other_player(player);
        game_over = true;
        console.log("" + winner.name + " wins!");
        return $("#winner").text("" + winner.name + " wins!").addClass("player" + winner.which);
      }
    };
    make_square = function(_arg) {
      var body, body_definition, color, data, dynamic, friction, geometry, material, mesh, position, result, shape, size;
      size = _arg.size, position = _arg.position, friction = _arg.friction, dynamic = _arg.dynamic, color = _arg.color, data = _arg.data;
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
      body_definition.userData = data;
      body = world.CreateBody(body_definition);
      body.CreateShape(shape);
      if (dynamic) {
        body.SetMassFromShapes();
        body.m_linearDamping = 1;
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
    camera_radius = 10;
    camera = new THREE.OrthographicCamera(-camera_radius, camera_radius, camera_radius, -camera_radius, -camera_radius, camera_radius);
    camera.position.z = camera_radius * 2;
    scene = new THREE.Scene();
    renderer = new THREE.CanvasRenderer();
    renderer.setSize(500, 500);
    $("#game").append(renderer.domElement);
    world_box = new b2AABB();
    world_box.lowerBound = world_size.scale(-1);
    world_box.upperBound = world_size;
    do_sleep = true;
    world = new b2World(world_box, gravity, do_sleep);
    get_type = function(shape) {
      return shape.GetBody().GetUserData().type;
    };
    get_data = function(shape) {
      return shape.GetBody().GetUserData();
    };
    contact_listener = new b2ContactListener();
    contact_listener.Result = function(contact) {
      var player, player_data, shapes, type1, type2;
      if (contact.normalImpulse > damaging_impulse) {
        shapes = [contact.shape1, contact.shape2];
        shapes.sort(function(a, b) {
          return get_type(a) - get_type(b);
        });
        type1 = get_type(shapes[0]);
        type2 = get_type(shapes[1]);
        if (type1 === player_type && type2 === crate_type) {
          player_data = get_data(contact.shape1);
          player = player_data.which === 1 ? player1 : player2;
          hurt_player(player, contact.normalImpulse);
          return hit_this_frame = true;
        }
      }
    };
    world.SetContactListener(contact_listener);
    player1 = make_square({
      position: V(-2, 2),
      color: 0x0000ff,
      data: {
        type: player_type,
        which: 1
      }
    });
    player2 = make_square({
      position: V(2, -2),
      data: {
        type: player_type,
        which: 2
      }
    });
    player1.hit_points = player2.hit_points = 100;
    player1.name = "Blue Player";
    player2.name = "Red Player";
    player1.which = 1;
    player2.which = 2;
    players = [player1, player2];
    other_player = function(player) {
      if (player === players[0]) {
        return players[1];
      } else {
        return players[0];
      }
    };
    if (use_joint) {
      joint_definition = new b2DistanceJointDef();
      joint_definition.Initialize(player1.body, player2.body, player1.body.GetPosition(), player2.body.GetPosition());
      joint = world.CreateJoint(joint_definition);
    }
    world_size = 30;
    for (index = 0; index <= 50; index++) {
      make_square({
        position: V((Math.random() - 0.5) * world_size, (Math.random() - 0.5) * world_size),
        color: 0x00ff00,
        data: {
          type: crate_type
        }
      });
    }
    for (name in cardinals) {
      direction = cardinals[name];
      size = direction.x ? V(0.1, world_size) : V(world_size, 0.1);
      make_square({
        dynamic: false,
        position: direction.scale(world_size * 0.5),
        size: size,
        color: 0x00ff00,
        data: {
          type: crate_type
        }
      });
    }
    line = make_line(player1.body.GetPosition(), player2.body.GetPosition());
    update = function() {
      var center, direction, force_direction, item, key, player1_clockwise, player1_controls, player1_counter_clockwise, player1_direction, player1_position, player2_clockwise, player2_controls, player2_counter_clockwise, player2_position, _i, _len;
      if (game_over) {
        return;
      }
      player1_position = player1.body.GetPosition();
      player2_position = player2.body.GetPosition();
      player1_direction = player2_position.minus(player1_position).normalize();
      center = player1_position.plus(player2_position.minus(player1_position).scale(0.5));
      player1_controls = controls[current_controls].player1;
      player2_controls = controls[current_controls].player2;
      player1_clockwise = pressed_keys[player1_controls.clockwise];
      player2_clockwise = pressed_keys[player2_controls.clockwise];
      player1_counter_clockwise = pressed_keys[player1_controls.counter_clockwise];
      player2_counter_clockwise = pressed_keys[player2_controls.counter_clockwise];
      for (key in cardinals) {
        direction = cardinals[key];
        if (pressed_keys[player1_controls[key]]) {
          player1.body.ApplyForce(direction.scale(force), player1_position);
        }
        if (pressed_keys[player2_controls[key]]) {
          player2.body.ApplyForce(direction.scale(force), player2_position);
        }
      }
      if (player1_clockwise && !(player1_counter_clockwise || player2_clockwise)) {
        force_direction = player1_direction.scale(-1).rotate(force_angle);
        player2.body.ApplyForce(force_direction.scale(force), player2_position);
      }
      if (player1_counter_clockwise && !(player1_clockwise || player2_counter_clockwise)) {
        force_direction = player1_direction.scale(-1).rotate(-force_angle);
        player2.body.ApplyForce(force_direction.scale(force), player2_position);
      }
      if (player2_clockwise && !(player2_counter_clockwise || player1_clockwise)) {
        force_direction = player1_direction.rotate(force_angle);
        player1.body.ApplyForce(force_direction.scale(force), player1_position);
      }
      if (player2_counter_clockwise && !(player2_clockwise || player1_counter_clockwise)) {
        force_direction = player1_direction.rotate(-force_angle);
        player1.body.ApplyForce(force_direction.scale(force), player1_position);
      }
      hit_this_frame = false;
      world.Step(time_step, constraint_iterations);
      camera.position = center.three();
      for (_i = 0, _len = sync_list.length; _i < _len; _i++) {
        item = sync_list[_i];
        item.mesh.position = item.body.GetPosition().three();
        item.mesh.rotation.z = item.body.GetAngle();
      }
      line.geometry.vertices[0].position = player1_position.three();
      line.geometry.vertices[1].position = player2_position.three();
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
