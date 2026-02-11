import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import * as echarts from 'echarts';
import i18n from 'i18next';
import _ from 'lodash';

import CommonDataAdaptor from '../CommonChartAdaptor/CommonDataAdaptor';
import ComponentTypeManager from '../../../managers/ComponentTypeManager';
import '../../constants/formatOptions';
import { getDatasetId, getDescription, getLocal } from '../../helpers';
import { isFilterMode, getColorset } from '../../helpers';
import { getVariablesForSettings } from '../../helpers/HsFilterControlPanelHelpers';
import DataAdaptor from './EChartsDataAdaptor';
import { getLinksBySelected, getUpdatedSpec } from './helper';

global.charts = [];

export default class EChartsChartAdaptor extends Component {

  static propTypes = {
    id: PropTypes.string,
    componentId: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    config: PropTypes.object,
    cacheId: PropTypes.string,
    data: PropTypes.object,
    datasets: PropTypes.object,
    reportOptions: PropTypes.object,
    commonWidgets: PropTypes.object,

    editorActive: PropTypes.bool.isRequired,
    mainMenuActive: PropTypes.bool,
    drillDownActive: PropTypes.bool,

    loadDatas: PropTypes.func.isRequired,
    reloadDatas: PropTypes.func.isRequired,
    drillDown: PropTypes.func,
    changeFilterCategories: PropTypes.func,
    changeMultipleGlobalFilterValueAndApply: PropTypes.func,
  };

