import ComponentTypeManager from '../../managers/ComponentTypeManager';
import { getGrid, getLevels, getTooltip } from './specGeneratorHelpers';

export default class EChartsSpecGenerator {
  constructor(type) {
    this.type = type;
    this.data = [];
    this.series = [];
  }

  static getDefaultSpec(type) {
    const defaultComponent = new ComponentTypeManager(type).getDefaultComponent();
    return defaultComponent.spec || {};
  }

  getSpec = (config, data) => {
    let links = [];
    let nodes = [];
    let levels = [];
    if (data?.links?.length) {
      const columns = config?.columns || {};
      levels = getLevels(config);
      links = data.links;
      nodes = data.nodes.map((node) => {
        const field = columns[node.category.id];
        if (field && node?.colors[field.colorBy?.value]) {
          return {
            ...node,
            itemStyle: {
              color: node?.colors[field.colorBy.value],
            },
          };
        }
        return node;
      });
    }
    return {
      tooltip: getTooltip({ config, data: data?.plotData }),
      grid: getGrid(),
      series: [
        {
          name: config.title,
          type: 'sankey',
          orient: config.orientation,
          draggable: false,
          layoutIterations: 0,
          emphasis: {
            focus: 'trajectory',
          },
          levels,
          data: nodes,
          links,
        },
      ],
    };
  };
}
