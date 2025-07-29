import tinycolor from 'tinycolor2';
import _ from 'lodash';
import { removeDateTZ } from '../../constants/formatOptions';
import { getHasTooltipField } from '../../helpers';
import { getIndexValueAxeNumber, getLinksAndNodes } from './helper';
import CommonDataAdaptor from '../CommonChartAdaptor/CommonDataAdaptor';

export default class DataAdaptor extends CommonDataAdaptor {
  remapData(config) {
    const self = this;
    const categoryAxe = _.find(config.axes, ['type', 'categories']) || {};
    const valueAxe = _.cloneDeep(_.find(config.axes, ['type', 'values']) || {});
    const categoryField = (categoryAxe.fields || [])[categoryAxe.selectedFieldIndex] || null;

    // добавляем фиктивную пилюлю типа 'tooltip', аналогичную добавленной при генерации запроса
    if (getHasTooltipField(config)) {
      let tooltipField = _.find((categoryAxe || {}).fields, (field) => !!field.tooltipBy);
      if (tooltipField) {
        valueAxe.fields.push({
          name: tooltipField.tooltipBy,
          aggr: 'max',
          alias: 'tooltip',
          id: tooltipField.id + '_tooltipBy',
          fieldAlias: tooltipField.tooltipBy,
          valueType: 'tooltip',
        });
      }
    }

    this.plotData = {};
    let thresholds = [];
    let colorSet = {};
    let tooltipSet = {};
    let initialData = [];
    const aggregated = _.cloneDeep(self.aggregated);
    // данные после агрегации не пусты
    if (!_.isEmpty(aggregated)) {
      _.map(aggregated, (rowData, index) => {
        // Remap data props according to datagroup (trace) number if series disabled
        if (!_.isEmpty(rowData)) {
          let newRowData = [];
          let valueField = _.find(valueAxe.fields || [], ['id', rowData[0].id]) || {}; // source valueAxis fied

          if (!valueField.hideResult) {
            /** БЕЗ СЕРИЙ **/
            // Transform trace fieldnames to 'fieldName0', 'values0' ... etc. According to trace index.
            newRowData = _.map(rowData, (data) => {
              data.categories = removeDateTZ(data.categories);
              // source valueAxis field
              valueField = _.find(valueAxe.fields || [], ['id', data.id]) || {};

              // Remap trace keys
              const remapped = {};
              _.merge(
                remapped,
                _.mapKeys(data, (v, k) => {
                  /** For non-value fields remap 'value' to (minimum, maximum, color, threshold... etc.) **/
                  if (valueField.valueType && valueField.valueType !== 'value') {
                    if (k === 'values') {
                      // split values by field valueType
                      switch (valueField.valueType) {
                        case 'threshold': // grab thresholds to array
                          if (_.isNumber(v)) {
                            thresholds.push({
                              title: valueField.title || '',
                              value: v,
                            });
                          }
                          break;

                        case 'color':
                          // parse any colors (rgb, hsl, hex with or without '#') to rgb
                          colorSet[valueField.id] = v ? tinycolor(v).toRgbString() : v;
                          break;

                        case 'tooltip':
                          tooltipSet[valueField.id] = v;
                          break;

                        default:
                          // minimum, maximum, etc...
                          return valueField.valueType;
                      }
                    }
                  } else if (k !== 'thresholds') {
                    /** Normal fields (do not remap categories and series) **/
                    if (k === 'categories') {
                      remapped.categoryField = _.cloneDeep(categoryField);
                    }
                    return k === 'tooltip' || k === 'categories' || k === 'series' || k === v ? k : k + index;
                  }
                }),
              );
              remapped.thresholds = _.sortBy(_.uniqBy(thresholds, 'value'), 'value');
              remapped.colorSet = colorSet;
              remapped.tooltipSet = tooltipSet;
              _.unset(remapped, undefined); // remove empty output for thresholds
              return remapped;
            });
            // Merge all aggregated data to one array
            _.merge(initialData, newRowData || []);
          }
        }
      });
    }
    const indexValueAxeNumber = getIndexValueAxeNumber(config);
    const { links, nodes } = getLinksAndNodes(initialData, categoryAxe?.fields, indexValueAxeNumber);
    this.plotData = {
      nodes,
      links,
    };
    return this.plotData;
  }

}
