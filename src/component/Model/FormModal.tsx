// components/common/FormModal.tsx

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button, Row, Col, Table } from "antd";
import { ShareHistoryTable } from "../../utils/helpers/TableColumns";
import { findSharesByUserScript } from "../../services/shareService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export interface FormField {
  label: string;
  name: string;
  type: "input" | "password" | "select";
  isEdit?: boolean;
  rules: {
    required?: boolean;
    message: string;
    pattern?: RegExp;
    type?: "email" | "number" | "string";
  }[];
  options?: { value: string | number; label: string }[];
  placeholder?: string;
}

interface FormModalProps {
  open: boolean;
  title: string;
  formFields: FormField[];
  initialValues?: Record<string, any>;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  isEdit?: boolean;
  loading?: boolean;
  scriptPrices?: Record<string, number>;
}

const FormModal: React.FC<FormModalProps> = ({
  open,
  title,
  formFields,
  initialValues,
  onCancel,
  onSubmit,
  isEdit = false,
  loading = false,
  scriptPrices,
}) => {
  const [form] = Form.useForm();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [shareData, setShareData] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(false);

  // Check if this is a share-related form
  const isShareForm = formFields.some(
    (field) => field.name === "user" || field.name === "script"
  );

  const fetchShareHistory = async (userId: string, scriptId: string) => {
    try {
      setTableLoading(true);
      const response = await findSharesByUserScript(
        parseInt(userId),
        parseInt(scriptId)
      );

      // Sort transactions chronologically by date (assuming create_date is reliable)
      const sortedTransactions = response.data.sort(
        (a: any, b: any) =>
          new Date(a.create_date).getTime() - new Date(b.create_date).getTime()
      );

      let currentHoldingQty = 0;
      let totalCostOfHolding = 0;

      const formattedData = sortedTransactions.map((item: any) => {
        const qty = item.qty;
        const price = item.price;
        const type = item.type;

        let avgPriceForRecord = "0.00";
        let profitLossForRecord = "0.00";
        let positionForRecord = currentHoldingQty; // Position before processing current item

        if (type === "buy") {
          // Update holding quantity and cost
          currentHoldingQty += qty;
          totalCostOfHolding += qty * price;
          // Average price is the average cost of the current holding after this buy
          avgPriceForRecord =
            currentHoldingQty > 0
              ? (totalCostOfHolding / currentHoldingQty).toFixed(2)
              : "0.00";
          positionForRecord = currentHoldingQty;
        } else if (type === "sell") {
          // Average cost of holding *before* this sell
          const avgCostBeforeSell =
            currentHoldingQty > 0 ? totalCostOfHolding / currentHoldingQty : 0;

          // Calculate profit/loss for this sell transaction
          profitLossForRecord = ((price - avgCostBeforeSell) * qty).toFixed(2);

          // Decrease holding quantity and cost proportionally
          if (currentHoldingQty >= qty) {
            totalCostOfHolding -= avgCostBeforeSell * qty;
            currentHoldingQty -= qty;
          } else {
            // Selling more than currently held - this scenario should ideally be prevented by validation,
            // but handle gracefully by closing the position and costing out based on available shares
            totalCostOfHolding = 0;
            currentHoldingQty = 0;
            // Recalculate profit/loss based on available shares sold
            // This part might need refinement based on exact business logic for overselling
            // For now, setting PL based on avg cost of available shares sold
            profitLossForRecord = (
              (price - avgCostBeforeSell) *
              (currentHoldingQty + qty)
            ).toFixed(2); // Calculate PL for qty sold up to available shares
          }

          // Average price for a sell transaction is typically the average cost of the shares sold
          avgPriceForRecord = avgCostBeforeSell.toFixed(2);
          positionForRecord = currentHoldingQty;
        }

        return {
          key: item.id,
          type: item.type,
          qty: item.qty,
          price: item.price,
          avgPrice: item.avgPrice || avgPriceForRecord, // Use backend avgPrice if available, otherwise calculated
          profit_loss: item.profit_loss || profitLossForRecord, // Use backend profit_loss if available, otherwise calculated
          position: item.position || positionForRecord, // Use backend position if available, otherwise calculated
          create_date: new Date(item.create_date).toLocaleDateString(),
        };
      });

      // After processing all transactions, the final currentHoldingQty and totalCostOfHolding represent the current state
      const finalAvgPrice =
        currentHoldingQty > 0
          ? (totalCostOfHolding / currentHoldingQty).toFixed(2)
          : "0.00";

      // Set average price and available shares (current holding quantity) in form
      if (form) {
        form.setFieldsValue({
          averagePrice: finalAvgPrice,
          availableShares: currentHoldingQty,
        });
      }

      setShareData(formattedData);
    } catch (error) {
      console.error("Error fetching share history:", error);
      toast.error("Failed to fetch share history");
    } finally {
      setTableLoading(false);
    }
  };

  const calculateAveragePrice = (formData: any) => {
    // This function is used for live calculation in the form *before* submission.
    // It should simulate adding the new transaction to the *current* holding.
    const currentQty = parseInt(formData.qty) || 0;
    const currentPrice = parseFloat(formData.price) || 0;
    const currentType = formData.type || "buy";

    // Get the current holding quantity and cost *before* this new transaction
    // This information should ideally come from the state updated by fetchShareHistory
    const availableShares = form.getFieldValue("availableShares") || 0;
    // To get the total cost of the current holding, we might need to store it in state
    // or recalculate it from the shareData, considering only transactions contributing to availableShares
    // Recalculating from shareData chronologically up to the current state is safer.

    let currentHoldingQtyBeforeNew = 0;
    let totalCostOfHoldingBeforeNew = 0;

    // Find the state of holding right before adding the new transaction
    // This requires iterating through the fetched shareData (which is already chronological)
    shareData.forEach((item: any) => {
      const qty = item.qty;
      const price = item.price;
      const type = item.type;

      if (type === "buy") {
        currentHoldingQtyBeforeNew += qty;
        totalCostOfHoldingBeforeNew += qty * price;
      } else if (type === "sell") {
        const avgCostBeforeSell =
          currentHoldingQtyBeforeNew > 0
            ? totalCostOfHoldingBeforeNew / currentHoldingQtyBeforeNew
            : 0;
        if (currentHoldingQtyBeforeNew >= qty) {
          totalCostOfHoldingBeforeNew -= avgCostBeforeSell * qty;
          currentHoldingQtyBeforeNew -= qty;
        } else {
          totalCostOfHoldingBeforeNew = 0;
          currentHoldingQtyBeforeNew = 0;
        }
      }
    });

    let newHoldingQty = currentHoldingQtyBeforeNew;
    let newTotalCost = totalCostOfHoldingBeforeNew;

    if (currentType === "buy") {
      newHoldingQty += currentQty;
      newTotalCost += currentQty * currentPrice;
    } else if (currentType === "sell") {
      // For a sell, the average price displayed in the form should still be the average cost of the holding *before* this sell
      // The profit/loss will be calculated on submission
      return currentHoldingQtyBeforeNew > 0
        ? (totalCostOfHoldingBeforeNew / currentHoldingQtyBeforeNew).toFixed(2)
        : "0.00";
    }

    // Return the new average cost after adding the potential buy transaction
    return newHoldingQty > 0
      ? (newTotalCost / newHoldingQty).toFixed(2)
      : "0.00";
  };

  useEffect(() => {
    if (open) {
      if (initialValues && Object.keys(initialValues).length > 0) {
        form.setFieldsValue(initialValues);
        setSelectedUser(initialValues.user);
        setSelectedScript(initialValues.script);
        if (initialValues.user && initialValues.script && isShareForm) {
          fetchShareHistory(initialValues.user, initialValues.script);
        }
      } else {
        form.resetFields();
        setSelectedUser(null);
        setSelectedScript(null);
        setShareData([]);
        // Set average price to 0 when creating new share (only for share forms)
        if (form && isShareForm) {
          form.setFieldsValue({
            averagePrice: "0.00",
          });
        }
      }
    }
  }, [open, initialValues, form]);

  const renderField = (field: FormField) => {
    const { type, name, options, placeholder } = field;

    switch (type) {
      case "input":
        return (
          <Input
            placeholder={placeholder}
            onChange={(e) => {
              // Only update average price for price and qty fields in share forms
              if (isShareForm && (name === "price" || name === "qty")) {
                const formData = form.getFieldsValue();
                const averagePrice = calculateAveragePrice(formData);
                form.setFieldsValue({
                  averagePrice: averagePrice,
                });

                // Add validation for sell quantity
                if (name === "qty" && formData.type === "sell") {
                  const availableShares =
                    form.getFieldValue("availableShares") || 0;
                  const sellQty = parseInt(e.target.value) || 0;
                  if (sellQty > availableShares) {
                    toast.error(
                      `Cannot sell more than ${availableShares} shares. Available shares: ${availableShares}`
                    );
                  }
                }
              }
            }}
          />
        );
      case "password":
        return <Input.Password placeholder={placeholder} />;
      case "select":
        return (
          <Select
            allowClear
            showSearch
            placeholder={placeholder || `Select ${field.label}`}
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            onChange={(value) => {
              if (field.name === "user") {
                setSelectedUser(value);
                if (value && selectedScript && isShareForm) {
                  fetchShareHistory(value, selectedScript);
                } else {
                  setShareData([]);
                }
              } else if (field.name === "script") {
                setSelectedScript(value);
                if (value && selectedUser && isShareForm) {
                  fetchShareHistory(selectedUser, value);
                } else {
                  setShareData([]);
                }
                if (value && !isEdit && isShareForm && scriptPrices) {
                  const price = scriptPrices[value];

                  if (price !== undefined) {
                    form.setFieldsValue({
                      price: price.toString(),
                    });
                  }
                }else{
                  form.setFieldsValue({price: scriptPrices[value].toString()})
                }
              } else if (field.name === "type" && value === "sell") {
                // Show available shares message when selecting sell type
                const availableShares =
                  form.getFieldValue("availableShares") || 0;
                if (availableShares <= 0) {
                  toast.warning("No shares available for selling");
                } else {
                  toast.info(
                    `Available shares for selling: ${availableShares}`
                  );
                }
              }
            }}
          >
            {options?.map((opt) => (
              <Select.Option key={opt.value} value={opt.value}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      open={open}
      title={<span className="text-xl font-bold">{title}</span>}
      destroyOnHidden={true}
      width={1000}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={[
        <Button
          key="cancel"
          onClick={() => {
            form.resetFields();
            onCancel();
          }}
        >
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => {
            const values = form.getFieldsValue();
            // Validate sell transaction
            if (values.type === "sell") {
              const availableShares =
                form.getFieldValue("availableShares") || 0;
              const sellQty = parseInt(values.qty) || 0;
              if (sellQty > availableShares) {
                toast.error(
                  `Cannot sell more than ${availableShares} shares. Available shares: ${availableShares}`
                );
                return;
              }
            }
            form
              .validateFields()
              .then((values) => onSubmit(values))
              .catch(() => {});
          }}
        >
          {isEdit ? "Update" : "Submit"}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
      >
        <Row gutter={16}>
          {formFields.map((field, index) => (
            <Col span={12} key={field.name}>
              <Form.Item
                label={
                  field.name === "password"
                    ? isEdit
                      ? "New Password"
                      : "Password"
                    : field.label
                }
                name={field.name}
                rules={[
                  ...(field.name === "password"
                    ? isEdit
                      ? [] // Not required in edit
                      : [
                          {
                            required: true,
                            message: "Please input the password!",
                          },
                        ]
                    : field.rules),
                  // Add custom validation for sell quantity
                  ...(field.name === "qty"
                    ? [
                        {
                          validator: async (
                            _: unknown,
                            value: string | number
                          ) => {
                            const type = form.getFieldValue("type");
                            if (type === "sell") {
                              const availableShares =
                                form.getFieldValue("availableShares") || 0;
                              const sellQty = parseInt(value.toString()) || 0;
                              if (sellQty > availableShares) {
                                throw new Error(
                                  `Cannot sell more than ${availableShares} shares`
                                );
                              }
                            }
                          },
                        },
                      ]
                    : []),
                ]}
              >
                {renderField(field)}
              </Form.Item>
            </Col>
          ))}
          {/* Show average price and available shares for share forms */}
          {isShareForm && (
            <>
              <Col span={12}>
                <Form.Item label="Average Price" name="averagePrice">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label=" Total Quantity" name="availableShares">
                  <Input disabled />
                </Form.Item>
              </Col>
            </>
          )}
        </Row>
      </Form>

      {/* Only show share history for share forms with selected user and script */}
      {isShareForm && (
        <div style={{ marginTop: "20px" }}>
          <h1 className="font-semibold text-[20px] py-4">
            Customer Share History
          </h1>
          <Table
            columns={[
              {
                title: "Type",
                dataIndex: "type",
                key: "type",
              },
              {
                title: "Quantity",
                dataIndex: "qty",
                key: "qty",
              },
              {
                title: "Price",
                dataIndex: "price",
                key: "price",
              },
              {
                title: "Average Price",
                dataIndex: "avgPrice",
                key: "avgPrice",
              },
              {
                title: "Profit/Loss",
                dataIndex: "profit_loss",
                key: "profit_loss",
                render: (value: string | number) => {
                  const numericValue =
                    typeof value === "string" ? parseFloat(value) : value;
                  let color = "#000000"; // Default black for zero

                  if (numericValue > 0) {
                    color = "#52c41a"; // Green for positive
                  } else if (numericValue < 0) {
                    color = "#ff4d4f"; // Red for negative
                  }

                  return (
                    <span style={{ color, fontWeight: 500 }}>
                      {numericValue.toFixed(2)}
                    </span>
                  );
                },
              },
              {
                title: "Position",
                dataIndex: "position",
                key: "position",
              },
              {
                title: "Date",
                dataIndex: "create_date",
                key: "create_date",
              },
            ]}
            dataSource={shareData}
            pagination={false}
            size="small"
            loading={tableLoading}
            scroll={{
              x: "max-content", // Horizontal scroll when needed
              y: 200, // Fixed vertical height with scroll
            }}
          />
        </div>
      )}
    </Modal>
  );
};

export default FormModal;
