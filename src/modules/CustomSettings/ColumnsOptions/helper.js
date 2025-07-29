import _ from 'lodash';
import { getTitle } from '../../../duplicates/helpers';

export function buildOptions(axes = [], groupNames = {}) {
  let options = [];
  axes.forEach((axe) => {
    if (axe && axe.fields) {
      options = _.concat(
        options,
        _.map(axe.fields, (field) => {
          if (!field) return {};
          return {
            name: getTitle(field) || (field.alias || field.name) + (field.agg ? ` (${field.agg})` : ''),
            fieldName: getTitle(field) || field.alias || field.name,
            value: field.id,
            type: field.type,
            group: groupNames[axe.type] || '',
          };
        }),
      );
    }
  });
  return [
    {
      name: 'выберите поле',
      value: undefined,
      group: '',
    },
    ...options,
  ];
}
