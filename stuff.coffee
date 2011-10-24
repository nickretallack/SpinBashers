$ ->
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

        mesh:mesh
        geometry:geometry
        material:material
        shape:shape
        body:body
        body_definition:body_definition

    # graphics
    camera_radius = 10
    camera = new THREE.OrthographicCamera camera_radius, -camera_radius,
         camera_radius, -camera_radius, -camera_radius, camera_radius
    camera.position.z = camera_radius * 2
    scene = new THREE.Scene()
    renderer = new THREE.CanvasRenderer()
    renderer.setSize 300, 300
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
        player.mesh.position = player.body.GetPosition().three()
        player.mesh.rotation.z = player.body.GetAngle()
        renderer.render scene, camera

    animate = ->
        requestAnimationFrame animate
        update()

    animate()
