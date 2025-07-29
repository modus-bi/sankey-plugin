import React from 'react';
import { balloonTemplates } from '../../../../duplicates/constants/labelsOptions';
import find from 'lodash/find';
import PropTypes from 'prop-types';

const BalloonTemplatesSettingItem = ({ component, pluginImports, changeChart, enabled }) => {
  const { SettingsItem, SettingsMultiselect } = pluginImports.components;
  const { config } = component;
  const onChange = (item) => {
    changeChart('changeBalloonTemplate', item);
  };
  return (
    <SettingsItem disabled={!enabled} type='inline' title='Шаблон'>
      <div style={{ minWidth: '170px', maxWidth: '170px', fontSize: '12px' }}>
        <SettingsMultiselect
          title=''
          disabled={!enabled}
          multiple={false}
          clearable={false}
          keepOpenOnSelection={false}
          optionValueKey='value'
          optionLabelKey='name'
          dataSource={balloonTemplates}
          selected={[find(balloonTemplates, ['value', config?.balloonTemplate || null])]}
          onChange={onChange}
        />
      </div>
    </SettingsItem>
  );
};

BalloonTemplatesSettingItem.propTypes = {
  component: PropTypes.object,
  pluginImports: PropTypes.object,
  changeChart: PropTypes.func,
  enabled: PropTypes.bool,
};

BalloonTemplatesSettingItem.displayName = 'BalloonTemplatesSettingItem';

export default BalloonTemplatesSettingItem;
