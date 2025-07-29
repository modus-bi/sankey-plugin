import React from 'react';
import PropTypes from 'prop-types';
import OrientationSettingItem from './OrientationSettingItem/OrientationSettingItem';

const MainOptions = ({ open, component, pluginImports, changeChart }) => {
  if (!component) return null;

  const {
    autoApplyToggleContent,
    showTitleToggleContent,
    titleTextFieldContent,
    containerMarginSettingsContent,
    precisionSliderContent,
    suffixSelectContent,
  } = pluginImports.sections;

  const { SettingsSection } = pluginImports.components;

  return (
    <div>
      {autoApplyToggleContent}
      <SettingsSection open={open} title='Общие настройки'>
        {showTitleToggleContent}
        {titleTextFieldContent}
        <OrientationSettingItem changeChart={changeChart} pluginImports={pluginImports} component={component} />
        {containerMarginSettingsContent}
        {precisionSliderContent}
        {suffixSelectContent}
      </SettingsSection>
    </div>
  );
};

MainOptions.propTypes = {
  component: PropTypes.object,
  open: PropTypes.bool,
  pluginImports: PropTypes.object,
  changeChart: PropTypes.func,
};

MainOptions.displayName = 'MainOptions';

export default MainOptions;
