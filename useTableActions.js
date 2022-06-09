import React, { useContext } from 'react';
import { get } from 'lodash';
import { useHistory } from 'react-router-dom';
import { DashboardPanelContext } from '../components/context/DashboardContext';
import { SET_VIEW_READ_ONLY } from '../components/context/reducer/actionTypes';
import { BSwalConfirmationDelete, BSwalDeleted, BSwalShowError } from '../common/BSwal';
import useHasPermission from './useHasPermission';
import FactCheckIcon from '../components/icons/factCheckIcon';
import InventoryIcon from '../components/icons/inventoryIcon';
import EditIcon from '../components/icons/editIcon';

const useTableActions = ({
  updatePermission,
  deletePermission,
  editURL,
  removePATH,
  tableRef,
  historyPermission = null,
  extraActions = null,
  extraActionsIcons = null,
  hasConfirmation = undefined,
  disableUpdate = undefined,
  confirmationHistory = '',
  confirmationHistoryNextButtonPermission = '',
}) => {
  const history = useHistory();
  const { globalDispatch, removeItem } = useContext(DashboardPanelContext);
  const useHasUpdatePermission = useHasPermission(updatePermission);
  const useHasDeletePermission = useHasPermission(deletePermission);
  return [
    useHasUpdatePermission
      ? (data) => {
          if (disableUpdate && !disableUpdate(data)) {
            return {
              icon: () => <EditIcon disabled />,
              tooltip: 'edit',
              iconProps: {
                id: `editt-${data.tableData.id}`,
              },
              onClick: () => {},
            };
          }

          return {
            icon: 'edit',
            tooltip: 'Edit',
            iconProps: {
              id: `edit-${data.tableData.id}`,
            },
            onClick: async (event, rowData) => {
              if (globalDispatch) globalDispatch({ type: SET_VIEW_READ_ONLY, value: false });
              history.push(`${editURL}${rowData.id}`);
            },
          };
        }
      : null,
    historyPermission
      ? (data) => ({
          icon: 'history',
          tooltip: 'History',
          iconProps: {
            id: `history-${data.tableData.id}`,
          },
          onClick: async (event, rowData) => {
            historyPermission(rowData.id);
          },
        })
      : null,

    extraActions && extraActionsIcons
      ? (data) => ({
          icon: extraActionsIcons[0],
          tooltip: extraActionsIcons[1],
          iconProps: {
            id:
              typeof extraActionsIcons[0] === 'string'
                ? extraActionsIcons[0].concat(`-${data.tableData.id}`)
                : 'icon'.concat(`-${data.tableData.id}`),
          },
          onClick: async (_event, rowData) => {
            if (extraActionsIcons[0] === 'assessment' && rowData.id) extraActions(rowData.id);
            else extraActions(rowData.tableData?.id);
          },
        })
      : null,
    (data) => {
      if (hasConfirmation) {
        if (hasConfirmation(data)) {
          return {
            icon: () => <InventoryIcon />,
            tooltip: 'Confirm/Reject',
            iconProps: {
              id: `check-${data.tableData.id}`,
            },
            onClick: (_event, rowData) => {
              if (globalDispatch) globalDispatch({ type: SET_VIEW_READ_ONLY, value: false });
              history.push(`${editURL}${rowData.id}?confirmation=true`);
            },
          };
        }
        return {
          icon: () => <InventoryIcon disabled />,
          tooltip: 'Confirm/Reject',
          iconProps: {
            id: `check-${data.tableData.id}`,
          },
          onClick: () => {},
        };
      }
    },
    confirmationHistory
      ? (confirmData) => ({
          icon: () => <FactCheckIcon />,
          tooltip: 'Confirm History',
          iconProps: {
            id: `check-${confirmData.tableData.id}`,
          },
          onClick: (_event, rowData) => {
            if (globalDispatch) globalDispatch({ type: SET_VIEW_READ_ONLY, value: false });
            history.push(
              `/workflow/process-task/${rowData.id}/${confirmationHistory}/${confirmationHistoryNextButtonPermission}`,
            );
          },
        })
      : null,

    removePATH && useHasDeletePermission
      ? (data) => ({
          icon: 'remove_circle',
          iconProps: {
            id: `remove-${data.tableData.id}`,
          },
          tooltip: 'Delete',
          onClick: async (_event, rowData) => {
            BSwalConfirmationDelete().then((result) => {
              if (result.value) {
                removeItem(removePATH, rowData.id)
                  .then((response) => {
                    if (response) {
                      if (response.status === 204) {
                        tableRef?.current?.onQueryChange();
                        BSwalDeleted();
                      }
                      window.location.reload();
                      if (response.status === 409) {
                        BSwalShowError(get(response, 'data.messages', []));
                      }
                    }
                  })
                  .finally();
              }
            });
          },
        })
      : null,
  ];
};

export default useTableActions;
