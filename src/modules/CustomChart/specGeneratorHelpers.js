import { addPrefix } from '../../duplicates/constants/formatOptions';
import _ from 'lodash';
import defaultConfig from './defaultConfig.json';

export function getTooltip({ config }) {
  const { balloon, columns } = config;
  return {
    show: balloon.visible,
    trigger: 'item',
    axisPointer: {
      type: 'shadow',
    },
    backgroundColor: balloon.bgcolor || '#fff',
    textStyle: {
      fontSize: balloon.fontsize,
      color: balloon.color || 'inherit',
    },
    formatter: function(option) {
      const value = option.value;
      const valuePrefix = addPrefix(value, config.bigNumberClasses, false, {
        precision: config.precision || 0,
        decimalSeparator: '.',
        thousandsSeparator: ' ',
      });
      let nodeTooltip = '';
      let edgeTooltip = '';
      if (option.dataType === 'node') {
        const node = option.data;
        const field = columns[node?.category.id];
        if (field && node?.tooltips[field.tooltipBy?.value]) {
          nodeTooltip = node.tooltips[field.tooltipBy.value].toString();
        } else {
          nodeTooltip = option.data.name;
        }
      }
      if (option.dataType === 'edge') {
        const edge = option.data;
        const fieldSource = columns[edge?.categorySource.id];
        const fieldTarget = columns[edge?.categoryTarget.id];
        const template = `{source} > {target}`;
        let sourceString = edge.source;
        let targetString = edge.target;
        const conditionSource = fieldSource && edge?.tooltips[fieldSource.tooltipBy?.value];
        const conditionTarget = fieldTarget && edge?.tooltips[fieldTarget.tooltipBy?.value];
        if (conditionSource) {
          sourceString = edge.tooltips[fieldSource.tooltipBy.value].toString();
        }
        if (conditionTarget) {
          targetString = edge.tooltips[fieldTarget.tooltipBy.value].toString();
        }
        edgeTooltip = template.replace('{source}', sourceString).replace('{target}', targetString);
      }
      if (config.balloonTemplate) {
        const tooltip = option.dataType === 'node' ? nodeTooltip : edgeTooltip;
        const percent = getPercent(value, option.data.total);
        return [
          config.balloonTemplate
            .replace('[[value]]', valuePrefix)
            .replace('[[percents]]', percent)
            .replace('[[categories]]', option.name)
            .replace('[[tooltip]]', tooltip),
        ].join('\n');
      }

      return `${option.name}: ${valuePrefix}`;
    },
  };
}

export function getGrid() {
  return {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  };
}

export function getLevels(config) {
  const categoriesAxe = _.find(config.axes, ['type', 'categories']);
  const categories = (categoriesAxe || {}).fields || [];
  return categories.map((c, index) => ({
    depth: index,
    lineStyle: {
      color: 'source',
      opacity: 0.2,
    },
  }));
}

export function getDefaultConfig() {
  return defaultConfig;
}

function getPercent(value = 0, total = 1) {
  return Math.round((value / total) * 100);
}
