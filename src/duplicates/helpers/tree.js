import cloneDeep from 'lodash/cloneDeep';
import { customItems } from '../constants/calculatedFieldItems';

export function getFormula(node, { last = true, calcMode = false } = {}) {
  let text = '';
  switch (node.type) {
    case 'operator':
      text +=
        '(' +
        node.children
          .map((node_, nodeI) =>
            getFormula(node_, {
              last: last && nodeI === node.children.length - 1,
              calcMode,
            }),
          )
          .join(node.item.title);
      if (node.closed) {
        text += ')';
      } else if (node.children.length >= node.arity) {
        text += last ? '' : ')';
      } else if (node.children.length > 0 && node.children.slice(-1)[0].closed) {
        text += node.item.title;
      }
      break;
    case 'function':
      text += node.item.title + '(';
      text += node.children
        .map((node_, nodeI) =>
          getFormula(node_, {
            last: last && nodeI === node.children.length - 1,
            calcMode,
          }),
        )
        .join(', ');
      if (node.closed) {
        text += ')';
      } else if (node.children.length >= node.arity) {
        text += last ? '' : ')';
      } else if (node.children.length > 0) {
        text += '';
      }
      break;
    case 'parenthesis':
      text += '(';
      text += node.children
        .map((node_, nodeI) =>
          getFormula(node_, {
            last: last && nodeI === node.children.length - 1,
            calcMode,
          }),
        )
        .join(', ');
      if (node.closed) {
        text += ')';
      } else if (node.children.length >= node.arity) {
        text += last ? '' : ')';
      } else if (node.children.length > 0) {
        text += ', ';
      }
      break;
    case 'root':
      text += node.children
        .map((node_, nodeI) =>
          getFormula(node_, {
            last: last && nodeI === node.children.length - 1,
            calcMode,
          }),
        )
        .join(', ');
      break;
    case 'field':
      let title = node.item.title || node.item.alias || node.item.name;
      if (node.item.type !== 'constant') {
        title = calcMode ? `"${node.item.name}"` : `${title}`;
      }
      text += title;
      break;
  }
  return text;
}

export function replaceCustomFunctions(node) {
  if (!node.children) {
    return node;
  }
  node.children.forEach((childNode, childIndex) => {
    let replaced = false;
    customItems.forEach((item) => {
      if (childNode.item && childNode.item.tree && childNode.item.value === item.value) {
        const subTree = cloneDeep(item.tree);
        replaceOneCustomFunction(subTree, childNode.children);
        node.children[childIndex] = subTree;
        replaced = true;
      }
    });
    if (!replaced) {
      replaceCustomFunctions(childNode);
    }
  });

  return node;
}

export function replaceOneCustomFunction(node, fields) {
  if (!node.children) {
    return;
  }
  node.children.forEach((childNode, childIndex) => {
    if (typeof childNode === 'string' && childNode.startsWith('[Поле')) {
      const fieldIndex = childNode.slice('[Поле'.length, -1);
      node.children[childIndex] = fields[fieldIndex - 1];
    } else {
      replaceOneCustomFunction(childNode, fields);
    }
  });
}
