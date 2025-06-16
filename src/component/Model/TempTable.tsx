// components/common/TempTable.tsx
import { useState, useMemo } from "react";
import { Table, Input, Space, Typography, Button, Row, Col } from "antd";
import { SearchOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { SortOrder } from "antd/es/table/interface";

const { Title } = Typography;

interface TempTableProps<T> {
  title: string;
  columns: ColumnsType<T>;
  data: T[];
  searchKey: keyof T;
  onCreate?: () => void;
  createButtonText?: string;
  onEdit?: (record: T) => void;
  onDelete?: (id: string) => void;
  required?: boolean;
  onSearch?: (value: string) => void;
  onTableChange?: (page: number, size: number) => void;
  currentPage?: number;
  pageSize?: number;
  loading?: boolean;
  total?: number;
  searchText?: string;
  customFilters?: React.ReactNode;
}

const TempTable = <T extends object>({
  title,
  columns,
  data,
  searchKey,
  onCreate,
  createButtonText = "Create",
  onEdit,
  onDelete,
  loading = false,
  onSearch,
  onTableChange,
  currentPage = 1,
  pageSize = 5,
  total = 0,
  searchText,
  customFilters,
}: TempTableProps<T>) => {
  const [sorter, setSorter] = useState<{ columnKey: string; order: SortOrder }>({
    columnKey: '',
    order: null,
  });

  const indexColumn = {
    title: 'No.',
    dataIndex: 'index',
    key: 'index',
    width: 60,
    render: (_: any, __: any, index: number) => index + 1 + (currentPage - 1) * pageSize,
  };

  const actionColumn = {
    title: 'Actions',
    key: 'action',
    width: 180,
    render: (_: any, record: any) => (
      <Space size="middle">
        {onEdit && (
          <Button
            icon={<EditOutlined />}
            size="small"
            type="primary"
            onClick={() => onEdit(record)}
          >
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            icon={<DeleteOutlined />}
            type="primary"
            danger
            size="small"
            onClick={() => onDelete(record.key)}
          >
            Delete
          </Button>
        )}
      </Space>
    ),
  };

  const mappedColumns = useMemo(() => {
    return columns.map(col => {
      if (col.key === 'action') {
        return actionColumn;
      }

      // Custom rendering for profit_loss column
      if (col.key === 'profit_loss') {
        return {
          ...col,
          ellipsis: true,
          sorter: col.sorter ? (a: any, b: any) => {
            const aValue = a[col.key as string] ?? '';
            const bValue = b[col.key as string] ?? '';
            if (typeof aValue === 'string' && typeof bValue === 'string') {
              return aValue.localeCompare(bValue);
            }
            return 0;
          } : false,
          sortOrder: sorter.columnKey === col.key ? sorter.order : null,
          render: (value: number) => (
            <span style={{ color: value < 0 ? 'red' : value > 0 ? 'green' : 'black' }}>
              {value}
            </span>
          )
        };
      }

      return {
        ...col,
        ellipsis: true,
        sorter: col.sorter ? (a: any, b: any) => {
          const aValue = a[col.key as string] ?? '';
          const bValue = b[col.key as string] ?? '';
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return aValue.localeCompare(bValue);
          }
          return 0;
        } : false,
        sortOrder: sorter.columnKey === col.key ? sorter.order : null,
      };
    });
  }, [columns, sorter, onEdit, onDelete]);

  const finalColumns = useMemo(() => [indexColumn, ...mappedColumns, actionColumn], [mappedColumns]);

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            {title}
          </Title>
        </Col>
        <Col>
          {onCreate && (
            <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
              {createButtonText}
            </Button>
          )}
        </Col>
      </Row>

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder={`Search by ${String(searchKey)}`}
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => onSearch?.(e.target.value)}
          allowClear
        />
        {customFilters}
      </Space>

      <Table
        columns={finalColumns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          onChange: (page, size) => {
            onTableChange?.(page, size);
          },
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          showTotal: (total) => `Total ${total} items`,
        }}
        onChange={(_, __, sorter) => {
          let columnKey = '';
          let order: SortOrder = null;

          if (Array.isArray(sorter)) {
            if (sorter.length > 0) {
              columnKey = sorter[0]?.columnKey !== undefined ? String(sorter[0].columnKey) : '';
              order = sorter[0]?.order ?? null;
            }
          } else {
            columnKey = sorter?.columnKey !== undefined ? String(sorter.columnKey) : '';
            order = sorter?.order ?? null;
          }

          setSorter({
            columnKey,
            order,
          });
        }}

        bordered
        rowKey="key"
      />
    </div>
  );
};

export default TempTable;
