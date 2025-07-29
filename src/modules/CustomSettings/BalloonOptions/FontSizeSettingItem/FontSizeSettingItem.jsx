import React from 'react';
import PropTypes from 'prop-types';

const FontSizeSettingItem = ({ component, pluginImports, changeChart, enabled }) => {
  const { SettingsItem, SettingsSlider } = pluginImports.components;
  const { config } = component;
  const balloon = config.balloon;
  const onChange = (e, value) => {
    changeChart('changeBalloonFontSize', { value });
  };

  const styles = {
    sliderContainer: { zIndex: '-1', minWidth: '80px' },
    slider: { margin: '0', width: '95%' },
  };
  return (
    <SettingsItem disabled={!enabled} type='inline' title={'Размер шрифта (' + (balloon.fontsize || 0) + 'px' + ')'}>
      <SettingsSlider
        disableFocusRipple
        disabled={!enabled}
        step={1}
        min={8}
        max={20}
        defaultValue={12}
        value={balloon.fontsize}
        onChange={onChange}
        style={styles.sliderContainer}
        sliderStyle={styles.slider}
      />
    </SettingsItem>
  );
};

FontSizeSettingItem.propTypes = {
  component: PropTypes.object,
  pluginImports: PropTypes.object,
  changeChart: PropTypes.func,
  enabled: PropTypes.bool,
};

FontSizeSettingItem.displayName = 'FontSizeSettingItem';

export default FontSizeSettingItem;
