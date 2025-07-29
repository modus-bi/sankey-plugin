import _ from 'lodash';

export function getVariablesCopyListByFieldAlias({ components, fieldAlias }) {
  let variablesCopyList = [];
  _.forEach(components, (component) => {
    const filterAxis = _.find(((component || {}).config || {}).axes, ['type', 'filters']);
    const field = _.find((filterAxis || {}).fields, (field_) => {
      return (field_.alias || field_.name) === fieldAlias;
    });
    const copyList = (((component || {}).config || {}).variablesCopyLists || {})[(field || {}).id];
    if (copyList) {
      variablesCopyList = _.concat(variablesCopyList, copyList);
    }
  });
  return _.uniq(variablesCopyList);
}

export function getRangeVariables({ variablesCopyList, settings }) {
  const variables = {};

  _.forEach(variablesCopyList, (variableItem) => {
    const variableName = (variableItem.value || '').toLowerCase();

    let enabled = !(settings.cons[0] || {}).disabled;
    let value = (settings.cons[0] || {}).value;
    if (enabled) {
      variables[variableName] = { value: [value] };
      variables[variableName + '.begin'] = { value: [value] };
    }

    enabled = !(settings.cons[1] || {}).disabled;
    value = (settings.cons[1] || {}).value;
    if (enabled) {
      variables[variableName + '.end'] = { value: [value] };
    }
  });

  return variables;
}

export function getVariablesForSettings({ components, fieldAlias, selected }) {
  const variablesCopyList = getVariablesCopyListByFieldAlias({
    components,
    fieldAlias,
  });
  const settings = selected ? { selected } : {};
  return getVariables({
    variablesCopyList,
    settings,
  });
}

export function getVariables({ variablesCopyList, settings }) {
  if (settings.filterMode === 'by range' || settings.command === 'setCons') {
    return getRangeVariables({ variablesCopyList, settings });
  }

  let selected;
  if (settings.all) {
    selected = _.filter(settings.all, (value) => {
      return !(settings.unselected || []).includes(value);
    });
  } else {
    selected = settings.selected;
  }

  const variables = {};
  _.forEach(variablesCopyList, (variableItem) => {
    variables[variableItem.value] = { value: selected };
  });

  return variables;
}
