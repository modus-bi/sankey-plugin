import _ from 'lodash';
import { hsQuote } from '../../helpers';

export function getAliasSuffix(axis, field, chartType) {
  let aliasSuffix = '';

  const isMultipleCategory = axis.type === 'categories' && axis.selectedFieldIndex === -2;
  if (isMultipleCategory) {
    aliasSuffix = `[${_.findIndex((axis || {}).fields, ['id', field.id])}]`;
  }

  const isMultipleSeries = axis.type === 'series' && chartType === 'table';
  if (isMultipleSeries) {
    aliasSuffix = `[${_.findIndex((axis || {}).fields, ['id', field.id])}]`;
  }
  return aliasSuffix;
}

// add aggregation to values non-calc fields for SqlPivot export
export function modifySelectForSqlPivotExport({ axis, field, selectObj }) {
  if (axis.type === 'values' && _.isEmpty(field.calc)) {
    selectObj.aggr = field.pivotAgg || 'sum';
  }
}

// add row and column fields to group for SqlPivot export
export function modifyGroupForSqlPivotExport({ axis, field, config, group, calc, alias, fieldAlias }) {
  const aliasSuffix = getAliasSuffix(axis, field, config.chartType);

  if (!_.some(group, ['name', field.name])) {
    group.push({
      name: hsQuote(calc) || field.name,
      calc: hsQuote(calc),
      alias: alias + aliasSuffix,
      id: field.id,
      fieldAlias,
      direction: field.order,
    });
  }
}
