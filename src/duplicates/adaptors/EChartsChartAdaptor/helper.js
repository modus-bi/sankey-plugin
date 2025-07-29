import _ from 'lodash';

export function getIndexValueAxeNumber(config) {
  const valueAxe = _.find(config.axes || [], ['type', 'values']) || {};
  return _.findIndex(valueAxe.fields || [], ['type', 'number']) || 0;
}

function getCategoryNodes(data, categories, indexValueAxeNumber) {
  const categoriesMap = new Map(); // Используем Set для хранения уникальных категорий
  // Проходим по каждому объекту исходных данных
  for (let i = 0; i < categories.length; i++) {
    data.forEach((item) => {
      // Извлекаем категории в порядке их следования
      if (item.hasOwnProperty(`[categories][${i}]${indexValueAxeNumber}`)) {
        const category = item[`[categories][${i}]${indexValueAxeNumber}`];
        categoriesMap.set(category, {
          categoryIndex: i,
          tooltips: item['tooltipSet'] || null,
          colors: item['colorSet'] || null,
        }); // Добавляем категорию в Set
      }
    });
  }

  const categoriesArray = [];
  categoriesMap.forEach(({ categoryIndex, tooltips, colors }, key) => {
    categoriesArray.push({ name: key, categoryIndex, category: categories[categoryIndex], tooltips, colors });
  });
  // Преобразуем Set в массив
  return categoriesArray;
}

export function getLinksAndNodes(data, categories = [], indexValueAxeNumber) {
  if (_.isEmpty(data) || !Array.isArray(data)) {
    return {
      links: [],
      nodes: [],
    };
  }
  const aggregated = new Map();
  const aggregatedGroup = new Map();
  let nodes = getCategoryNodes(data, categories, indexValueAxeNumber);
  // Проходим по каждому объекту исходных данных
  data.forEach((item) => {
    const categoriesKeys = [];
    // Извлекаем категории в порядке их следования
    let i = 0;
    while (item.hasOwnProperty(`[categories][${i}]${indexValueAxeNumber}`)) {
      categoriesKeys.push(item[`[categories][${i}]${indexValueAxeNumber}`]);
      i++;
    }
    const value = item[`values${indexValueAxeNumber}`];
    const subheader = item[`subheader`] || '';
    const tooltips = item[`tooltipSet`] || null;
    const colors = item[`colorSet`] || null;

    // Обрабатываем каждую пару категорий (source -> target)
    for (let j = 0; j < categoriesKeys.length - 1; j++) {
      const source = categoriesKeys[j];
      const target = categoriesKeys[j + 1];
      const key = `${source}|${target}`;

      aggregated.set(key, {
        value: (aggregated.get(key)?.value || 0) + value,
        subheader,
        tooltips,
        colors,
        categorySource: categories[j],
        categoryTarget: categories[j + 1],
      });
    }
    for (let j = 0; j < categoriesKeys.length; j++) {
      const source = categoriesKeys[j];
      const group = aggregatedGroup.get(categories[j].name) || {};
      aggregatedGroup.set(categories[j].name, {
        ...group,
        [`${source}`]: (group[source] || 0) + value,
      });
    }
  });
  nodes = nodes.map((node) => {
    const group = aggregatedGroup.get(node.category.name);
    if (group) {
      node.total = Object.values(group).reduce((acc, value) => acc + value, 0);
    }
    return node;
  });
  // Преобразуем агрегированные данные в массив объектов
  const links = [];
  aggregated.forEach((data, key) => {
    const [source, target] = key.split('|');
    let total = 0;
    const group = aggregatedGroup.get(data.categorySource.name);
    if (group) {
      total = group[source];
    }
    links.push({ source, target, ...data, total });
  });

  return {
    links,
    nodes,
  };
}

export function getLinksBySelected(selectedLink, links, addLink = true) {
  const target = selectedLink.target;
  const source = selectedLink.source;
  let stack = links.filter((link) => link.source === target);
  let otherTarget = links.filter((link) => link.source !== target);
  let otherSource = links.filter((link) => link.target !== source);
  let results = [];
  if (addLink) {
    results = [selectedLink];
  }
  // сбор узлов по target
  while (stack.length) {
    const node = stack.pop();
    results.push(node);
    stack = [...stack, ...otherTarget.filter((link) => link.source === node.target)];
    otherTarget = otherTarget.filter((link) => link.source !== node.target);
  }
  stack = links.filter((link) => link.target === source);

  // сбор узлов по source
  while (stack.length) {
    const node = stack.pop();
    results.push(node);
    stack = [...stack, ...otherSource.filter((link) => link.target === node.source)];
    otherSource = otherSource.filter((link) => link.target !== node.source);
  }

  return results;
}

export function getUpdatedSpec({ currentSpec, selectedLinks = [], seriesIndex = 0, style }) {
  if (!currentSpec) return null;
  const { selectedLineColor, selectedLineOpacity, unselectedLineOpacity, unselectedNodeOpacity } = style;
  const newOptions = _.cloneDeep(currentSpec);
  const nodesSet = new Set();
  selectedLinks.forEach((link) => {
    nodesSet.add(link.source);
    nodesSet.add(link.target);
  });
  newOptions.series[seriesIndex].links = newOptions.series[seriesIndex].links.map((link) => {
    const linkName = `${link.source}|${link.target}`;
    if (selectedLinks.find((option) => `${option.source}|${option.target}` === linkName)) {
      return {
        ...link,
        lineStyle: {
          color: selectedLineColor,
          opacity: selectedLineOpacity,
        },
      };
    }
    return {
      ...link,
      lineStyle: {
        opacity: selectedLinks.length ? unselectedLineOpacity : 0.2,
      },
    };
  });
  newOptions.series[seriesIndex].data = newOptions.series[seriesIndex].data.map((node) => {
    if (nodesSet.has(node.name)) {
      return node;
    }
    if (nodesSet.size) {
      return {
        ...node,
        itemStyle: {
          opacity: unselectedNodeOpacity,
        },
      };
    }
    return node;
  });
  return newOptions;
}
