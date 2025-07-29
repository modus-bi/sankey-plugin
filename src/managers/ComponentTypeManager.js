import { nanoid } from 'nanoid';
import _ from 'lodash';

import CustomChart from '../modules/CustomChart';
import DataAdaptor from '../duplicates/adaptors/EChartsChartAdaptor/EChartsDataAdaptor';
import SpecGenerator from '../modules/CustomChart/specGenerator';
import ConfigEditor from '../duplicates/adaptors/CommonChartAdaptor/CommonConfigEditor';


export default class ComponentTypeManager {

  constructor(type) {
    this.type = type;
  }

  getDefaultComponent() {
    const componentNew = this._getDefaultComponent();
    if (componentNew && componentNew.config) {
      _.forEach(componentNew.config.axes || [], (axe) => {
        _.forEach(axe.fields, (f) => {
          if (!((f || {}).id || '').startsWith('__')) {
            f.id = nanoid();
          }
        });
      });
      componentNew.config.visuals = componentNew.config.visuals || [];
    }
    return componentNew;
  }

  _getDefaultComponent() {
    return {
      type: this.type,
      config: CustomChart.getDefaultConfig(),
      spec: {}
    };
  }

  getConfigEditor() {
    return new ConfigEditor();
  }

  getSpecGenerator() {
    return new SpecGenerator(this.type);
  }

  getDataAdaptor(data, config, spec, cacheId) {
    return new DataAdaptor(data, config, spec, cacheId);
  }
}
