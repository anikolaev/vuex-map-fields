(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global['vuex-map-fields'] = {})));
}(this, (function (exports) { 'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  function arrayToObject() {
    var fields = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    return fields.reduce(function (prev, path) {
      var key = path.split(".").slice(-1)[0];

      if (prev[key]) {
        throw new Error("The key `".concat(key, "` is already in use."));
      } // eslint-disable-next-line no-param-reassign


      prev[key] = path;
      return prev;
    }, {});
  }

  function normalizeNamespace(fn) {
    return function () {
      for (var _len = arguments.length, params = new Array(_len), _key = 0; _key < _len; _key++) {
        params[_key] = arguments[_key];
      }

      // eslint-disable-next-line prefer-const
      var _ref = typeof params[0] === "string" ? params.concat() : [""].concat(params),
          _ref2 = _slicedToArray(_ref, 4),
          namespace = _ref2[0],
          map = _ref2[1],
          getterType = _ref2[2],
          mutationType = _ref2[3];

      if (namespace.length && namespace.charAt(namespace.length - 1) !== "/") {
        namespace += "/";
      }

      getterType = "".concat(namespace).concat(getterType || "getField");
      mutationType = "".concat(namespace).concat(mutationType || "updateField");
      return fn(namespace, map, getterType, mutationType);
    };
  }

  function getField(state) {
    return function (path) {
      if (path == '') {
        return state;
      } else {
        return path.split(/[.[\]]+/).reduce(function (prev, key) {
          return prev[key];
        }, state);
      }
    };
  }
  function updateField(state, _ref3) {
    var path = _ref3.path,
        value = _ref3.value;
    path.split(/[.[\]]+/).reduce(function (prev, key, index, array) {
      if (array.length === index + 1) {
        // eslint-disable-next-line no-param-reassign
        prev[key] = value;
      }

      return prev[key];
    }, state);
  }
  var mapFields = normalizeNamespace(function (namespace, fields, getterType, mutationType) {
    var fieldsObject = Array.isArray(fields) ? arrayToObject(fields) : fields;
    return Object.keys(fieldsObject).reduce(function (prev, key) {
      var path = fieldsObject[key];
      var field = {
        get: function get() {
          return this.$store.getters[getterType](path);
        },
        set: function set(value) {
          this.$store.commit(mutationType, {
            path: path,
            value: value
          });
        }
      }; // eslint-disable-next-line no-param-reassign

      prev[key] = field;
      return prev;
    }, {});
  });
  var mapMultiRowFields = normalizeNamespace(function (namespace, paths, getterType, mutationType) {
    var pathsObject = Array.isArray(paths) ? arrayToObject(paths) : paths;
    return Object.keys(pathsObject).reduce(function (entries, key) {
      var path = pathsObject[key]; // eslint-disable-next-line no-param-reassign

      entries[key] = {
        get: function get() {
          var store = this.$store;
          var rows = store.getters[getterType](path);
          return rows.map(function (fieldsObject, index) {
            return Object.keys(fieldsObject).reduce(function (prev, fieldKey) {
              var fieldPath = "".concat(path, "[").concat(index, "].").concat(fieldKey);
              return Object.defineProperty(prev, fieldKey, {
                get: function get() {
                  return store.getters[getterType](fieldPath);
                },
                set: function set(value) {
                  store.commit(mutationType, {
                    path: fieldPath,
                    value: value
                  });
                }
              });
            }, {});
          });
        }
      };
      return entries;
    }, {});
  });
  var mapObjectFields = normalizeNamespace(function (namespace, paths, getterType, mutationType) {
    var pathsObject = Array.isArray(paths) ? arrayToObject(paths) : paths;
    return Object.keys(pathsObject).reduce(function (entries, key) {
      var path = pathsObject[key].replace(/\.?\*/g, ''); // eslint-disable-next-line no-param-reassign

      entries[key] = {
        get: function get() {
          var store = this.$store;
          var fieldsObject = store.getters[getterType](path);

          if (!fieldsObject) {
            return {};
          }

          return Object.keys(fieldsObject).reduce(function (prev, fieldKey) {
            var fieldPath = path ? "".concat(path, ".").concat(fieldKey) : fieldKey;
            return Object.defineProperty(prev, fieldKey, {
              get: function get() {
                return store.getters[getterType](fieldPath);
              },
              set: function set(value) {
                store.commit(mutationType, {
                  path: fieldPath,
                  value: value
                });
              }
            });
          }, {});
        }
      };
      return entries;
    }, {});
  });
  var createHelpers = function createHelpers(_ref4) {
    var _ref5;

    var getterType = _ref4.getterType,
        mutationType = _ref4.mutationType;
    return _ref5 = {}, _defineProperty(_ref5, getterType, getField), _defineProperty(_ref5, mutationType, updateField), _defineProperty(_ref5, "mapFields", normalizeNamespace(function (namespace, fields) {
      return mapFields(namespace, fields, getterType, mutationType);
    })), _defineProperty(_ref5, "mapMultiRowFields", normalizeNamespace(function (namespace, paths) {
      return mapMultiRowFields(namespace, paths, getterType, mutationType);
    })), _defineProperty(_ref5, "mapObjectFields", normalizeNamespace(function (namespace, paths) {
      return mapObjectFields(namespace, paths, getterType, mutationType);
    })), _ref5;
  };

  exports.getField = getField;
  exports.updateField = updateField;
  exports.mapFields = mapFields;
  exports.mapMultiRowFields = mapMultiRowFields;
  exports.mapObjectFields = mapObjectFields;
  exports.createHelpers = createHelpers;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
