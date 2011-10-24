$ ->
    world_padder = V world_padding, world_padding
    origin = V 0,0
    window_size = -> V innerWidth, innerHeight

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

    world_size = V 2000, 2000
    world_padding = 50
    gravity = origin

    force = 25

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
        
    make_heap = (location) ->
        size = 1
        elevation = 3
        for index in [0..10]
            make_square 
                position:V(location, index*2)

    make_level = ->
        make_heap 2

    sync_list = []

    make_square = ({size, position, friction, dynamic, color}) ->
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
    
    player1 = make_square
        position:V(-2, 2)
        color:0x0000ff
    player2 = make_square
        position:V(2, -2)
    
    joint_definition = new b2DistanceJointDef()
    joint_definition.Initialize player1.body, player2.body,
        player1.body.GetPosition(), player2.body.GetPosition()
    joint = world.CreateJoint joint_definition

    variance = 30
    for index in [0..50]
        make_square
            position:V((Math.random()-0.5)*variance, (Math.random()-0.5)*variance)
            color:0x00ff00

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

    line = make_line player1.body.GetPosition(), player2.body.GetPosition()


    update = ->
        for key, direction of cardinals
            if pressed_keys[player1_controls[key]]
                player1.body.ApplyForce direction.scale(force), player1.body.GetPosition()
            if pressed_keys[player2_controls[key]]
                player2.body.ApplyForce direction.scale(force), player2.body.GetPosition()
                        
        direction = player2.body.GetPosition().minus(player1.body.GetPosition()).normalize()
        if pressed_keys[player1_controls.clockwise]
            tangent = V -direction.y, direction.x
            player2.body.ApplyForce tangent.scale(force), player2.body.GetPosition()
        if pressed_keys[player1_controls.counter_clockwise]
            tangent = V direction.y, -direction.x
            player2.body.ApplyForce tangent.scale(force), player2.body.GetPosition()
        if pressed_keys[player2_controls.clockwise]
            tangent = V -direction.y, direction.x
            player1.body.ApplyForce tangent.scale(force), player1.body.GetPosition()
        if pressed_keys[player2_controls.counter_clockwise]
            tangent = V direction.y, -direction.x
            player1.body.ApplyForce tangent.scale(force), player1.body.GetPosition()

        world.Step time_step, constraint_iterations

        player1_position = player1.body.GetPosition()
        player2_position = player2.body.GetPosition()
        center = player1_position.plus player2_position.minus(player1_position).scale(0.5)
        camera.position = center.three()

        for item in sync_list
            item.mesh.position = item.body.GetPosition().three()
            item.mesh.rotation.z = item.body.GetAngle()

        line.geometry.vertices[0].position = player1.body.GetPosition().three()
        line.geometry.vertices[1].position = player2.body.GetPosition().three()
        line.geometry.__dirtyVertices = true

        renderer.render scene, camera

    animate = ->
        requestAnimationFrame animate
        update()

    animate()
