interface TableProps<T extends {}> {
  actionBar?: React.ReactNode;
  head: T;
  data: T[];
  onRowSelect: (index: number) => void;
  onSelectAll: () => void;
  selectedRows: number[];
  isSelectAllChecked: boolean;
}
