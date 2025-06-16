export interface TableColumn {
  title: string;
  dataIndex: string | string[];
  key: string;
  sortable?: boolean;
  ellipsis?: boolean;
  showEyeButton?: boolean;
  primaryKey?: boolean;
  render?: (text: string, record: any) => React.ReactNode;
}

export const USER_TABLE_COLUMNS: TableColumn[] = [
  { title: 'Unique Id', dataIndex: 'uid', key: 'uid', sortable: true },
  { title: 'Name', dataIndex: 'name', key: 'name', sortable: true },
  { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true },
  { title: 'Contact', dataIndex: 'contact', key: 'contact' },
  // { title: 'Role', dataIndex: 'role', key: 'role' },
  { 
    title: 'Status', 
    dataIndex: 'status', 
    key: 'status'
  }
];

export const SCRIPT_TABLE_COLUMNS: TableColumn[] = [
  // { title: 'ID', dataIndex: 'id', key: 'id', sortable: true },
  { title: 'Name', dataIndex: 'name', key: 'name', sortable: true },
  { title: 'Current Rate', dataIndex: 'current_rate', key: 'current_rate' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'High Value', dataIndex: 'high_value', key: 'high_value' },
  { title: 'Low Value', dataIndex: 'low_value', key: 'low_value' },
  { title: 'Volume', dataIndex: 'volume', key: 'volume' },
  { title: 'Closing Price', dataIndex: 'closing_price', key: 'closing_price' },
  { title: 'type', dataIndex: 'type', key: 'type' },
];

export const SHARE_TABLE_COLUMNS: TableColumn[] = [
  { 
    title: 'User', 
    dataIndex: ['user', 'name'], 
    key: 'user_name',
    render: (text: string, record: any) => record.user?.name || 'N/A'
  },
  { 
    title: 'Script', 
    dataIndex: ['script', 'name'], 
    key: 'script_name',
    render: (text: string, record: any) => record.script?.name || 'N/A'
  },
  { title: 'Quantity', dataIndex: 'qty', key: 'qty' },
  { title: 'Type', dataIndex: 'type', key: 'type' },
  { title: 'Price', dataIndex: 'price', key: 'price' },
  {title: 'avgPrice',dataIndex: 'avgPrice',key: 'avgPrice'},
  {title: 'profit_loss',dataIndex: 'profit_loss',key: 'profit_loss'},
  { title: 'Position', dataIndex: 'position', key: 'position' },
  
];
export const ShareHistoryTable:TableColumn[]=[
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Quantity',
      dataIndex: 'qty',
      key: 'qty',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
     {title: 'avgPrice',dataIndex: 'avgPrice',key: 'avgPrice'},
  {title: 'profit_loss',dataIndex: 'profit_loss',key: 'profit_loss'},
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
    },
   
];