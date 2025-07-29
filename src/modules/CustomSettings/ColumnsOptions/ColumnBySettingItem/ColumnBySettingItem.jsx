import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { buildOptions } from '../helper';

const ColumnBySettingItem = ({
  component,
  pluginImports,
  changeChart,
  anchor,
  actionName,
  findSelectedOption,
  title,
}) => {
  if (!findSelectedOption) return;
  const { SettingsItem, SettingsMultiselect } = pluginImports.components;
  const { config } = component;
  const groupNames = {
    values: 'значения',
  };

  const valueAxe = _.find(config.axes, ['type', 'values']);
  const axes = [valueAxe];
  const options = buildOptions(axes, groupNames);
  let selectedOption = _.find(options, findSelectedOption);
  if (!selectedOption) selectedOption = options[0];

  const onChange = (option) => {
    changeChart(actionName, { value: { fieldId: anchor, option } });
  };

  return (
    <SettingsItem title={title}>
      <SettingsMultiselect
        title=''
        placeholder='Не выбрано'
        multiple={false}
        clearable={false}
        keepOpenOnSelection={false}
        optionValueKey='value'
        optionLabelKey='name'
        groupBy='group'
        dataSource={options}
        selected={[selectedOption]}
        onChange={onChange}
      />
    </SettingsItem>
  );
};

ColumnBySettingItem.propTypes = {
  actionName: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  findSelectedOption: PropTypes.func.isRequired,
  component: PropTypes.object,
  pluginImports: PropTypes.object,
  changeChart: PropTypes.func,
  anchor: PropTypes.any,
};

ColumnBySettingItem.displayName = 'ColumnBySettingItem';

export default ColumnBySettingItem;
