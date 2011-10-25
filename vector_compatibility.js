(function() {
  var Vector, copy_methods, method, name, radians_factor, _ref;
  copy_methods = function(here, there) {
    var method, name, temp, _results;
    temp = {};
    for (name in here) {
      method = here[name];
      if (name === 'constructor') {
        continue;
      }
      temp[name] = method;
    }
    for (name in there) {
      method = there[name];
      if (name === 'constructor') {
        continue;
      }
      here[name] = method;
    }
    _results = [];
    for (name in temp) {
      method = temp[name];
      if (name === 'constructor') {
        continue;
      }
      _results.push(there[name] = method);
    }
    return _results;
  };
  radians_factor = Math.PI / 180.0;
  _ref = b2Vec2.prototype;
  for (name in _ref) {
    method = _ref[name];
    if (name === 'constructor') {
      continue;
    }
    THREE.Vector2.prototype[name] = method;
  }
  Vector = window.b2Vec2 = THREE.Vector2;
  Vector.prototype.components = function() {
    return [this.x, this.y];
  };
  Vector.prototype.scale = function(scalar) {
    return this.clone().multiplyScalar(scalar);
  };
  Vector.prototype.plus = function(other) {
    return this.clone().addSelf(other);
  };
  Vector.prototype.minus = function(other) {
    return this.plus(other.scale(-1));
  };
  Vector.prototype.three = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return typeof result === "object" ? result : child;
    })(THREE.Vector3, this.components(), function() {});
  };
  Vector.prototype.rotate = function(angle) {
    var result;
    result = this.clone();
    result.MulM(new b2Mat22(angle * radians_factor));
    return result;
  };
  window.V = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return typeof result === "object" ? result : child;
    })(Vector, arguments, function() {});
  };
}).call(this);
