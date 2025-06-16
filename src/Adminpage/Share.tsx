import React, { useEffect, useState } from "react";
import TempTable from "../component/Model/TempTable";
import FormModal from "../component/Model/FormModal";
import { SHARE_TABLE_COLUMNS } from "../utils/helpers/TableColumns";
import { SHARE_FORM_FIELDS } from "../utils/helpers/FormField";
import { message } from "antd";
import Swal from "sweetalert2";
import {
  getAllShares,
  createShare as createShareService,
  updateShare as updateShareService,
  deleteShare as deleteShareService,
  findSharesByUserScript,
} from "../services/shareService";
import { getAllUsers } from "../services/userService";
// import { getScripts } from "../services/scriptService";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  setShares,
  addShare,
  updateShare as updateShareAction,
  deleteShare,
  setLoading,
  setError,
} from "../redux/slices/shareSlice";
import type { ShareData } from "../redux/slices/shareSlice";
import { getAllScripts } from "./../services/scriptService";
import { toast, ToastContainer } from "react-toastify";
import { Select, Input, Space, Row, Col } from "antd";
import { DatePicker } from "antd";
import dayjs from "dayjs";

interface FormValues {
  key?: string;
  user: string;
  script: string;
  qty: string;
  type: string;
  price: string;
  position: string;
  averagePrice?: string;
}

const SharePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    shares = [],
    loading,
    error,
  } = useAppSelector((state) => state.share);
  // const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState<FormValues | null>(null);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
  const [scripts, setScripts] = useState<{ value: string; label: string }[]>(
    []
  );
  const [selectedUser, setSelectedUser] = useState<string | undefined>(
    undefined
  );
  const [selectedScript, setSelectedScript] = useState<string | undefined>(
    undefined
  );
  const [scriptPrices, setScriptPrices] = useState<Record<string, number>>({});
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >([null, null]);
  const fetchDropdownData = async () => {
    try {
      const [usersResponse, scriptsResponse] = await Promise.all([
        getAllUsers({ pageNumber: 1, pageSize: 100, search: "" }),
        getAllScripts({ pageNumber: 1, pageSize: 4000 }),
      ]);

      const userOptions = usersResponse.data.map((user: any) => ({
        value: user.id.toString(),
        label: `${user.name} (${user.uid})`,
      }));
      console.log("scriptsResponse", scriptsResponse);
      const scriptOptions = scriptsResponse.data.map((script: any) => ({
        value: script.id.toString(),
        label: `${script.name}(${script.type})`,
      }));

      const pricesMap = scriptsResponse.data.reduce(
        (acc: Record<string, number>, script: any) => {
          acc[script.id.toString()] = script.current_rate;
          return acc;
        },
        {}
      );

      setUsers(userOptions);
      setScripts(scriptOptions);
      setScriptPrices(pricesMap);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      message.error("Failed to load dropdown data");
    }
  };
  // const handleScriptChange = (value: string, form: any) => {
  //   // Get the price for the selected script
  //   const price = scriptPrices[value];

  //   // Set the price field value if a price exists
  //   console.log("price::", price);
  //   if (price !== undefined) {
  //     form.setFieldsValue({
  //       price: price.toString(),
  //     });
  //   }
  // };
  const fetchShares = async (
    search: string = "",
    userId?: string,
    scriptId?: string
  ) => {
    dispatch(setLoading(true));
    const startDate =
      dateRange && dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : undefined;
    const endDate =
      dateRange && dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : undefined;

    // console.log("startDate",startDate)
    // console.log("endDate",endDate)
    try {
      const result = await getAllShares({
        pageNumber: currentPage,
        pageSize: pageSize,
        search: search,
        userId: userId,
        scriptId: scriptId,
        startDate: startDate,
        endDate: endDate,
      });

      if (result) {
        const transformedData = result.data.map((share: any) => {
          const avgPrice = parseFloat(share.avgPrice) || 0;
          const profitLoss = parseFloat(share.profit_loss) || 0;

          return {
            key: share.id.toString(),
            user: share.user,
            script: share.script || { id: 0, name: "N/A" },
            qty: share.qty,
            type: share.type,
            price: parseFloat(share.price),
            avgPrice: Number(avgPrice), // Send as number
            profit_loss: Number(profitLoss), // Send as number
            position: share.position,
            create_date: share.create_date,
            updated_date: share.updated_date,
          };
        });
        dispatch(setShares(transformedData));
        setTotalItems(result.total || 0);
      } else {
        dispatch(setShares([]));
        setTotalItems(0);
      }
    } catch (error) {
      dispatch(setError("Failed to fetch shares"));
      message.error("Failed to fetch shares");
      console.error("Fetch shares error:", error);
      dispatch(setShares([]));
      setTotalItems(0);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchShares(searchText, selectedUser, selectedScript);
  }, [
    dispatch,
    currentPage,
    pageSize,
    searchText,
    selectedUser,
    selectedScript,
    dateRange,
  ]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleTableChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleUserFilterChange = (value: string | undefined) => {
    setSelectedUser(value);
    setCurrentPage(1);
  };

  const handleScriptFilterChange = (value: string | undefined) => {
    setSelectedScript(value);
    setCurrentPage(1);
  };

  const createShare = async (values: FormValues) => {
    dispatch(setLoading(true));
    try {
      // Get current shares for this user and script
      const currentSharesResponse = await findSharesByUserScript(
        parseInt(values.user),
        parseInt(values.script)
      );
      const currentShares = currentSharesResponse.data || [];

      // Sort transactions chronologically by date (assuming create_date is reliable)
      const sortedTransactions = currentShares.sort(
        (a: any, b: any) =>
          new Date(a.create_date).getTime() - new Date(b.create_date).getTime()
      );

      let currentHoldingQty = 0;
      let totalCostOfHolding = 0;

      // Calculate holding state before adding the new transaction
      sortedTransactions.forEach((item: any) => {
        const qty = item.qty;
        const price = item.price;
        const type = item.type;

        if (type === "buy") {
          currentHoldingQty += qty;
          totalCostOfHolding += qty * price;
        } else if (type === "sell") {
          const avgCostBeforeSell =
            currentHoldingQty > 0 ? totalCostOfHolding / currentHoldingQty : 0;
          if (currentHoldingQty >= qty) {
            totalCostOfHolding -= avgCostBeforeSell * qty;
            currentHoldingQty -= qty;
          } else {
            totalCostOfHolding = 0;
            currentHoldingQty = 0;
          }
        }
      });

      // Calculate total *net* quantity (Buy - Sell) before the new transaction to check available shares
      const totalNetQtyBeforeNew = sortedTransactions.reduce(
        (sum: number, share: any) =>
          sum + (share.type === "buy" ? share.qty : -share.qty),
        0
      );

      // For sell transaction, check if user has enough shares
      if (values.type === "sell") {
        if (totalNetQtyBeforeNew < parseInt(values.qty)) {
          toast.error("Not enough shares available for selling");
          dispatch(setLoading(false));
          return;
        }
      }

      const newQty = parseInt(values.qty);
      const newPrice = parseFloat(values.price);

      let avgPriceForNewRecord = 0;
      let profitLossForNewRecord = 0;

      // Calculate holding state *after* adding the new transaction temporarily to get the final average price for the record
      let postTransactionHoldingQty = currentHoldingQty;
      let postTransactionTotalCost = totalCostOfHolding;

      if (values.type === "buy") {
        postTransactionHoldingQty += newQty;
        postTransactionTotalCost += newQty * newPrice;
        // Average price for a buy record is the average cost of the holding *after* the buy
        avgPriceForNewRecord =
          postTransactionHoldingQty > 0
            ? postTransactionTotalCost / postTransactionHoldingQty
            : newPrice;
      } else if (values.type === "sell") {
        // Average cost of holding *before* this sell
        const currentAvgCostBeforeSell =
          currentHoldingQty > 0 ? totalCostOfHolding / currentHoldingQty : 0;

        // Calculate profit/loss for this sell transaction
        profitLossForNewRecord = (newPrice - currentAvgCostBeforeSell) * newQty;

        // Calculate the holding state after the sell
        if (currentHoldingQty >= newQty) {
          postTransactionTotalCost -= currentAvgCostBeforeSell * newQty;
          postTransactionHoldingQty -= newQty;
        } else {
          postTransactionTotalCost = 0;
          postTransactionHoldingQty = 0;
        }

        // Average price for a sell record is typically the average cost of the shares sold (average cost before sell)
        // Based on the image, it seems the average price shown for a sell transaction in the history is the average cost *before* the sell.
        // Let's use that for the record's avgPrice.
        avgPriceForNewRecord = currentAvgCostBeforeSell;
      }

      const shareData = {
        user_id: parseInt(values.user),
        script_id: parseInt(values.script),
        qty: newQty,
        type: values.type,
        price: newPrice,
        position: values.position || "open",
        avgPrice: avgPriceForNewRecord, // Use the calculated average price for the record
        profit_loss: profitLossForNewRecord, // Use the calculated profit/loss
      };

      const response = await createShareService(shareData);

      // Assuming response.data is the newly created share object with an id
      if (response && response) {
        dispatch(addShare(response)); // Dispatch the newly created share object
        toast.success("Share created successfully");
        await fetchShares(searchText, selectedUser, selectedScript);
      } else {
        toast.error("Failed to create share: Invalid response from server");
      }
    } catch (error: any) {
      console.error("Create share error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create share";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
      setModalOpen(false);
      setEditData(null);
    }
  };

  const handleEdit = async (record: ShareData) => {
    setIsEdit(true);
    try {
      // Get all shares for this user and script
      const currentSharesResponse = await findSharesByUserScript(
        parseInt(record.user.id.toString()),
        parseInt(record.script?.id.toString() || "0")
      );
      const currentShares = currentSharesResponse.data || [];

      // Calculate total quantity and total price of all shares (excluding the current record)
      const totalQty = currentShares.reduce(
        (sum: number, share: any) =>
          sum + (share.type === "buy" ? share.qty : -share.qty),
        0
      );
      const totalPrice = currentShares.reduce(
        (sum: number, share: any) =>
          sum +
          (share.type === "buy"
            ? share.qty * share.price
            : -share.qty * share.price),
        0
      );

      // Calculate current average price excluding the current record
      const currentAvgPrice = totalQty > 0 ? totalPrice / totalQty : 0;

      const formValues: FormValues = {
        key: record.key,
        user: record.user.id.toString(),
        script: record.script?.id.toString() || "0",
        qty: record.qty.toString(),
        type: record.type,
        price: record.price.toString(),
        position: record.position || "open",
        // For sell transactions, set avgPrice to 0
        // For buy transactions, use the existing avgPrice
        averagePrice: record.type === "sell" ? "0" : currentAvgPrice.toString(),
      };
      setEditData(formValues);
      setModalOpen(true);
    } catch (error) {
      console.error("Error fetching shares for edit:", error);
      message.error("Failed to load share data");
    }
  };

  const updateShare = async (key: string, values: FormValues) => {
    dispatch(setLoading(true));
    try {
      // Get all shares for this user and script
      const currentSharesResponse = await findSharesByUserScript(
        parseInt(values.user),
        parseInt(values.script)
      );
      const allShares = currentSharesResponse.data || [];

      // Filter out the record being updated and sort chronologically
      const sharesBeforeUpdate = allShares
        .filter((share: any) => share.id.toString() !== key)
        .sort(
          (a: any, b: any) =>
            new Date(a.create_date).getTime() -
            new Date(b.create_date).getTime()
        );

      let currentHoldingQtyBeforeUpdate = 0;
      let totalCostOfHoldingBeforeUpdate = 0;

      // Calculate holding state before the update
      sharesBeforeUpdate.forEach((item: any) => {
        const qty = item.qty;
        const price = item.price;
        const type = item.type;

        if (type === "buy") {
          currentHoldingQtyBeforeUpdate += qty;
          totalCostOfHoldingBeforeUpdate += qty * price;
        } else if (type === "sell") {
          const avgCostBeforeSell =
            currentHoldingQtyBeforeUpdate > 0
              ? totalCostOfHoldingBeforeUpdate / currentHoldingQtyBeforeUpdate
              : 0;
          if (currentHoldingQtyBeforeUpdate >= qty) {
            totalCostOfHoldingBeforeUpdate -= avgCostBeforeSell * qty;
            currentHoldingQtyBeforeUpdate -= qty;
          } else {
            totalCostOfHoldingBeforeUpdate = 0;
            currentHoldingQtyBeforeUpdate = 0;
          }
        }
      });

      // Calculate total *net* quantity (Buy - Sell) before the update to check available shares for a sell update
      const totalNetQtyBeforeUpdate = sharesBeforeUpdate.reduce(
        (sum: number, share: any) =>
          sum + (share.type === "buy" ? share.qty : -share.qty),
        0
      );

      // For sell transaction update, check if user has enough shares *before* the update
      if (values.type === "sell") {
        // We need to check if the quantity being *sold* (the new quantity) exceeds the shares available *before* this transaction.
        if (totalNetQtyBeforeUpdate < parseInt(values.qty)) {
          toast.error("Not enough shares available for selling");
          dispatch(setLoading(false));
          return;
        }
      }

      const newQty = parseInt(values.qty);
      const newPrice = parseFloat(values.price);

      let avgPriceForUpdatedRecord = 0;
      let profitLossForUpdatedRecord = 0;

      // Calculate holding state *after* the updated transaction temporarily
      let postUpdateHoldingQty = currentHoldingQtyBeforeUpdate;
      let postUpdateTotalCost = totalCostOfHoldingBeforeUpdate;

      if (values.type === "buy") {
        postUpdateHoldingQty += newQty;
        postUpdateTotalCost += newQty * newPrice;
        // Average price for a buy record is the average cost of the holding *after* the buy
        avgPriceForUpdatedRecord =
          postUpdateHoldingQty > 0
            ? postUpdateTotalCost / postUpdateHoldingQty
            : newPrice;
      } else if (values.type === "sell") {
        // Average cost of holding *before* this sell update
        const currentAvgCostBeforeUpdate =
          currentHoldingQtyBeforeUpdate > 0
            ? totalCostOfHoldingBeforeUpdate / currentHoldingQtyBeforeUpdate
            : 0;

        // Calculate profit/loss for this sell transaction
        profitLossForUpdatedRecord =
          (newPrice - currentAvgCostBeforeUpdate) * newQty;

        // Calculate the holding state after the sell update
        if (currentHoldingQtyBeforeUpdate >= newQty) {
          postUpdateTotalCost -= currentAvgCostBeforeUpdate * newQty;
          postUpdateHoldingQty -= newQty;
        } else {
          postUpdateTotalCost = 0;
          postUpdateHoldingQty = 0;
        }

        // Average price for a sell record is typically the average cost of the shares sold (average cost before sell)
        // Based on the image, let's use the average cost *before* the sell for the record's avgPrice.
        avgPriceForUpdatedRecord = currentAvgCostBeforeUpdate;
      }

      const shareData = {
        id: Number(key),
        user_id: parseInt(values.user),
        script_id: parseInt(values.script),
        qty: newQty,
        type: values.type as "buy" | "sell",
        price: newPrice,
        position: values.position || "open",
        avgPrice: avgPriceForUpdatedRecord, // Use the calculated average price for the record
        profit_loss: profitLossForUpdatedRecord, // Use the calculated profit/loss
      };

      // Construct the data object with 'key' for the service call
      const serviceUpdateData = {
        id: Number(key), // Use the record key as the key for the service
        user_id: parseInt(values.user),
        script_id: parseInt(values.script),
        qty: newQty,
        type: values.type as "buy" | "sell",
        price: newPrice,
        position: values.position || "open",
        avgPrice: avgPriceForUpdatedRecord,
        profit_loss: profitLossForUpdatedRecord,
      };
      const response = await updateShareService(serviceUpdateData);
      // Assuming response is the updated share object from backend, which should be ShareData

      if (response && response) {
        const updatedShare = {
          ...response, // Spread the updated fields from the backend response (which is ShareData)
          key: response.key, // ShareData should have a key, use it directly
          // Assuming response includes user and script objects with id, name, uid
          user: response.user, // Use user object from response
          script: response.script, // Use script object from response
        };
        dispatch(updateShareAction(updatedShare)); // Dispatch with the correctly formatted object

        toast.success("Share updated successfully");
        await fetchShares(searchText, selectedUser, selectedScript);
      } else {
        toast.error("Failed to update share: Invalid response from server");
      }
    } catch (error: any) {
      console.error("Update share error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update share";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
      setModalOpen(false);
      setEditData(null);
    }
  };

  const handleDelete = async (key: string) => {
    dispatch(setLoading(true));
    try {
      await deleteShareService(key);
      dispatch(deleteShare(key));
      toast.success("Share deleted successfully");
      await fetchShares(searchText, selectedUser, selectedScript);
    } catch (error) {
      console.error("Delete share error:", error);
      dispatch(setError("Failed to delete share"));
      toast.error("Failed to delete share");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCreate = () => {
    setIsEdit(false);
    setEditData(null);
    setModalOpen(true);
  };

  const handleDeleteConfirm = (key: string) => {
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
        handleDelete(key);
      }
    });
  };

  const getFormFields = () => {
    return SHARE_FORM_FIELDS.map((field) => {
      if (field.name === "user") {
        return {
          ...field,
          options: users,
        };
      }
      if (field.name === "script") {
        return {
          ...field,
          options: scripts,
          // Add the onSelect handle
        };
      }
      return field;
    });
  };
  const handleDateRangeChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null],
    dateStrings: [string, string]
  ) => {
    console.log("dates", dates);
    setDateRange(dates);
    setCurrentPage(1);
  };
  return (
    <>
      <ToastContainer />
      <TempTable
        title="Share Management"
        columns={SHARE_TABLE_COLUMNS}
        data={shares}
        searchKey="user"
        onCreate={handleCreate}
        createButtonText="Add Share"
        onEdit={handleEdit}
        onDelete={handleDeleteConfirm}
        required={true}
        loading={loading}
        onSearch={handleSearch}
        onTableChange={handleTableChange}
        currentPage={currentPage}
        pageSize={pageSize}
        total={totalItems}
        customFilters={
          <Row gutter={16} align="middle">
            <Col>
              <Select
                allowClear
                placeholder="Filter by user"
                style={{ width: 300 }}
                onChange={handleUserFilterChange}
                options={users}
                value={selectedUser}
              />
            </Col>
            <Col>
              <Select
                allowClear
                showSearch
                placeholder="Filter by script"
                style={{ width: 300 }}
                onChange={handleScriptFilterChange}
                optionFilterProp="label" // Changed from "children" to "label"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={scripts}
                value={selectedScript}
              />
            </Col>
            <Col>
              <DatePicker.RangePicker
                style={{ width: 250 }}
                onChange={handleDateRangeChange}
                value={dateRange}
                disabledDate={(current) =>
                  current && current > dayjs().endOf("day")
                }
                format="DD-MM-YYYY"
                showTime={false}
              />
            </Col>
          </Row>
        }
      />

      <FormModal
        // form={form}
        scriptPrices={scriptPrices}
        open={modalOpen}
        title={isEdit ? "Edit Share" : "Create Share"}
        formFields={getFormFields()}
        initialValues={editData || {}}
        onCancel={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        onSubmit={(values: FormValues) => {
          // console.log('Form values:', values);
          if (isEdit && editData?.key) {
            updateShare(editData.key, values);
          } else {
            createShare(values);
          }
          setModalOpen(false);
          setEditData(null);
        }}
        isEdit={isEdit}
        loading={loading}
      />
    </>
  );
};

export default SharePage;
