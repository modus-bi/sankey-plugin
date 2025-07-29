import React from 'react';
import PropTypes from 'prop-types';
import ColorSettingItem from '../CommonSettingItems/ColorSettingItem/ColorSettingItem';
import { getDefaultConfig } from '../../CustomChart/specGeneratorHelpers';
import OpacitySettingItem from './OpacitySettingItem/OpacitySettingItem';

const StyleOptions = ({ component, open, pluginImports, changeChart }) => {
  if (!component) return null;

  const { SettingsSection } = pluginImports.components;
  const { config } = component;
  const style = config.style || getDefaultConfig().style;
  return (
    <SettingsSection title='Стилизация' open={open}>
      <ColorSettingItem
        title={'Цвет выбранного потока'}
        pluginImports={pluginImports}
        changeChart={changeChart}
        actionName={'changeStyleSelectedLineColor'}
        valueColor={style.selectedLineColor}
      />
      <OpacitySettingItem
        title='Прозрачность выбранного потока (%)'
        pluginImports={pluginImports}
        actionName={'changeStyleSelectedLineOpacity'}
        changeChart={changeChart}
        valueOpacity={style.selectedLineOpacity}
      />
      <OpacitySettingItem
        title='Прозрачность не выбранного потока (%)'
        pluginImports={pluginImports}
        actionName={'changeStyleUnselectedLineOpacity'}
        changeChart={changeChart}
        valueOpacity={style.unselectedLineOpacity}
      />
      <OpacitySettingItem
        title='Прозрачность не выбранного узла (%)'
        pluginImports={pluginImports}
        actionName={'changeStyleUnselectedNodeOpacity'}
        changeChart={changeChart}
        valueOpacity={style.unselectedNodeOpacity}
      />
    </SettingsSection>
  );
};

StyleOptions.propTypes = {
  component: PropTypes.object,
  open: PropTypes.bool,
  pluginImports: PropTypes.object.isRequired,
  changeChart: PropTypes.func.isRequired,
};

StyleOptions.displayName = 'StyleOptions';

export default StyleOptions;
