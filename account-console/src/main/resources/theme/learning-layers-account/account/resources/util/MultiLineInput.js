function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

//import React, { Fragment, useEffect } from "react";
import * as React from "../../../common/keycloak/web_modules/react.js";
import { useFieldArray, useFormContext, useWatch } from "../../../common/keycloak/web_modules/react-hook-form.js";
import { TextInput, Button, ButtonVariant, InputGroup } from "../../../common/keycloak/web_modules/@patternfly/react-core.js";
import { MinusCircleIcon, PlusCircleIcon } from "../../../common/keycloak/web_modules/@patternfly/react-icons.js";
export function convertToMultiline(fields) {
  return (fields && fields.length > 0 ? fields : [""]).map(field => {
    return {
      value: field
    };
  });
}
export function toValue(formValue) {
  return formValue?.map(field => field.value);
}
export const MultiLineInput = ({
  name,
  addButtonLabel,
  ...rest
}) => {
  const {
    register,
    control,
    reset
  } = useFormContext();
  const {
    fields,
    append,
    remove
  } = useFieldArray({
    name,
    control
  });
  const currentValues = useWatch({
    control,
    name
  });
  React.useEffect(() => {
    reset({
      [name]: [{
        value: ""
      }]
    });
  }, []);
  return React.createElement(React.Fragment, null, fields.map(({
    id,
    value
  }, index) => React.createElement(React.Fragment, {
    key: id
  }, React.createElement(InputGroup, null, React.createElement(TextInput, _extends({
    id: id,
    ref: register(),
    name: `${name}[${index}].value`,
    defaultValue: value
  }, rest)), React.createElement(Button, {
    variant: ButtonVariant.link,
    onClick: () => remove(index),
    tabIndex: -1,
    "aria-label": "remove",
    isDisabled: index === fields.length - 1
  }, React.createElement(MinusCircleIcon, null))), index === fields.length - 1 && React.createElement(Button, {
    variant: ButtonVariant.link,
    onClick: () => append({}),
    tabIndex: -1,
    "aria-label": "add",
    isDisabled: rest.isDisabled || !currentValues?.[index]?.value
  }, React.createElement(PlusCircleIcon, null), " ", 'add'))));
};
//# sourceMappingURL=MultiLineInput.js.map