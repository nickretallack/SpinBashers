copy_methods = (here, there) ->
    temp = {}
    for name, method of here
        continue if name == 'constructor'
        temp[name] = method
    for name, method of there
        continue if name == 'constructor'
        here[name] = method
    for name, method of temp
        continue if name == 'constructor'
        there[name] = method

#copy_methods b2Vec2.prototype, THREE.Vector2.prototype

radians_factor = Math.PI / 180.0

for name, method of b2Vec2.prototype
    continue if name == 'constructor'
    THREE.Vector2.prototype[name] = method

Vector = window.b2Vec2 = THREE.Vector2
Vector::components = -> [@x, @y]
Vector::scale = (scalar) -> @clone().multiplyScalar scalar
Vector::plus = (other) -> @clone().addSelf other
Vector::minus = (other) -> @plus other.scale -1
Vector::times = (other) -> @clone().er.scale -1
Vector::three = -> new THREE.Vector3 @components()...
Vector::rotate = (angle) ->
    result = @clone()
    result.MulM new b2Mat22 angle * radians_factor
    result

window.V = -> new Vector arguments...
