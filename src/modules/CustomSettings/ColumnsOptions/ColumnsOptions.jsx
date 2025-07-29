import React, { useState } from 'react';
import PropTypes from 'prop-types';
import AnchorSettingItem from './AnchorSettingItem/AnchorSettingItem';
import ColumnBySettingItem from './ColumnBySettingItem/ColumnBySettingItem';

const ColumnsOptions = ({ open, component, pluginImports, changeChart }) => {
  if (!component) return null;
  const [anchor, setAnchor] = useState('');
  const { config } = component;
  const { SettingsSection } = pluginImports.components;
  const onChangeAnchor = (option) => {
    setAnchor(option);
  };

  const findSelectedOption = (property) => (option) => {
    try {
      return option.value === config?.columns[anchor][property]?.value;
    } catch (e) {
      return null;
    }
  };

  return (
    <SettingsSection open={open} title='Настройка полей'>
      <AnchorSettingItem
        onChangeAnchor={onChangeAnchor}
        anchor={anchor}
        component={component}
        pluginImports={pluginImports}
      />
      {anchor ? (
        <>
          <ColumnBySettingItem
            changeChart={changeChart}
            anchor={anchor}
            component={component}
            pluginImports={pluginImports}
            findSelectedOption={findSelectedOption('colorBy')}
            actionName={'onChangeColumnColorBy'}
            title={'Цвет по другому полю:'}
          />
          <ColumnBySettingItem
            changeChart={changeChart}
            anchor={anchor}
            component={component}
            pluginImports={pluginImports}
            findSelectedOption={findSelectedOption('tooltipBy')}
            actionName={'onChangeColumnTooltipBy'}
            title={'Подсказка по другому полю:'}
          />
        </>
      ) : null}
    </SettingsSection>
  );
};

ColumnsOptions.propTypes = {
  component: PropTypes.object,
  open: PropTypes.bool,
  pluginImports: PropTypes.object,
  changeChart: PropTypes.func,
};

ColumnsOptions.displayName = 'ColumnsOptions';

export default ColumnsOptions;
