// pages/ScriptPage.tsx

import React, { useEffect, useState } from "react";
import TempTable from "../component/Model/TempTable";
import FormModal from "../component/Model/FormModal";
import { SCRIPT_TABLE_COLUMNS } from "../utils/helpers/TableColumns";
import { SCRIPT_FORM_FIELDS } from "../utils/helpers/FormField";
import { message } from "antd";
import Swal from "sweetalert2";
import {
  getAllScripts,
  createScript as createScriptService,
  updateScript as updateScriptService,
  deleteScript as deleteScriptService,
  
} from "../services/scriptService";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
// import { type } from '../redux/store';
import {
  setScripts,
  setLoading,
  setError,
  setSelectedScript,
} from "../redux/slices/scriptSlice";
import { toast, ToastContainer } from "react-toastify";

interface ScriptData {
  key: string;
  id: string;
  name: string;
  current_rate: number;
  status: boolean | string;
  high_value: number;
  low_value: number;
  volume: number;
  closing_price: number;
  type:string;
}

const ScriptPage: React.FC = () => {
  const dispatch = useDispatch();
  const { scripts, loading,selectedScript } = useSelector(
    (state: RootState) => state.script
  );
  const [modalOpen, setModalOpen] = React.useState(false);
  const [isEdit, setIsEdit] = React.useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  // Fetch scripts from API on mount
 

  const fetchScripts = async (search: string = "") => {
    dispatch(setLoading(true));
   
    try {
      const result = await getAllScripts({
        pageNumber: currentPage,
        pageSize: pageSize,
        search: search,
      });
      console.log("result script::",result)
      const transformedData: ScriptData[] = result.data.map(
        (script: any, index: number) => ({
          key: script.id?.toString() || index.toString(),
          id: script.id,
          name: script.name,
          current_rate: script.current_rate,
          status: script.status === true ? "active" : "inactive",
          high_value: script.high_value,
          low_value: script.low_value,
          volume: script.volume,
          closing_price: script.closing_price,
          type:script.type,
        })
      );

      dispatch(setScripts(transformedData));
       setTotalUsers(result.total || 0);
    } catch (error) {
      dispatch(setError("Failed to fetch scripts"));
      message.error("Failed to fetch scripts");
      console.error("Fetch scripts error:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };
//  const fetchScripts = async (search: string = "") => {
//   dispatch(setLoading(true));

//   try {
//     // Step 1: Fetch full stock list
//     const stockData = await fetchStockDetails();
//     console.log("stockData",stockData)
//     // Step 2: Filter by search text
//     const filteredData = search
//       ? stockData.filter((script: any) =>
//           script.name?.toLowerCase().includes(search.toLowerCase()) ||
//           script.symbol?.toLowerCase().includes(search.toLowerCase())
//         )
//       : stockData;
//       console.log("stockData::",stockData)
//     // Step 3: Map and transform data
//     const transformedData: ScriptData[] = filteredData.map((script: any, index: number) => ({
//       key: script.symbol || index.toString(),
//       id: index + 1,
//       name: script.name || script.symbol,
//       current_rate: script.current_rate,
//       status: "active", // Can be customized
//       high_value: script.high_value || 0,
//       low_value: script.low_value || 0,
//       volume: script.volume || 0,
//       closing_price: script.closing_price || 0,
//       type: 'BSE',
//     }));

//     // Step 4: Manual pagination
//     const startIndex = (currentPage - 1) * pageSize;
//     const paginatedData = transformedData.slice(startIndex, startIndex + pageSize);

//     // Step 5: Update Redux and UI
//     dispatch(setScripts(paginatedData));
//     setTotalUsers(transformedData.length); // total without pagination
//   } catch (error) {
//     dispatch(setError("Failed to fetch stock data"));
//     message.error("Failed to fetch stock data");
//     console.error("Fetch stock details error:", error);
//   } finally {
//     dispatch(setLoading(false));
//   }
// };

 useEffect(() => {
    fetchScripts(searchText);
  }, [dispatch, currentPage, pageSize, searchText]);
const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleTableChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };
  const createScript = async (values: Omit<ScriptData, "key">) => {
    dispatch(setLoading(true));
    try {
      const response = await createScriptService(values);
      if (response?.data?.id) {
        message.success("Script created successfully");
        fetchScripts();
      } else {
        dispatch(
          setError(response?.data?.message || "Failed to create script")
        );
        message.error(response?.data?.message || "Failed to create script");
      }
    } catch (error: any) {
      console.error("Create script error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create script";
      dispatch(setError(errorMessage));
      message.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateScript = async (key: string, values: Omit<ScriptData, "key">) => {
    dispatch(setLoading(true));
    try {
      const response = await updateScriptService(key, values);
      if (response?.data?.id) {
        toast.success("Script updated successfully");
        fetchScripts();
      } else {
        dispatch(
          setError(response?.data?.message || "Failed to update script")
        );
        toast.error(response?.data?.message || "Failed to update script");
      }
    } catch (error: any) {
      console.error("Update script error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update script";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const deleteScript = async (key: string) => {
    dispatch(setLoading(true));
    try {
      const response = await deleteScriptService(key);

      if (response?.status == 201) {
        message.success("Script deleted successfully");
        fetchScripts();
      } else {
        dispatch(
          setError(response?.data?.message || "Failed to delete script")
        );
        message.error(response?.data?.message || "Failed to delete script");
      }
    } catch (error) {
      console.error("Delete script error:", error);
      dispatch(setError("Failed to delete script"));
      message.error("Failed to delete script");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleEdit = (record: ScriptData) => {
    setIsEdit(true);
    dispatch(setSelectedScript(record));
    setModalOpen(true);
  };

  const handleCreate = () => {
    setIsEdit(false);
    dispatch(setSelectedScript(null));
    setModalOpen(true);
  };

  const handleDelete = (key: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteScript(key);
        Swal.fire("Deleted!", "Script has been deleted.", "success");
      }
    });
  };

  return (
    <>
    <ToastContainer/>
      <TempTable
        title="Script Management"
        columns={SCRIPT_TABLE_COLUMNS}
        data={scripts}
        searchKey="name"
        loading={loading}
        onCreate={handleCreate}
        onSearch={handleSearch}
        onTableChange={handleTableChange}
        createButtonText="Add Script"
        onEdit={handleEdit}
        onDelete={handleDelete}
        required={true}
        currentPage={currentPage}
        pageSize={pageSize}
        total={totalUsers}
      />

      <FormModal
        open={modalOpen}
        title={isEdit ? "Edit Script" : "Create Script"}
        formFields={SCRIPT_FORM_FIELDS}
        initialValues={selectedScript || {}}
        onCancel={() => {
          setModalOpen(false);
          dispatch(setSelectedScript(null));
        }}
        onSubmit={(values) => {
          const parsedValues = {
            ...values,
            current_rate: parseFloat(values.current_rate),
            high_value: parseFloat(values.high_value),
            low_value: parseFloat(values.low_value),
            volume: parseFloat(values.volume),
            closing_price: parseFloat(values.closing_price),
            status: values.status === "active",
            type:values.type,
          };

          if (isEdit && selectedScript) {
            updateScript(selectedScript.key, parsedValues);
          } else {
            createScript(parsedValues);
          }

          setModalOpen(false);
          dispatch(setSelectedScript(null));
        }}
        isEdit={isEdit}
      />
    </>
  );
};

export default ScriptPage;
