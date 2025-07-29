import _ from 'lodash';

function isFieldAxesByType(config, field, type = 'values') {
  const categoriesFields = _.find(config.axes, ['type', type])?.fields || [];
  return !!categoriesFields.find((categoryField) => categoryField.id === field.id);
}

export function isVisibleAxeDragItemMenuOption(props) {
  const { optionName, config, field } = props;
  if (isFieldAxesByType(config, field, 'categories')) {
    let options = ['renderTitleInput', 'renderNameBy', 'renderSortMenuItem', 'renderSortBySelector'];
    if (field.type === 'calculated') {
      options.push('renderEditCalcMenuItem');
    }
    return options.includes(optionName);
  }
  if (isFieldAxesByType(config, field, 'filters')) {
    let options = ['renderTitleInput', 'renderFilterLevel', 'renderFilterSettings'];
    if (field.type === 'calculated') {
      options.push('renderEditCalcMenuItem');
    }
    return options.includes(optionName);
  }
  if (isFieldAxesByType(config, field, 'values')) {
    let options = ['renderTitleInput', 'renderSortMenuItem', 'renderPillType', 'renderAggregationMenuItem'];
    if (field.type === 'calculated') {
      options = options.filter((option) => !['renderAggregationMenuItem'].includes(option));
      options.push('renderEditCalcMenuItem', 'renderCalcHideResult');
    }
    return options.includes(optionName);
  }

  switch (optionName) {
    case 'renderAggregationMenuItem':
    case 'renderPillType':
    case 'renderNameBy':
    case 'renderAggregationForSortBy':
    case 'renderColorFromDataToggle':
    case 'renderAddToTooltipToggle':
    case 'renderAddToTableToggle':
    case 'renderCalcLevel':
    case 'renderColorBySelector':
    case 'renderCalcHideResult':
    case 'renderControllingFilterMenuItem':
    case 'renderDerivedFieldToggle':
    case 'renderDerivedFilterFieldSelector':
    case 'renderDoShowTitleCheckbox':
    case 'renderDrillLevelOnly':
    case 'renderEditCalcMenuItem':
    case 'renderFilterLevel':
    case 'renderFilterSqlType':
    case 'renderListFieldSelector':
    case 'renderMdxLevelSelector':
    case 'renderOrderIndexSelector':
    case 'renderSheetSelector':
    case 'renderSortBySelector':
    case 'renderSortMenuItem':
    case 'renderSubAllAggregationMenuItem':
    case 'renderTitleInput':
    case 'renderTooltipBy':
    default:
      return false;
  }
}

export function isVisibleAxeDragItemElement(props) {
  const { elementName, config, field } = props;
  if (isFieldAxesByType(config, field, 'categories')) {
    return ['renderSortSelector'].includes(elementName);
  }
  if (isFieldAxesByType(config, field, 'filters')) {
    return false;
  }
  switch (elementName) {
    case 'renderAggregationSelector':
    case 'renderSortSelector':
    default:
      return false;
  }
}

export function isVisibleAxe(props) {
  const { axe } = props;
  return !['series'].includes(axe.type);
}

export function sortAxes(props) {
  const { config, axisNames } = props;

  const axesSorted = _.keys(axisNames);
  return _.filter(_.compact(_.at(_.keyBy(config.axes, 'type'), axesSorted)), () => {
    return true;
  });
}

export function isDisabledAxe(props) {
  const { axe, fieldIndex, config } = props;

  const valuesAxe = _.find(config.axes, ['type', 'values']) || {};
  const allowMultivalues = valuesAxe.selectedFieldIndex === -2;
  const categoriesAxe = _.find(config.axes, ['type', 'categories']) || {};
  const allowCategories = categoriesAxe.selectedFieldIndex === -2;
  const seriesAxe = _.find(config.axes, ['type', 'series']) || {};
  const allowSeries = seriesAxe.selectedFieldIndex !== -1;
  let disabled = fieldIndex !== 0;
  switch (axe.type) {
    case 'values':
      if (allowMultivalues) {
        disabled = false;
      }
      break;
    case 'categories':
      if (allowCategories) {
        disabled = false;
      }
      break;
    case 'series':
      if (!allowSeries) {
        disabled = false;
      }
      break;
    case 'filters':
      disabled = false;
      break;
    default:
      break;
  }

  return disabled;
}

export function getAxeName(props) {
  const { axe, axisNames } = props;

  return axisNames[axe.type];
}

export function isVisibleField() {
  return true;
}

export function renderAxeIcon(props) {
  const { axe, axisNames, HsMuiFontIcon } = props;

  const icons = {
    categories: (
      <HsMuiFontIcon className='fa fa-bars' title={axisNames.categories} style={{ transform: 'rotate(90deg)' }} />
    ),
    values: <HsMuiFontIcon className='fa fa-bars' title={axisNames.values} />,
    filters: <HsMuiFontIcon className='fa fa-filter' title={axisNames.filters} />,
  };

  return icons[axe.type];
}

export function getAxeIconColor(props) {
  const { axe } = props;

  const iconColors = {
    columns: 'white', //#e8f5e9
    rows: 'white', //#e1f5fe
    values: 'white',
  };
  return iconColors[axe.type] || 'white';
}

export function renderAxeToggle(props) {
  const { axe, valuesToggle } = props;

  switch (axe.type) {
    case 'values':
      return valuesToggle;
    case 'dimension':
    case 'categories':
    case 'filters':
    default:
      return null;
  }
}

export default {
  isVisibleAxeDragItemMenuOption,
  isVisibleAxeDragItemElement,
  isVisibleAxe,
  sortAxes,
  isDisabledAxe,
  getAxeName,
  isVisibleField,
  renderAxeIcon,
  getAxeIconColor,
  renderAxeToggle,
};
