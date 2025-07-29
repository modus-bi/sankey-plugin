import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { buildOptions } from '../helper';

const AnchorSettingItem = ({ component, pluginImports, onChangeAnchor, anchor }) => {
  const { SettingsItem, SettingsMultiselect } = pluginImports.components;
  const { config } = component;

  const groupNames = {
    categories: 'категории',
    values: 'значения',
  };

  const valueAxe = _.find(config.axes, ['type', 'values']);
  const categoriesAxe = _.find(config.axes, ['type', 'categories']);

  const axes = [valueAxe, categoriesAxe];

  const options = buildOptions(axes, groupNames);

  let selectedOption = _.find(options, (option) => option.value === anchor);
  if (!selectedOption) selectedOption = options[0];

  const onChange = (option) => {
    onChangeAnchor(_.isNil(option) ? null : option.value);
  };

  return (
    <SettingsItem>
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

AnchorSettingItem.propTypes = {
  component: PropTypes.object,
  pluginImports: PropTypes.object,
  onChangeAnchor: PropTypes.func,
  anchor: PropTypes.any,
};

AnchorSettingItem.displayName = 'AnchorSettingItem';

export default AnchorSettingItem;
