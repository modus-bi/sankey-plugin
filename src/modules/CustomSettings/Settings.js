import React from 'react';
import PropTypes from 'prop-types';
import MainOptions from './MainOptions/MainOptions';
import BalloonOptions from './BalloonOptions/BalloonOptions';
import ColumnsOptions from './ColumnsOptions/ColumnsOptions';
import StyleOptions from './StyleOptions/StyleOptions';

const Settings = ({ pluginImports, component, changeChart }) => {
  const {
    DataOptionsContent,
    FilterModeOptionsContent,
    DrillOutOptionsContent,
    DescriptionOptionsContent,
    OutlineOptionsContent,
  } = pluginImports.sections;
  return (
    <div className='hsChartSettings'>
      <MainOptions component={component} pluginImports={pluginImports} changeChart={changeChart} />
      {DataOptionsContent}
      <ColumnsOptions changeChart={changeChart} component={component} pluginImports={pluginImports} />
      <BalloonOptions changeChart={changeChart} component={component} pluginImports={pluginImports} />
      <StyleOptions changeChart={changeChart} component={component} pluginImports={pluginImports} />
      {FilterModeOptionsContent}
      {DrillOutOptionsContent}
      {DescriptionOptionsContent}
      {OutlineOptionsContent}
    </div>
  );
};

Settings.propTypes = {
  component: PropTypes.object,
  reportlist: PropTypes.object.isRequired,
  changeChart: PropTypes.func.isRequired,
  pluginImports: PropTypes.object.isRequired,
};

Settings.displayName = 'Settings';

export default Settings;
