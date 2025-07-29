import React from 'react';
import PropTypes from 'prop-types';
import BalloonTemplatesSettingItem from './BalloonTemplatesSettingItem/BalloonTemplatesSettingItem';
import FontSizeSettingItem from './FontSizeSettingItem/FontSizeSettingItem';
import ColorSettingItem from '../CommonSettingItems/ColorSettingItem/ColorSettingItem';

const BalloonOptions = ({ component, open, pluginImports, changeChart }) => {
  if (!component) return null;

  const { SettingsSection } = pluginImports.components;
  const { config } = component;
  const balloon = config.balloon;
  const enabled = balloon.visible;

  const onChangeBalloonVisibility = (e, checked) => {
    changeChart('changeBalloonVisibility', { value: checked });
  };
  return (
    <SettingsSection title='Всплывающая подсказка' open={open} enabled={enabled} onToggle={onChangeBalloonVisibility}>
      <BalloonTemplatesSettingItem
        enabled={enabled}
        pluginImports={pluginImports}
        component={component}
        changeChart={changeChart}
      />

      <FontSizeSettingItem
        enabled={enabled}
        pluginImports={pluginImports}
        component={component}
        changeChart={changeChart}
      />

      <ColorSettingItem
        title={'Цвет шрифта'}
        enabled={enabled}
        pluginImports={pluginImports}
        changeChart={changeChart}
        actionName={'changeBalloonFontColor'}
        valueColor={balloon.color}
      />

      <ColorSettingItem
        title={'Цвет фона'}
        enabled={enabled}
        pluginImports={pluginImports}
        changeChart={changeChart}
        actionName={'changeBalloonBgColor'}
        valueColor={balloon.bgcolor}
      />
    </SettingsSection>
  );
};

BalloonOptions.propTypes = {
  component: PropTypes.object,
  open: PropTypes.bool,
  pluginImports: PropTypes.object.isRequired,
  changeChart: PropTypes.func.isRequired,
};

BalloonOptions.displayName = 'BalloonOptions';

export default BalloonOptions;
