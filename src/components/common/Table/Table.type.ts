interface TableProps<T extends {}> {
  actionBar?: React.ReactNode;
  head: T;
  data: T[];
}
