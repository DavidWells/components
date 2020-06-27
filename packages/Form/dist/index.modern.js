import React from 'react';
import getFormData from 'get-form-data';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

var AutoForm = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(AutoForm, _React$Component);

  function AutoForm() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _this._onChange = function (e) {
      var _e$target = e.target,
          form = _e$target.form,
          name = _e$target.name;
      var data = getFormData.getFieldData(form, name, {
        trim: _this.props.trim
      });
      var change = {};
      change[name] = data;

      _this.props.onChange(e, name, data, change);
    };

    _this._onSubmit = function (e) {
      var data = getFormData(e.target, {
        trim: _this.props.trimOnSubmit || _this.props.trim
      });

      _this.props.onSubmit(e, data);
    };

    return _this;
  }

  var _proto = AutoForm.prototype;

  _proto.render = function render() {
    var _this$props = this.props,
        children = _this$props.children,
        Component = _this$props.component,
        onChange = _this$props.onChange,
        onSubmit = _this$props.onSubmit,
        props = _objectWithoutPropertiesLoose(_this$props, ["children", "component", "onChange", "onSubmit", "trim", "trimOnSubmit"]);

    return /*#__PURE__*/React.createElement(Component, _extends({}, props, {
      children: children,
      onChange: onChange && this._onChange,
      onSubmit: onSubmit && this._onSubmit
    }));
  };

  return AutoForm;
}(React.Component);

AutoForm.defaultProps = {
  component: 'form',
  trim: false,
  trimOnSubmit: false
};

function fixScroll() {
  this.scrollIntoView(false);
}

function grabNodes(node) {
  return node.querySelectorAll('input,select,textarea');
}

var Form = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(Form, _React$Component);

  function Form() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _this.handleSubmit = function (event, data) {
      var onSubmit = _this.props.onSubmit;
      event.preventDefault();

      if (onSubmit) {
        onSubmit(event, data);
      }
    };

    return _this;
  }

  var _proto = Form.prototype;

  _proto.componentDidMount = function componentDidMount() {
    var inputNodes = grabNodes(node);

    for (var i = 0; i < inputNodes.length; i++) {
      inputNodes[i].addEventListener('invalid', fixScroll);
    }
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    var inputNodes = grabNodes(node);

    for (var i = 0; i < inputNodes.length; i++) {
      inputNodes[i].removeEventListener('invalid', fixScroll);
    }
  };

  _proto.render = function render() {
    var _this2 = this;

    var _this$props = this.props,
        id = _this$props.id,
        onChange = _this$props.onChange,
        trimOnSubmit = _this$props.trimOnSubmit,
        children = _this$props.children,
        name = _this$props.name,
        rest = _objectWithoutPropertiesLoose(_this$props, ["id", "onChange", "trimOnSubmit", "children", "name"]);

    return /*#__PURE__*/React.createElement("div", {
      ref: function ref(node) {
        _this2.node = node;
      }
    }, /*#__PURE__*/React.createElement(AutoForm, _extends({
      name: name,
      id: id,
      trimOnSubmit: trimOnSubmit,
      onChange: onChange,
      onSubmit: this.handleSubmit
    }, rest), children));
  };

  return Form;
}(React.Component);

export default Form;
//# sourceMappingURL=index.modern.js.map
