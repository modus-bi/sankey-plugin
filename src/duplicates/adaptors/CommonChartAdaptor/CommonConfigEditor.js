import { nanoid } from 'nanoid';
import _ from 'lodash';
/* Components */
import { defaultFieldOptions } from '../../constants/fieldOptions';
import { shiftOrderIndex, clearNotOrderedFieldsOrderIndex } from '../../helpers';

export default class CommonConfigEditor {
  constructor() {
    this.addField = this.addField.bind(this);
    this.updateField = this.updateField.bind(this);
  }

  /**
   * добавляем новое поле
   * @param config
   * @param axisName
   * @param fieldIndex
   * @param fieldItem
   * @param type
   * @returns {*}
   */
  addField(config, axisName, fieldIndex, fieldItem, type) {
    const axisType = (_.find(config.axes, ['name', axisName]) || {}).type;

    // если имя поля пустое - ничего не делаем
    if (!fieldItem) {
      return config;
    }

    if (config.chartType === 'stock' && axisType === 'categories' && !['date', 'calculated'].includes(fieldItem.type)) {
      return config;
    }

    // копируем конфиг
    const configNew = _.cloneDeep(config);

    // создаем поле на базе драг-итема
    const fieldNew = _.defaults(
      _.merge({}, _.omit(fieldItem, ['axisName', 'fieldIndex', 'itemType']), { id: fieldItem.name + '_' + nanoid() }),
      defaultFieldOptions,
    );

    // устанавливаем дефолтные значения для пилюль сводной таблицы
    if (config.chartType === 'pivotChart' && axisType === 'values') {
      fieldNew.pivotAgg = fieldItem.type === 'number' ? 'sum' : 'count';
    } else {
      fieldNew.pivotAgg = undefined;
    }

    // устанавливаем дефолтные значения для пилюль солнечных лучей
    if (config.chartType === 'sunburstChart' && axisType === 'values') {
      fieldNew.agg = fieldItem.type === 'number' ? 'sum' : 'count';
    }

    // устанавливаем дефолтные значения для пилюль стокчарта
    if (config.chartType === 'stock' && axisType === 'categories') {
      fieldNew.order = 'asc';
    }

    // готовим плоский массив всех пилюль
    const allFields = _.flatMap(configNew.axes, 'fields');

    // цикл по всем осям
    configNew.axes.map((axe) => {
      // сбрасываем ось и фильтры, если сменился датасет
      if (!_.find(allFields, ['datasetId', fieldNew.datasetId])) {
        axe.fields = [];
        configNew.filters = {};
        configNew.filtersDefault = {};
        configNew.rules && (configNew.rules = []);
        if (!_.includes(type, 'Plotly') && type !== 'HsTotalsPanel') {
          configNew.visuals && (configNew.visuals = []);
        }
      }

      // на нужную ось добавляем новую пилюлю
      if (axe.name === axisName) {
        //if (!isArray(axe.fields)) axe.fields = [];
        axe.fields.splice(fieldIndex, 0, fieldNew);
      }
    });

    // вызываем автоматическое выставление агрегации
    this.setAggregationAuto(configNew.axes);

    delete configNew.expands;

    return configNew;
  }

  /**
   * добавляем все поля из датасета
   * @param config
   * @param datasetId
   * @param datasets
   */
  addAllFields(config, datasetId, datasets) {
    const configNew = _.cloneDeep(config);
    const axe = _.find(configNew.axes, ['type', 'values']);
    const dataset = _.find(datasets.data, ['ID', datasetId]);

    // сбрасываем ось и фильтры, если сменился датасет
    if (!_.find(_.flatMap(configNew.axes, 'fields'), ['datasetId', datasetId])) {
      configNew.axes.map((axe_) => {
        axe_.fields = [];
      });
      configNew.filters = {};
      configNew.filtersDefault = {};
      configNew.rules && (configNew.rules = []);
      configNew.visuals && (configNew.visuals = []);
    }

    axe.fields = [];
    _.forEach(dataset.fields, (fieldItem) => {
      // создаем поле на базе драг-итема
      const fieldNew = _.defaults(
        _.merge({}, _.omit(fieldItem, ['axisName', 'fieldIndex', 'itemType']), { id: fieldItem.name + '_' + nanoid() }),
        defaultFieldOptions,
      );

      // добавляем пилюлю на ось
      axe.fields.push(fieldNew);
    });

    // вызываем автоматическое выставление сортировки
    this.setOrderAuto(configNew);

    // вызываем автоматическое выставление агрегации
    this.setAggregationAuto(configNew.axes);

    return configNew;
  }

