import _ from 'lodash';
import moment from 'moment';
import { bigNumberClasses, smallNumberClasses } from './labelsOptions';
import { getLocalArray } from '../helpers';
const Math = window.Math;

Number.prototype.between = function(a, b, inclusive) {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return inclusive ? this >= min && this <= max : this > min && this < max;
};

/** Override for AMcharts.toFixed **/
const toFixed = (number, precision) => {
  let negative = false;
  if (number < 0) {
    negative = true;
    number = Math.abs(number);
  }
  let num = String(Math.round(number * Math.pow(10, precision)));
  if (precision > 0) {
    let length = num.length;
    if (length < precision) {
      let i;
      for (i = 0; i < precision - length; i++) {
        num = '0' + num;
      }
    }
    let base = num.substring(0, num.length - precision);
    if (base === '') {
      base = 0;
    }
    let fixed = base + '.' + num.substring(num.length - precision, num.length);
    if (negative) {
      return '-' + fixed;
    } else {
      return fixed;
    }
  } else {
    return String(num);
  }
};

/** Override for AMcharts.roundTo **/
const roundTo = (num, precision) => {
  if (precision < 0) {
    return num;
  } else {
    let d = Math.pow(10, precision);
    return Math.round(num * d) / d;
  }
};

/** Override for AMcharts.addZeroes **/
const addZeroes = (number, dSep, count) => {
  let array = number.split(dSep);
  if (array[1] === undefined && count > 0) {
    array[1] = '0';
  }
  if (array[1].length < count) {
    array[1] = array[1] + '0';
    return addZeroes(array[0] + dSep + array[1], dSep, count);
  } else {
    if (array[1] === undefined) {
      return array[0];
    } else {
      return array[0] + dSep + array[1];
    }
  }
};

/**
 * Override for AMcharts.formatNumber
 * Форматирует число. Принамает в качестве настроек объект:
 * { precision: Number, decimalSeparator: String, thousandsSeparator: Sring }
 **/
export const formatNumber = (num, format, zeroCount, addPlus, addPercents) => {
  if (!_.isUndefined(format.precision)) num = roundTo(num, format.precision);
  if (isNaN(zeroCount)) zeroCount = format.precision;
  let dSep = format.decimalSeparator;
  let tSep = format.thousandsSeparator;

  /** check if negative **/
  let negative;
  if (num < 0) negative = '-';
  else negative = '';
  num = Math.abs(num);
  let numStr = String(num);
  /** Keep exponentials 'as-is' **/
  let exp = false;
  if (numStr.indexOf('e') != -1) exp = true;
  if (zeroCount >= 0 && !exp) numStr = toFixed(num, zeroCount);
  /** Format number **/
  let formated = '';
  if (exp) {
    formated = numStr;
  } else {
    let array = numStr.split('.');

    let string = String(array[0]);
    let i;
    for (i = string.length; i >= 0; i = i - 3) {
      if (i == string.length) {
        formated = string.substring(i - 3, i);
      } else {
        if (i === 0) {
          formated = string.substring(i - 3, i) + formated;
        } else {
          formated = string.substring(i - 3, i) + tSep + formated;
        }
      }
    }
    if (array[1] !== undefined) {
      formated = formated + dSep + array[1];
    }
    if (zeroCount !== undefined && zeroCount > 0 && formated != '0') {
      formated = addZeroes(formated, dSep, zeroCount);
    }
  }

  // Add negative
  formated = negative + formated;
  // Add positive
  if (negative === '' && addPlus === true && num !== 0) formated = '+' + formated;
  // Percents
  if (addPercents === true) formated = formated + '%';

  return formated;
};

/** Override for AMcharts.addPrefix **/
export const addPrefix = (value, prefixesOfBigNumbers, prefixesOfSmallNumbers, numberFormat, strict) => {
  prefixesOfBigNumbers = prefixesOfBigNumbers || getLocalArray(bigNumberClasses, 'prefix');
  prefixesOfSmallNumbers = prefixesOfSmallNumbers || smallNumberClasses;
  let str = formatNumber(value, numberFormat);
  let sign = '';
  let c;
  let newVal;
  let prec;
  if (value === 0) return '0';
  if (value < 0) sign = '-';

  value = Math.abs(value);

  if (value >= 1) {
    for (c = prefixesOfBigNumbers.length - 1; c > -1; c--) {
      if (value >= prefixesOfBigNumbers[c].number || prefixesOfBigNumbers.length === 1) {
        newVal = value / prefixesOfBigNumbers[c].number;
        prec = Number(numberFormat.precision);
        if (!strict && prec.between(0, 1, true) && (newVal.between(-10, -0.1, true) || newVal.between(0.1, 10, true))) {
          prec = 1; // set minimal precision to 1 if value is simple number
        }
        let newValTwo = roundTo(newVal, prec);
        let nf = {
          precision: -1,
          decimalSeparator: numberFormat.decimalSeparator,
          thousandsSeparator: numberFormat.thousandsSeparator,
        };
        let stringValue = formatNumber(newValTwo, nf);
        /** Add prefixes **/
        str = `${sign}${stringValue}${prefixesOfBigNumbers[c].prefix}`;
        break;
      }
    }
  } else {
    for (c = 0; c < prefixesOfSmallNumbers.length; c++) {
      if (value <= prefixesOfSmallNumbers[c].number || prefixesOfSmallNumbers.length === 1) {
        newVal = value / prefixesOfSmallNumbers[c].number;
        prec = Math.abs(Math.floor(Math.log(newVal) * Math.LOG10E));
        newVal = roundTo(newVal, prec);
        str = `${sign}${newVal}${prefixesOfSmallNumbers[c].prefix}`;
        break;
      }
    }
  }
  return str;
};

