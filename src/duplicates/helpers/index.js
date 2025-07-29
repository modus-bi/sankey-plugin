import _ from 'lodash';
import i18n from 'i18next';

export function getIsPinned({ field, categoryField }) {
  return (
    !field.pinToDrill || _.isEmpty(field.pinToDrill) || (field.pinToDrill || []).includes((categoryField || {}).id)
  );
}

export function getQueryObjectVariables({ variables }) {
  const vars = [];
  _.forEach(variables, (variableItem, variableName) => {
    vars.push({
      name: variableName,
      values: variableItem.value,
    });
  });
  return vars;
}

export function getCategoryField({ config }) {
  const categoriesAxe = _.find(config.axes, ['type', 'categories']);
  return ((categoriesAxe || {}).fields || {})[(categoriesAxe || {}).selectedFieldIndex || 0];
}

export function getLocalArray(arr, field) {
  return _.map(arr, (row) => {
    return { ...row, [field]: localizeExcludingDots(row[field]) };
  });
}

export function localizeExcludingDots(value) {
  const valueArray = value.split('.');
  return i18n.t(valueArray[0]);
}

export function getLocal(item, property, noDefault) {
  if (!item) return '';
  let language = i18n.language;
  if (!i18n.language) {
    language = 'ru';
  }
  const value = item[property + '__' + language];

  if (noDefault) {
    return value;
  }

  return _.isUndefined(value) ? item[property] : value + '';
}

export function getTitle(field) {
  return field['title__' + i18n.language] || field.title || '';
}

export function getDescription(config) {
  return getLocal(config, 'description') || config.description || '';
}

export function hsQuote(str) {
  if (_.isEmpty(str)) {
    return str;
  }
  return (str + '').replace(/!hs_quote!/g, "'");
}

export function getColorset(reportOptions, palette) {
  const activeColorset = reportOptions.defaultColorset
    ? _.cloneDeep(_.find(palette.chartColorSets, ['name', reportOptions.defaultColorset]) || {})
    : _.cloneDeep(_.find(palette.chartColorSets, 'options.default') || {});
  _.merge(activeColorset.colors, reportOptions.colorsetOverrides);
  const colorsetColors = _.sortBy(activeColorset.colors || [], 'options.order').map((o) => o.value);
  let colorset = [];
  for (let i = 0; i < 10; i += 1) {
    colorset = colorset.concat(colorsetColors);
  }
  return colorset;
}

export function hasDrill(config) {
  return !_.isEmpty(((config || {}).drill || {}).hierarchy);
}

export function isFilterMode(config) {
  if (hasDrill(config)) {
    return false;
  }
  return config.filterMode;
}

export function getPartsParent(name) {
  const delim = '$!$';
  const idx = name.indexOf(delim);
  return idx > 0 ? name.substr(0, idx) : name;
}

export function getPartsExpression(name) {
  if (!name) {
    return;
  }
  const delim = '$!$';
  const idx = name.indexOf(delim);
  return idx > 0 ? name.substr(idx + delim.length) : `"${name}"`;
}

export const getHasTooltipField = (config) => {
  const valuesAxe = _.find(config.axes, ['type', 'values']);
  const categoriesAxe = _.find(config.axes, ['type', 'categories']);
  const seriesAxe = _.find(config.axes, ['type', 'series']);
  return (
    !!_.find((valuesAxe || {}).fields, ['valueType', 'tooltip']) ||
    !!_.find((categoriesAxe || {}).fields, (field) => !!field.tooltipBy) ||
    !!_.find((seriesAxe || {}).fields, (field) => !!field.tooltipBy)
  );
};

/**
 * Возвращаем поля которые участвуют в определении порядка сортировки
 * @param configDraft
 * @returns {Array}
 */
export const getOrderedFields = (configDraft) => {
  let orderedFields = [];

  const valuesAxe = _.find(configDraft.axes, ['type', 'values']);
  if (valuesAxe) {
    _.forEach(valuesAxe.fields, (field) => {
      field.order && orderedFields.push(field);
    });
  }

  const categoriesAxe = _.find(configDraft.axes, ['type', 'categories']);
  if (categoriesAxe) {
    _.forEach(categoriesAxe.fields, (field) => {
      field.order && orderedFields.push(field);
    });
  }

  const seriesAxe = _.find(configDraft.axes, ['type', 'series']);
  if (seriesAxe) {
    _.forEach(seriesAxe.fields, (field) => {
      field.order && orderedFields.push(field);
    });
  }

  return orderedFields;
};

/**
 * очищаем порядок сортировки у всех полей кроме тех, которые активны && имеют сортировку
 * @param config
 */
export const clearNotOrderedFieldsOrderIndex = (config) => {
  // очищаем порядки сортировки у полей без сортировки
  _.forEach(config.axes, (axe) => {
    _.forEach(axe.fields, (field) => {
      if (field.orderIndex && !field.order) {
        delete field.orderIndex;
      }
    });
  });

  // очищаем порядки сортировки, превышающие максимальный
  const orderedFields = getOrderedFields(config);
  _.forEach(config.axes, (axe) => {
    _.forEach(axe.fields, (field) => {
      if (field.orderIndex > orderedFields.length) {
        field.orderIndex = null;
      }
    });
  });
};

export const shiftOrderIndex = (configNew, fieldNew) => {
  const orderedFields = getOrderedFields(configNew);

  // если поле активное, то сдвигаем совпадающие порядки вниз
  if (_.find(orderedFields, (tField) => tField.id === fieldNew.id)) {
    let sameIndexField = _.find(orderedFields, (tField) => {
      return (
        tField.id !== fieldNew.id &&
        +tField.orderIndex &&
        +fieldNew.orderIndex &&
        tField.orderIndex === fieldNew.orderIndex
      );
    });
    while (sameIndexField) {
      sameIndexField.orderIndex += 1;
      sameIndexField = _.find(orderedFields, (tField) => {
        return tField.id !== sameIndexField.id && tField.orderIndex === sameIndexField.orderIndex;
      });
    }
  }
};

/**
 * определяем единственный datasetId по всем пилюлям компонента
 * @param config
 * @returns {*}
 */
export const getDatasetId = (config) => {
  const axes = (config || {}).axes || [];
  // оставляем список уникальных datasetId для всех пилюль на всех полках и берем только самый первый
  return (_.uniq(_.map(_.flatMap(axes, 'fields'), 'datasetId')) || {})[0];
};
