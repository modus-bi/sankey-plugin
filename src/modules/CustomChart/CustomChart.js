import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import EChartsChartAdaptor from '../../duplicates/adaptors/EChartsChartAdaptor/EChartsChartAdaptor';
import { getDefaultConfig } from './specGeneratorHelpers';

export default class CustomChart extends Component {
  static propTypes = {
    id: PropTypes.string,
    componentId: PropTypes.number.isRequired,
    title: PropTypes.string,
    type: PropTypes.string.isRequired,
    config: PropTypes.object.isRequired,
    configDraft: PropTypes.object,
    datas: PropTypes.object,
    loadDatas: PropTypes.func.isRequired,
    editable: PropTypes.bool,
    editorActive: PropTypes.bool.isRequired,
    changeEditorComponent: PropTypes.func.isRequired,
    changeComponentVisuals: PropTypes.func.isRequired,
  };

  static getDefaultConfig() {
    return getDefaultConfig();
  }

  constructor(props) {
    super(props);
    this.EChartsChart = React.createRef();
  }

  resizeChart(long) {
    this.EChartsChart.current?.resizeChart(long);
  }

  render() {
    const { config, changeEditorComponent } = this.props;

    return (
      <EChartsChartAdaptor
        ref={this.EChartsChart}
        {...this.props}
        config={_.defaultsDeep(config, _.omit(getDefaultConfig(), 'axes'))}
        onComponentChange={(component) => changeEditorComponent(component)}
      />
    );
  }
}