/** Функция принимает строку с датой (в формате ISO 8601)
 *  убирает тайм-зону и форматирует дату обратно в ISO 8601
 **/
export const removeDateTZ = (value) => {
  const hasTzEnding = /([0-9]+|Z)$/.test(value + '');
  const isNotOnlyDigits = (value + '').replace(/[0-9]/g, '').length > 0;
  if (_.isString(value) && hasTzEnding && isNotOnlyDigits) {
    let ret = value + '';

    // remove timezone
    ret = ret.replace(/([+-]\d+:\d+|Z)$/i, '');

    // if YYYY-MM-DD formatted
    if (moment(ret, 'YYYY-MM-DD', true).isValid()) {
      return ret.trim();
    }

    // if ISO_8601 formatted
    ret = moment(ret, [moment.ISO_8601], true);

    // apply default formatting
    if (ret.isValid()) {
      return ret.format('YYYY-MM-DD HH:mm:ss');
    }

    // if not valid date
    return value + '';
  }

  return value;
};

/**
 * Функция принимает строку, ищет числа, переводит в даты в ISO 8601, валидирует их и переформатирует по заданному шаблону
 * Если строка в дату не переводится, то оставляет исходную строку
 * **/
export const dateFormatFunction = (label, fmt) => {
  if (!label) return '';
  const template = fmt && fmt !== '-' ? fmt : 'DD.MM.YYYY';
  let ret = '';
  if (typeof label === 'object' && label instanceof Date) {
    ret = moment(label);
    if (ret.isValid()) {
      ret = ret.format(template);
      return ret;
    }
    return label;
  } else if (typeof label === 'string' && `${label}`.replace(/[0-9]/g, '').length) {
    const val = `${label}`;
    // пытаемся распарсить дату в формате ISO 8601
    ret = moment(label, [moment.ISO_8601], 'ru', true);
    // если распознали, то переформатируем по заданному шаблону
    if (ret.isValid()) ret = ret.format(template);
    // или пропускаем строки как есть
    else ret = val;
    return ret;
  }
  return label;
};

/** Шаблоны форматирования дат **/
export const dateFormatOptions = [
  { name: '(по умолчанию)', value: '-' },
  { name: 'ГГГГ-ММ-ДД', value: 'YYYY-MM-DD' },
  { name: 'ГГГГ-ММ-ДД чч:мм', value: 'YYYY-MM-DD HH:mm' },
  { name: 'ГГГГ-ММ-ДД чч:мм:сс', value: 'YYYY-MM-DD HH:mm:ss' },
  { name: 'ММ.ГГГГ', value: 'MM.YYYY' },
  { name: 'ДД.ММ.ГГ', value: 'DD.MM.YY' },
  { name: 'ДД.ММ.ГГГГ', value: 'DD.MM.YYYY' },
  { name: 'ДД.ММ.ГГГГ чч:мм', value: 'DD.MM.YYYY HH:mm' },
  { name: 'ДД.ММ.ГГГГ чч:мм:сс', value: 'DD.MM.YYYY HH:mm:ss' },
  { name: 'Год', value: 'YYYY' },
  { name: 'Месяц', value: 'MMMM' },
  { name: 'Мес. Год', value: 'MMM YYYY' },
  { name: 'Месяц Год', value: 'MMMM YYYY' },
  { name: 'День Мес. Год', value: 'D MMM YYYY' },
  { name: 'День Месяц Год', value: 'D MMMM YYYY' },
  { name: 'День Мес. Год чч:мм', value: 'D MMM YYYY HH:mm' },
  { name: 'День Мес. Год чч:мм:сс', value: 'D MMM YYYY HH:mm:ss' },
  { name: 'чч:мм', value: 'HH:mm' },
  { name: 'чч:мм:сс', value: 'HH:mm:ss' },
];

export const dateFormatOptionsForPeriodView = [
  { name: '(по умолчанию)', value: '-' },
  { name: 'ГГГГ-ММ-ДД', value: 'YYYY-MM-DD' },
  { name: 'ДД.ММ.ГГ', value: 'DD.MM.YY' },
  { name: 'ДД.ММ.ГГГГ', value: 'DD.MM.YYYY' },
  { name: 'День Мес. Год', value: 'D MMM YYYY' },
  { name: 'День Месяц Год', value: 'D MMMM YYYY' },
];

/** Public exports **/
export default {
  removeDateTZ,
  dateFormatFunction,
  dateFormatOptions,
  dateFormatOptionsForPeriodView,
  formatNumber,
  addPrefix,
};
