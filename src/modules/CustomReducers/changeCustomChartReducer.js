import update from 'react-addons-update';
import _ from 'lodash';
import { getDefaultConfig } from '../CustomChart/specGeneratorHelpers';

export default function(state, action, options) {
  const { autoApplySettings } = options;

  return autoApplySettings(
    update(state, {
      component: {
        configDraft: {
          $apply: (config) => {
            const configNew = _.cloneDeep(config);

            if (action.command === 'changeOrient') {
              configNew.orientation = action.settings.value;
            }

            /* Всплывающая подсказка */
            if (action.command === 'changeBalloonTemplate') {
              configNew.balloonTemplate = action.settings?.value || null;
            }

            if (action.command === 'changeBalloonVisibility') {
              configNew.balloon.visible = action.settings.value;
            }

            if (action.command === 'changeBalloonFontSize') {
              configNew.balloon.fontsize = action.settings.value;
            }

            if (action.command === 'changeBalloonFontColor') {
              configNew.balloon.color = action.settings.value;
            }

            if (action.command === 'changeBalloonBgColor') {
              configNew.balloon.bgcolor = action.settings.value;
            }

            // Настройка полей
            if (action.command === 'onChangeColumnColorBy') {
              const value = action.settings.value;
              let columnByFieldId = {
                colorBy: null,
                tooltipBy: null,
              };
              if (configNew.columns[value.fieldId]) {
                columnByFieldId = configNew.columns[value.fieldId];
              }
              configNew.columns[value.fieldId] = {
                ...columnByFieldId,
                colorBy: value.option,
              };
            }

            if (action.command === 'onChangeColumnTooltipBy') {
              const value = action.settings.value;
              let columnByFieldId = {
                colorBy: null,
                tooltipBy: null,
              };
              if (configNew.columns[value.fieldId]) {
                columnByFieldId = configNew.columns[value.fieldId];
              }
              configNew.columns[value.fieldId] = {
                ...columnByFieldId,
                tooltipBy: value.option,
              };
            }

            // стилизация
            if (action.command === 'changeStyleSelectedLineColor') {
              const selectedLineColor = getDefaultConfig().style.selectedLineColor;
              if (!configNew.style) {
                configNew.style = {
                  selectedLineColor,
                };
              }
              configNew.style.selectedLineColor = action.settings.value ? action.settings.value : selectedLineColor;
            }

            if (action.command === 'changeStyleSelectedLineOpacity') {
              const selectedLineOpacity = getDefaultConfig().style.selectedLineOpacity;
              if (!configNew.style) {
                configNew.style = {
                  selectedLineOpacity,
                };
              }
              configNew.style.selectedLineOpacity = action.settings.value / 100;
            }

            if (action.command === 'changeStyleUnselectedLineOpacity') {
              const unselectedLineOpacity = getDefaultConfig().style.unselectedLineOpacity;
              if (!configNew.style) {
                configNew.style = {
                  unselectedLineOpacity,
                };
              }
              configNew.style.unselectedLineOpacity = action.settings.value / 100;
            }

            if (action.command === 'changeStyleUnselectedNodeOpacity') {
              const unselectedNodeOpacity = getDefaultConfig().style.unselectedNodeOpacity;
              if (!configNew.style) {
                configNew.style = {
                  unselectedNodeOpacity,
                };
              }
              configNew.style.unselectedNodeOpacity = action.settings.value / 100;
            }

            return configNew;
          },
        },
      },
    }),
  );
}