  static defaultProps = {
    id: 'chart',
    data: null,
    config: null,
    editorActive: false,
    reportOptions: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      dataAdaptor: null,
      currentSpec: null,
      selectedLinks: [],
    };
    this.container = null;
    this.chartDiv = null;
    this.chartColors = [];
    this.stateObj = null;
    this.loaded = false;
    this.resizeTimer = [];
    this.reloadTimer = null;
    this.hasDrillDown = false;
  }

  componentDidMount() {
    // Create the echarts instance
    this.Chart = echarts.init(this.chartDiv, null, { renderer: 'svg' });
    global.charts[this.props.id] = this.Chart;
    window.addEventListener('resize', this.resizeChart);
    this.getData(this.props);
    this.mergeColors();
  }

  UNSAFE_componentWillReceiveProps(props) {
    this.getData(props);
    this.mergeColors();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { config, cacheId, skipRender, componentId, cursor, reportOptions } = nextProps;
    if (skipRender) {
      return false;
    }
    const stateObjNew = {
      componentId,
      cacheId,
      loaded: this.loaded,
      config: _.cloneDeep(config),
      cursor: _.cloneDeep(cursor),
      reportOptions: _.cloneDeep(reportOptions),
    };
    let res = false;
    res = res || !_.isEqual(stateObjNew, this.stateObj);
    if (nextProps.editorActive !== nextProps.inEditor || nextProps.mainMenuActive) {
      return false;
    }
    this.stateObj = stateObjNew;
    return res;
  }

  UNSAFE_componentWillUpdate(nextProps, nextState) {
    const { config, type } = nextProps;
    const { dataAdaptor } = nextState;
    if (!(dataAdaptor || {}).plotData) return null;
    const componentTypeManager = new ComponentTypeManager(type);
    const specGenerator = componentTypeManager.getSpecGenerator();
    if (specGenerator && this.loaded) {
      const mergedSpec = specGenerator.getSpec(config, dataAdaptor.plotData);
      this.plot(nextProps, dataAdaptor.plotData, mergedSpec);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeChart);
  }

  getData = (props) => {
    const { config, data, cacheId, loadDatas, reloadDatas, editorActive, componentId } = props;
    let { dataAdaptor } = this.state;
    const datasetId = getDatasetId(config);
    if (!datasetId) return;

    const queryObjects = CommonDataAdaptor.getQueryObjects(config);
    // данных нет в кэше - заказываем скачивание
    if (!data && cacheId) {
      this.loaded = false;
      loadDatas(datasetId, null, config.filters, queryObjects, { editor: editorActive, componentId });
      if (config.refresh && config.refreshTime) {
        // Интервальное обновление данных
        clearInterval(this.reloadTimer);
        this.reloadTimer = setInterval(
          () =>
            reloadDatas(datasetId, null, config.filters, queryObjects, {
              editor: editorActive,
              componentId,
            }),
          config.refreshTime * 1000,
        );
      } else if (this.reloadTimer) {
        clearInterval(this.reloadTimer);
        this.reloadTimer = null;
      }
    }

    // данные есть в кэше
    else if (data) {
      // данные закачаны в кэш полностью
      if (data.fetching === false) {
        // создаем адаптер данных, если необходимо
        if (dataAdaptor) dataAdaptor.refresh(data.data, config, null, cacheId);
        else dataAdaptor = new DataAdaptor(data.data, config, null, cacheId);
        this.setState({ dataAdaptor });
      }
      this.loaded = !data.fetching;
    }
  };

  refreshData = () => {
    const { config, cacheId, reloadDatas, editorActive, componentId } = this.props;
    const datasetId = getDatasetId(config);
    const queryObjects = CommonDataAdaptor.getQueryObjects(config);
    if (cacheId) {
      reloadDatas(datasetId, null, config.filters, queryObjects, {
        editor: editorActive,
        componentId,
      });
    }
  };

  mergeColors = () => {
    const { reportOptions, hsTheme } = this.props;
    const { palette } = hsTheme;
    this.chartColors = getColorset(reportOptions, palette);
  };

  handleClickItem = (option) => {
    const { config } = this.props;
    const { dataAdaptor } = this.state;
    let selectedLinks = [];
    if (option.dataType === 'edge') {
      // Проверяем, что кликнули на поток
      const findLink = this.state.selectedLinks.find(
        (link) => `${option.data.source}|${option.data.target}` === `${link.source}|${link.target}`,
      );
      const isClearSelected = Boolean(findLink);
      let tempLinks = [];
      if (!isClearSelected) {
        tempLinks = getLinksBySelected(option.data, dataAdaptor.plotData.links);
      }
      selectedLinks = tempLinks;
    } else {
      const node = {
        ...option.data,
        source: option.data.name,
        target: option.data.name,
      };
      const findLink = this.state.selectedLinks.find((link) => `${option.data.name}` === `${link.source}`);
      const isClearSelected = Boolean(findLink);
      let tempLinks = [];
      if (!isClearSelected) {
        tempLinks = getLinksBySelected(node, dataAdaptor.plotData.links, false);
      }
      selectedLinks = tempLinks;
    }

    if (isFilterMode(config)) {
      this.handleClickFilterMode(selectedLinks);
    }
    // Меняем цвет потока
    this.setState({ selectedLinks }, () => {
      const { style } = config;
      const newOptions = getUpdatedSpec({
        currentSpec: this.state.currentSpec,
        selectedLinks,
        seriesIndex: option.seriesIndex,
        style,
      });
      if (!newOptions) return;
      this.updateChartOptions(newOptions);
    });
  };

  handleClickFilterMode = (selectedLinks) => {
    const { report, config, changeMultipleGlobalFilterValueAndApply } = this.props;
    const { dataAdaptor } = this.state;
    const nodesSet = new Set();
    selectedLinks.forEach((link) => {
      nodesSet.add(link.source);
      nodesSet.add(link.target);
    });
    const filterNames = Array.from(nodesSet);
    if (!filterNames.length) {
      let unselected = [];
      if (config.filterCategories) {
        const keys = Object.keys(config.filterCategories);
        for (const key of keys) {
          unselected.push({
            fieldAlias: key,
            settings: {
              ...config.filterCategories[key],
              selected: [],
            },
          });
        }
      }
      changeMultipleGlobalFilterValueAndApply(unselected);
      return;
    }
    const nodes =
      dataAdaptor.plotData.nodes?.filter((node) => filterNames.includes(node.name)).map((node) => node) || [];
    if (!nodes.length) return;
    const filterValues = [];
    let selected = {};
    nodes.map((node) => {
      const categoryField = node.category;
      if (!categoryField) return;
      if (!selected[categoryField.name]) {
        selected[categoryField.name] = [];
      }
      selected[categoryField.name] = [...selected[categoryField.name], node.name];
      const variables = getVariablesForSettings({
        components: report.data.grid.components,
        fieldAlias: categoryField.alias || categoryField.name,
        selected: selected[categoryField.name],
      });

      filterValues.push({
        fieldAlias: categoryField.alias,
        settings: {
          selected: selected[categoryField.name],
          autofilter: null,
          autofilterChanged: true,
          filterMode: 'by value',
          variables,
        },
      });
    });

    if (filterValues.length) {
      changeMultipleGlobalFilterValueAndApply(filterValues);
    }
  };

  /** Plot chart **/
  plot = (props, data, spec) => {
    const { id } = props;
    if (props.data && !props.data.fetching) {
      /*** NO DATA ***/
      if (_.isEmpty(data)) {
        // Remove chart & show message
        this.showMessage(i18n.t('нет данных'));
      } else {
        /*** NORMAL PLOT ***/
        const currentSpec = _.cloneDeep(spec);
        _.set(currentSpec, 'id', id);
        _.set(currentSpec, 'color', this.chartColors);
        // Set drill flag

        this.setState({ currentSpec: currentSpec, selectedLinks: [] });

        if (this.Chart) {
          // Draw chart spec
          this.updateChartOptions(currentSpec);

          this.Chart.on('click', this.handleClickItem);
        }
      }
    }
  };

  updateChartOptions(options) {
    if (this.Chart) {
      this.Chart.setOption(options);

      // resize to container
      this.resizeTimer[`rs_${options.id}`] = setTimeout(() => {
        if (this.Chart) {
          this.Chart.resize();
        }
      }, 200); // await of pane animation been finished to get right dimensions*/
    }
  }

  showMessage = (text) => {
    const msg = (
      <div className='noData centered'>
        <div>{text || ''}</div>
      </div>
    );
    ReactDOM.render(msg, this.chartDiv);
  };

  resizeChart = () => {
    const self = this;
    const container = this.container;
    const { id, editorActive, inEditor, mainMenuActive } = this.props;
    const { dataAdaptor } = this.state;
    if (editorActive !== inEditor || mainMenuActive) return null;
    if (!self.chartDiv || !dataAdaptor || _.isEmpty(dataAdaptor.plotData)) return null;
    // fade out container
    container.classList.add('fade');
    // fade in for print version
    if (window.isPrinting) container.classList.remove('fade');
    // fade/resize timer
    if (this.resizeTimer[`rs_${id}`]) clearTimeout(this.resizeTimer[`rs_${id}`]);
    this.resizeTimer[`rs_${id}`] = setTimeout(() => {
      const timer = new Date().getTime();
      const loop = setInterval(() => {
        if (new Date().getTime() - timer > 350) {
          clearInterval(loop);
          // fade in container
          container.classList.remove('fade');
        }
      }, 50);
      if (this.Chart) {
        this.Chart.resize();
      }
    }, 600); // await of pane animation been finished to get right dimensions*/
    return true;
  };

  updateChart = () => {
    this.forceUpdate();
  };

  getStyles = () => {
    const { dataAdaptor } = this.state;
    const { config, hsTheme } = this.props;
    const { palette, gridLayout } = hsTheme;
    const data = dataAdaptor?.plotData?.plotData || [];
    const title = getLocal(config, 'title');
    const subtitle = getLocal(config, 'subtitle');
    const bottomSubtitle = _.get(config, 'bottomSubtitle', false);
    const lastDataItem = _.last(data) || {};
    const subheader = lastDataItem.subheader || null;
    const isEnabledBorder = _.get(config, 'outline.enabled', false);
    const borderWidth = isEnabledBorder ? _.get(config, 'outline.width', 1) : 1;
    const borderColor = _.get(config, 'outline.color', 'rgba(221, 223, 228, 1)');
    const headerBorderStyle = isEnabledBorder ? `${borderWidth}px solid ${borderColor}` : 'none';

    return {
      header: {
        color: palette.secondaryTextColor,
        display: !config.showtitle ? 'none' : '',
      },
      title: {
        whiteSpace: (subheader || subtitle) && !bottomSubtitle ? 'nowrap' : '',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: !config.showtitle || !title ? 'none' : '',
      },
      subtitle: {
        color: palette.componentSubtitleTextColor,
        whiteSpace: config.title ? 'nowrap' : '',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: subheader || subtitle ? '' : 'none',
      },
      container: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        position: 'relative',
        border: 'none',
        backgroundColor: gridLayout.paneColor,
      },
      body: {
        position: 'relative',
        flexGrow: 1,
        borderBottomLeftRadius: 'inherit',
        borderBottomRightRadius: 'inherit',
      },
      chart: {
        position: 'absolute',
        width: 'auto',
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        borderBottomLeftRadius: 'inherit',
        borderBottomRightRadius: 'inherit',
        top: (config.margin.t || 0) + (config.margin.pad || 0),
        right: (config.margin.r || 0) + (config.margin.pad || 0),
        bottom: (config.margin.b || 0) + (config.margin.pad || 0),
        left: (config.margin.l || 0) + (config.margin.pad || 0),
      },
      borderTitle: {
        borderBottom: headerBorderStyle,
      },
    };
  };

  renderTitles(styles, title, subtitle) {
    const { dataAdaptor } = this.state;
    const data = dataAdaptor?.plotData?.plotData || [];
    const lastDataItem = _.last(data) || {};
    const subheader = lastDataItem.subheader || null;

    return (
      <div className='componentHeader' style={{ ...styles.header, ...styles.borderTitle }}>
        <span>
          <span>
            <span className='titleText strongly' style={styles.title}>
              {title || ''}
            </span>
            <span className='subtitleText' style={styles.subtitle}>
              {subheader || subtitle}
            </span>
          </span>
          <span className='path' />
        </span>
      </div>
    );
  }

  render() {
    const { dataAdaptor } = this.state;
    const { config, componentId, pluginImports } = this.props;
    const styles = this.getStyles();
    const { LoadProgress } = pluginImports.components;

    const data = dataAdaptor?.plotData?.plotData || [];
    const lastDataItem = _.last(data) || {};
    const subheader = lastDataItem.subheader || null;
    const classNames = ['hsChartContainer', 'ECharts'];
    const chartClassNames = ['componentContainer'];
    const title = getLocal(config, 'title');
    const subtitle = getLocal(config, 'subtitle');
    const bottomSubtitle = _.get(config, 'bottomSubtitle', false);
    if (this.hasDrillDown) classNames.push('hasDrillDown');
    if (!!bottomSubtitle) chartClassNames.push('bottomSubTitle');

    return (
      <div
        key={'container' + componentId}
        id={'container_' + componentId}
        className={classNames.join(' ')}
        ref={(c) => {
          this.container = c;
        }}
        style={styles.container}
      >
        {this.renderTitles(styles, title, subheader || subtitle)}
        <div className='componentBody' style={styles.body}>
          <div
            className={chartClassNames.join(' ')}
            style={styles.chart}
            id={'echarts_' + componentId}
            key={'echarts_' + componentId}
            ref={(c) => {
              this.chartDiv = c;
            }}
          />
          {!this.loaded && !config.hideSpinner && <LoadProgress className='centered' />}
          <div
            className='backSide'
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: _.unescape(getDescription(config) || '') }}
          />
        </div>
      </div>
    );
  }
}
