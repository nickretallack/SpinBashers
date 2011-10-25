$ ->
    world_padder = V world_padding, world_padding
    origin = V 0,0
    window_size = -> V innerWidth, innerHeight

    [player_type, crate_type] = [0..1]

    use_joint = true
    use_dvorak = true
    time_step = 1.0/60.0
    constraint_iterations = 10
    gravity = V 0.0, -10.0
    player_friction = 20
    default_friction = 5
    torque = 50
    max_angular_velocity = 10
    default_size = V 1,1
    default_color = 0xff0000
    damaging_impulse = 2
    force = 25
    force_angle = 45

    world_size = V 2000, 2000
    world_padding = 50
    gravity = origin

    hit_this_frame = false
    game_over = false

    cardinals =
        left:V(-1,0)
        right:V(1,0)
        up:V(0,1)
        down:V(0,-1)

    if use_dvorak
        player1_controls =
            left:'left'
            right:'right'
            down:'down'
            up:'up'
            clockwise:'shift'
            counter_clockwise:'z'
        player2_controls =
            left:'a'
            right:'e'
            down:'o'
            up:','
            clockwise:'.'
            counter_clockwise:'\''
    else
        player1_controls =
            left:'left'
            right:'right'
            down:'down'
            up:'up'
            clockwise:'shift'
            counter_clockwise:'/'
        player2_controls =
            left:'a'
            right:'d'
            down:'o'
            up:'w'
            clockwise:'e'
            counter_clockwise:'q'

    end_game = (winner) ->
        console.log "Player #{winner} wins!"
        game_over = true
        
    make_heap = (location) ->
        size = 1
        elevation = 3
        for index in [0..10]
            make_square
                position:V(location, index*2)

    make_level = ->
        make_heap 2

    sync_list = []

    make_square = ({size, position, friction, dynamic, color, data}) ->
        size ?= default_size
        position ?= origin
        friction ?= default_friction
        dynamic ?= true
        color ?= default_color

        geometry = new THREE.CubeGeometry size.components()..., 100
        material = new THREE.MeshBasicMaterial color:color, wireframe:true
        mesh = new THREE.Mesh geometry, material
        mesh.position = position.three()
        scene.add mesh

        shape = new b2PolygonDef()
        shape.SetAsBox size.scale(0.5).components()...
        if dynamic
            shape.density = 1.0
            shape.friction = friction
        body_definition = new b2BodyDef()
        body_definition.position = position
        if name?
            body_definition.userData = data

        body = world.CreateBody body_definition
        body.CreateShape shape
        if dynamic
            body.SetMassFromShapes()
            body.m_linearDamping = 1

        result =
            mesh:mesh
            geometry:geometry
            material:material
            shape:shape
            body:body
            body_definition:body_definition
        sync_list.push result
        result

    make_line = (point1, point2) ->
        geometry = new THREE.Geometry()
        geometry.vertices.push new THREE.Vertex point1.three()
        geometry.vertices.push new THREE.Vertex point2.three()
        material = new THREE.LineBasicMaterial
            color:0xbbbbbb
            lineWidth:5
        mesh = new THREE.Line geometry, material
        mesh.dynamic = true
        scene.add mesh
        mesh

    # graphics
    camera_radius = 10
    camera = new THREE.OrthographicCamera -camera_radius, camera_radius,
         camera_radius, -camera_radius, -camera_radius, camera_radius
    camera.position.z = camera_radius * 2
    scene = new THREE.Scene()
    renderer = new THREE.CanvasRenderer()
    renderer.setSize 500, 500 #window.innerWidth, window.innerHeight
    #renderer.setSize window.innerWidth, window.innerHeight
    document.body.appendChild renderer.domElement

    # physics
    world_box = new b2AABB()
    world_box.lowerBound = world_size.scale(-1)
    world_box.upperBound = world_size
    do_sleep = true
    world = new b2World world_box, gravity, do_sleep

    get_type = (shape) -> shape.GetBody().GetUserData().type
    get_data = (shape) -> shape.GetBody().GetUserData()

    # contact listener
    contact_listener = new b2ContactListener()
    contact_listener.Result = (contact) ->
        if contact.normalImpulse > damaging_impulse
            shapes = [contact.shape1, contact.shape2]
            shapes.sort (a,b) -> get_type(a) - get_type(b)
            type1 = get_type shapes[0]
            type2 = get_type shapes[1]

            if type1 is player_type and type2 is crate_type
                player_data = get_data contact.shape1
                player = if player_data.which is 1 then player1 else player2
                player.hit_points -= contact.normalImpulse
                console.log "Player #{player_data.which} was hit for #{contact.normalImpulse}. #{player.hit_points} HP remaining. #{Date()}"
                if player.hit_points < 0
                    end_game player_data.which
                hit_this_frame = true

    world.SetContactListener contact_listener
    
    player1 = make_square
        position:V(-2, 2)
        color:0x0000ff
        data:
            type:player_type
            which:1
    player2 = make_square
        position:V(2, -2)
        data:
            type:player_type
            which:2

    player1.hit_points = player2.hit_points = 50
    
    if use_joint
        joint_definition = new b2DistanceJointDef()
        joint_definition.Initialize player1.body, player2.body,
            player1.body.GetPosition(), player2.body.GetPosition()
        joint = world.CreateJoint joint_definition

    variance = 30
    for index in [0..50]
        make_square
            position:V((Math.random()-0.5)*variance, (Math.random()-0.5)*variance)
            color:0x00ff00
            data:
                type:crate_type

    line = make_line player1.body.GetPosition(), player2.body.GetPosition()

    update = ->
        return if game_over
        player1_position = player1.body.GetPosition()
        player2_position = player2.body.GetPosition()
        player1_direction = player2_position.minus(player1_position).normalize()
        center = player1_position.plus player2_position.minus(player1_position).scale(0.5)

        player1_clockwise = pressed_keys[player1_controls.clockwise]
        player2_clockwise = pressed_keys[player2_controls.clockwise]
        player1_counter_clockwise = pressed_keys[player1_controls.counter_clockwise]
        player2_counter_clockwise = pressed_keys[player2_controls.counter_clockwise]

        for key, direction of cardinals
            if pressed_keys[player1_controls[key]]
                player1.body.ApplyForce direction.scale(force), player1_position
            if pressed_keys[player2_controls[key]]
                player2.body.ApplyForce direction.scale(force), player2_position
                        
        if player1_clockwise and not (player1_counter_clockwise or player2_clockwise)
            force_direction = player1_direction.scale(-1).rotate force_angle
            player2.body.ApplyForce force_direction.scale(force), player2_position

        if player1_counter_clockwise and not (player1_clockwise or player2_counter_clockwise)
            force_direction = player1_direction.scale(-1).rotate -force_angle
            player2.body.ApplyForce force_direction.scale(force), player2_position

        if player2_clockwise and not (player2_counter_clockwise or player1_clockwise)
            force_direction = player1_direction.rotate force_angle
            player1.body.ApplyForce force_direction.scale(force), player1_position

        if player2_counter_clockwise and not (player2_clockwise or player1_counter_clockwise)
            force_direction = player1_direction.rotate -force_angle
            player1.body.ApplyForce force_direction.scale(force), player1_position

        hit_this_frame = false
        world.Step time_step, constraint_iterations

        camera.position = center.three()

        for item in sync_list
            item.mesh.position = item.body.GetPosition().three()
            item.mesh.rotation.z = item.body.GetAngle()

        line.geometry.vertices[0].position = player1_position.three()
        line.geometry.vertices[1].position = player2_position.three()
        line.geometry.__dirtyVertices = true

        renderer.render scene, camera

    animate = ->
        requestAnimationFrame animate
        update()

    animate()
