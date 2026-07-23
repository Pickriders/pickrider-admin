export type LinkProps = {
  path: string;
  label: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  onNavigate?: () => void;
};