  /**
   * изменяем или перетаскиваем поле
   * @param config - конфиг драфт
   * @param axisName - ось вставки поля
   * @param fieldIndex - порядок вставки поля на оси
   * @param fieldItem - элемент измененного поля
   * @returns {*}
   */
  updateField(config, axisName, fieldIndex, fieldItem) {
    // если имя поля пустое - ничего не делаем
    if (!fieldItem) return config;

    // готовим переменные
    const configNew = _.cloneDeep(config);
    const axis = _.find(configNew.axes, ['name', axisName]);
    //const fieldOld = _.cloneDeep(axis.fields[fieldIndex]);
    const fieldNew = _.defaults(
      _.merge({}, _.omit(fieldItem, ['axisName', 'fieldIndex', 'itemType'])),
      defaultFieldOptions,
    );

    // если итем не перемещается
    if (axisName === fieldItem.axisName && fieldIndex === fieldItem.fieldIndex) {
      // если команда удалить
      if (fieldItem.remove) {
        // удаляем итем
        axis.fields.splice(fieldIndex, 1);
      }
      // если любая другая команда
      else {
        // подменяем итем на обновленный
        axis.fields.splice(fieldIndex, 1, fieldNew);
      }
    }
    // если итем перемещается
    else {
      // вставляем итем
      axis.fields.splice(fieldIndex, 0, fieldNew);

      // учитываем сдвиг, если точка вставки предшествует точке удаления
      let shift = 0;
      if (axisName === fieldItem.axisName && fieldIndex < fieldItem.fieldIndex) {
        shift = 1;
      }

      // удаляем итем
      const axisFrom = _.find(configNew.axes, ['name', fieldItem.axisName]);
      axisFrom.fields.splice(fieldItem.fieldIndex + shift, 1);
    }

    clearNotOrderedFieldsOrderIndex(configNew);

    shiftOrderIndex(configNew, fieldNew);

    clearNotOrderedFieldsOrderIndex(configNew);

    // сбрасываем редактор вычисляемого поля
    configNew.calculatedField = null;

    // вызываем автоматическое выставление сортировки
    this.setOrderAuto(configNew);

    // вызываем автоматическое выставление агрегации
    this.setAggregationAuto(configNew.axes);

    // очиищаем фильтры, если они удалены или перемещены с полки фильтры
    const filterAxe = _.find(configNew.axes, ['type', 'filters']);
    if (filterAxe) {
      const filterNamesActive = _.map(filterAxe.fields || [], 'name') || [];
      configNew.filters = _.omitBy(configNew.filters, (field, fieldName) => !_.includes(filterNamesActive, fieldName));
    }

    delete configNew.expands;

    return configNew;
  }

  /**
   * добавляем или убираем агрегации автоматически
   * @param axes
   */
  setAggregationAuto(axes) {
    // если индекс поля не выбран ставим 0
    axes.forEach((axe) => {
      if (_.isUndefined(axe.selectedFieldIndex)) {
        axe.selectedFieldIndex = 0;
      }
    });

    const valuesAxe = _.find(axes, ['type', 'values']);

    // получаем имя действующей категории
    const categoriesAxe = _.find(axes, ['type', 'categories']);
    let categoriesFieldName = null;
    if (categoriesAxe && categoriesAxe.fields.length > 0 && categoriesAxe.fields[categoriesAxe.selectedFieldIndex]) {
      categoriesFieldName = categoriesAxe.fields[categoriesAxe.selectedFieldIndex].name;
    }

    if (categoriesAxe) {
      _.forEach(categoriesAxe.fields, (field) => {
        delete field.agg;
      });
    }

    // получаем имя действующей серии
    const seriesAxe = _.find(axes, ['type', 'series']);
    let seriesFieldName = null;
    if (seriesAxe && seriesAxe.fields.length > 0 && seriesAxe.fields[seriesAxe.selectedFieldIndex]) {
      seriesFieldName = seriesAxe.fields[seriesAxe.selectedFieldIndex].name;
    }

    if (seriesAxe) {
      _.forEach(seriesAxe.fields, (field) => {
        delete field.agg;
      });
    }

    // флаг группировки если активна серия или категория
    const groupMode =
      (categoriesAxe && categoriesAxe.fields.length > 0 && categoriesFieldName) ||
      (seriesAxe && seriesAxe.fields.length > 0 && seriesFieldName);

    // меняем аггрегации для полей значений
    if (valuesAxe) {
      // в режиме группировки добавляем группировку если ее нет
      if (groupMode) {
        valuesAxe.fields.forEach((field) => {
          if (
            field.type !== 'calculated' &&
            _.isNull(field.agg) &&
            field.name !== seriesFieldName &&
            field.name !== categoriesFieldName
          ) {
            field.agg = field.type === 'number' ? 'sum' : 'max';
          }
        });
      }
    }
  }

  /**
   * добавляем или убираем сортировки автоматически
   * @param config
   */
  setOrderAuto(config) {
    if (config.chartType === 'stock') {
      const categoriesAxe = _.find(config.axes, ['type', 'categories']);
      categoriesAxe.fields.forEach((field) => {
        if (!field.order) {
          field.order = 'asc';
        }
      });
    }
  }
}
