import React from 'react';
import PropTypes from 'prop-types';
import './OpacitySettingItem.scss';

const OpacitySettingItem = ({ pluginImports, changeChart, title, actionName, valueOpacity }) => {
  const { SettingsItem, SettingsTextField } = pluginImports.components;
  const onChange = (e, percent) => {
    changeChart(actionName, { value: Number(percent) });
  };
  const opacityPercent = 100 * valueOpacity;
  return (
    <SettingsItem type='inline' title={title}>
      <SettingsTextField
        className={'OpacitySettingItem__input'}
        numeric
        hintText='Число'
        min={0}
        max={100}
        step={1}
        value={opacityPercent}
        onChange={onChange}
      />
    </SettingsItem>
  );
};

OpacitySettingItem.propTypes = {
  title: PropTypes.string.isRequired,
  actionName: PropTypes.string.isRequired,
  valueOpacity: PropTypes.number.isRequired,
  pluginImports: PropTypes.object,
  changeChart: PropTypes.func,
};

OpacitySettingItem.displayName = 'OpacitySettingItem';

export default OpacitySettingItem;
