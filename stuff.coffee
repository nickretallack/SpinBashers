$ ->
    world_size = V 2000, 100
    world_padding = 50
    world_padder = V world_padding, world_padding
    origin = V 0,0
    window_size = -> V innerWidth, innerHeight
    player_start = V 5,5
    gravity = V 0.0, -10.0

    make_heap = (location) ->
        size = 1
        elevation = 3
        for index in [0..10]
            make_square V(size, size), V(location, index*2), true

    make_level = ->
        make_heap 2

    sync_list = []

    make_square = (size, position, dynamic) ->
        geometry = new THREE.CubeGeometry size.components()..., 100
        material = new THREE.MeshBasicMaterial color:0xff0000, wireframe:true
        mesh = new THREE.Mesh geometry, material
        mesh.position = position.three()
        scene.add mesh

        shape = new b2PolygonDef()
        shape.SetAsBox size.scale(0.5).components()...
        if dynamic
            shape.density = 1.0
            shape.friction = 0.3
        body_definition = new b2BodyDef()
        body_definition.position = position

        body = world.CreateBody body_definition
        body.CreateShape shape
        if dynamic
            body.SetMassFromShapes()

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
    camera = new THREE.OrthographicCamera camera_radius, -camera_radius,
         camera_radius, -camera_radius, -camera_radius, camera_radius
    camera.position.z = camera_radius * 2
    scene = new THREE.Scene()
    renderer = new THREE.CanvasRenderer()
    renderer.setSize 500, 500 #window.innerWidth, window.innerHeight
    #renderer.setSize window.innerWidth, window.innerHeight
    document.body.appendChild renderer.domElement

    # physics
    world_box = new b2AABB()
    world_box.lowerBound = V -1000.0, -1000.0
    world_box.upperBound = V 1000.0, 1000.0
    gravity = V 0.0, -10.0
    do_sleep = true
    world = new b2World world_box, gravity, do_sleep
    
    wall = make_square V(500, 1), V(0, -5)
    player = make_square V(1, 1), V(0, 0), true
    make_level()

    ###
    world_box.lowerBound = origin.minus world_padder
    world_box.upperBound = world_size.plus world_padder
    do_sleep = true
    world = new b2World world_box, gravity, do_sleep
    
    floor = make_square world_size.x, 1, origin.plus(V world_size.x,0).components()...
    player = make_square 1, 1, player_start.components()..., true
    make_level()
    ###

    time_step = 1.0/60.0
    constraint_iterations = 10


    update = ->
        torque = 8
        if pressed_keys.right
            player.body.ApplyTorque torque
            #player.body.ApplyForce new b2Vec2(-10,0), player.body.GetPosition()
        if pressed_keys.left
            player.body.ApplyTorque -torque
            #player.body.ApplyForce new b2Vec2(10,0), player.body.GetPosition()

        world.Step time_step, constraint_iterations

        camera.position = player.body.GetPosition().three()

        for item in sync_list
            item.mesh.position = item.body.GetPosition().three()
            item.mesh.rotation.z = item.body.GetAngle()

        renderer.render scene, camera

    animate = ->
        requestAnimationFrame animate
        update()

    animate()
