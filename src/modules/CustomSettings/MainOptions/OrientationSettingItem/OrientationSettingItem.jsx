import React from 'react';
import PropTypes from 'prop-types';

const OrientationSettingItem = ({ component, pluginImports, changeChart }) => {
  const { SettingsToggle, SettingsItem } = pluginImports.components;
  const { config } = component;
  const title = config.orientation === 'horizontal' ? 'Гориз.' : 'Верт.';
  const toggled = config.orientation === 'horizontal';
  const onChange = () => {
    const value = toggled ? 'vertical' : 'horizontal';
    changeChart('changeOrient', { value });
  };
  return (
    <SettingsItem type='inline' title='Ориентация'>
      <SettingsToggle
        disableTouchRipple
        label={title}
        toggled={toggled}
        onClick={(e) => e.stopPropagation()}
        onToggle={onChange}
      />
    </SettingsItem>
  );
};

OrientationSettingItem.propTypes = {
  component: PropTypes.object,
  pluginImports: PropTypes.object,
  changeChart: PropTypes.func,
};

export default OrientationSettingItem;
