import React from 'react';
import PropTypes from 'prop-types';

const ColorSettingItem = ({ pluginImports, changeChart, enabled = true, title, actionName, valueColor }) => {
  const { SettingsItem, SettingsColorPicker } = pluginImports.components;
  const onChange = (color) => {
    changeChart(actionName, { value: color });
  };
  return (
    <SettingsItem type='inline' title={title} disabled={!enabled}>
      <SettingsColorPicker disabled={!enabled} float='right' color={valueColor} onChange={onChange} />
    </SettingsItem>
  );
};

ColorSettingItem.propTypes = {
  title: PropTypes.string.isRequired,
  actionName: PropTypes.string.isRequired,
  valueColor: PropTypes.string.isRequired,
  pluginImports: PropTypes.object,
  changeChart: PropTypes.func,
  enabled: PropTypes.bool,
};

ColorSettingItem.displayName = 'ColorSettingItem';

export default ColorSettingItem;
